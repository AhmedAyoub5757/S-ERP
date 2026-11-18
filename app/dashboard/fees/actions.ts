'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { feeStructureFormSchema, paymentFormSchema } from '@/lib/validations/fee'
import { revalidatePath } from 'next/cache'

async function requireFinance() {
  const roles = await getCurrentUserRoles()
  return roles.includes('school_admin') || roles.includes('accountant')
}

export async function createFeeStructure(formData: FormData) {
  if (!(await requireFinance())) {
    return { error: 'You do not have permission to manage fee structures.' }
  }

  const parsed = feeStructureFormSchema.safeParse({
    classId: Number(formData.get('classId')),
    name: formData.get('name'),
    amount: Number(formData.get('amount')),
    frequency: formData.get('frequency'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: currentYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentYear) {
    return { error: 'No current academic year is set.' }
  }

  const { error } = await supabase.from('fee_structures').insert({
    academic_year_id: currentYear.id,
    class_id: parsed.data.classId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    frequency: parsed.data.frequency,
  })

  if (error) {
    return { error: `Could not create fee structure: ${error.message}` }
  }

  revalidatePath('/dashboard/fees')
  return { success: true }
}

export async function generateInvoices(formData: FormData) {
  if (!(await requireFinance())) {
    return { error: 'You do not have permission to generate invoices.' }
  }

  const feeStructureId = Number(formData.get('feeStructureId'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: feeStructure } = await supabase
    .from('fee_structures')
    .select('id, class_id, name, amount')
    .eq('id', feeStructureId)
    .single()

  if (!feeStructure) {
    return { error: 'Fee structure not found.' }
  }

  const { data: sections } = await supabase.from('sections').select('id').eq('class_id', feeStructure.class_id)
  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .in('section_id', sectionIds)
    .eq('status', 'active')

  const { data: existingItems } = await supabase
    .from('invoice_items')
    .select('invoice_id, invoices!inner(student_id)')
    .eq('fee_structure_id', feeStructureId)

  const existingStudentIds = new Set((existingItems ?? []).map((i: any) => i.invoices.student_id))
  const studentsToInvoice = (students ?? []).filter((s) => !existingStudentIds.has(s.id))

  if (studentsToInvoice.length === 0) {
    return { error: 'All eligible students already have an invoice for this fee.' }
  }

  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + 30)
  const issueDateStr = today.toISOString().split('T')[0]
  const dueDateStr = dueDate.toISOString().split('T')[0]

  let created = 0
  for (const student of studentsToInvoice) {
    const invoiceNumber = `INV-${Date.now()}-${student.id.slice(0, 6)}`
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        student_id: student.id,
        invoice_number: invoiceNumber,
        issue_date: issueDateStr,
        due_date: dueDateStr,
        total_amount: feeStructure.amount,
        status: 'unpaid',
        created_by: user.id,
      })
      .select()
      .single()

    if (invError || !invoice) continue

    await supabase.from('invoice_items').insert({
      invoice_id: invoice.id,
      fee_structure_id: feeStructure.id,
      description: feeStructure.name,
      amount: feeStructure.amount,
    })
    created++
  }

  revalidatePath('/dashboard/fees')
  revalidatePath('/dashboard/fees/invoices')
  return { success: true, created }
}

export async function createPayment(formData: FormData) {
  if (!(await requireFinance())) {
    return { error: 'You do not have permission to record payments.' }
  }

  const parsed = paymentFormSchema.safeParse({
    invoiceId: Number(formData.get('invoiceId')),
    amount: Number(formData.get('amount')),
    paymentMethod: formData.get('paymentMethod'),
    referenceNumber: formData.get('referenceNumber') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, total_amount')
    .eq('id', parsed.data.invoiceId)
    .single()

  if (!invoice) {
    return { error: 'Invoice not found.' }
  }

  const { error: payError } = await supabase.from('payments').insert({
    invoice_id: parsed.data.invoiceId,
    amount: parsed.data.amount,
    payment_method: parsed.data.paymentMethod,
    reference_number: parsed.data.referenceNumber ?? null,
    notes: parsed.data.notes ?? null,
    received_by: user.id,
  })

  if (payError) {
    return { error: `Could not record payment: ${payError.message}` }
  }

  const { data: payments } = await supabase.from('payments').select('amount').eq('invoice_id', parsed.data.invoiceId)
  const totalPaid = (payments ?? []).reduce((sum, p: any) => sum + Number(p.amount), 0)
  const newStatus = totalPaid >= Number(invoice.total_amount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid'

  await supabase.from('invoices').update({ status: newStatus }).eq('id', parsed.data.invoiceId)

  revalidatePath(`/dashboard/fees/invoices/${parsed.data.invoiceId}`)
  revalidatePath('/dashboard/fees/invoices')
  return { success: true }
}