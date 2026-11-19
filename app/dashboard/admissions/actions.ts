'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { admissionApplicationSchema, reviewDecisionSchema } from '@/lib/validations/admission'
import { revalidatePath } from 'next/cache'

function canManageAdmissions(roles: string[]) {
  return roles.includes('receptionist') || roles.includes('school_admin')
}

export async function createApplication(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!canManageAdmissions(roles)) {
    return { error: 'You are not allowed to submit applications.' }
  }

  const guardianEmailRaw = formData.get('guardianEmail') as string
  const parsed = admissionApplicationSchema.safeParse({
    applicantName: formData.get('applicantName'),
    dateOfBirth: formData.get('dateOfBirth'),
    gender: formData.get('gender'),
    guardianName: formData.get('guardianName'),
    guardianPhone: formData.get('guardianPhone'),
    guardianEmail: guardianEmailRaw || '',
    applyingForClassId: Number(formData.get('applyingForClassId')),
    notes: (formData.get('notes') as string) || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('admission_applications').insert({
    applicant_name: parsed.data.applicantName,
    date_of_birth: parsed.data.dateOfBirth,
    gender: parsed.data.gender,
    guardian_name: parsed.data.guardianName,
    guardian_phone: parsed.data.guardianPhone,
    guardian_email: parsed.data.guardianEmail || null,
    applying_for_class_id: parsed.data.applyingForClassId,
    notes: parsed.data.notes || null,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admissions')
  return { success: true }
}

export async function reviewApplication(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!canManageAdmissions(roles)) {
    return { error: 'You are not allowed to review applications.' }
  }

  const parsed = reviewDecisionSchema.safeParse({
    applicationId: Number(formData.get('applicationId')),
    decision: formData.get('decision'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('admission_applications')
    .select('status')
    .eq('id', parsed.data.applicationId)
    .single()

  if (!existing || existing.status !== 'pending') {
    return { error: 'Only a pending application can be reviewed.' }
  }

  const { error } = await supabase
    .from('admission_applications')
    .update({
      status: parsed.data.decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.applicationId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admissions')
  return { success: true }
}