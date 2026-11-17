'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { classFormSchema, sectionFormSchema } from '@/lib/validations/class'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const roles = await getCurrentUserRoles()
  return roles.includes('school_admin')
}

export async function createClass(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: 'You do not have permission to manage classes.' }
  }

  const parsed = classFormSchema.safeParse({ name: formData.get('name') })
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

  const { error } = await supabase.from('classes').insert({
    academic_year_id: currentYear.id,
    name: parsed.data.name,
  })

  if (error) {
    return { error: `Could not create class: ${error.message}` }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function createSection(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: 'You do not have permission to manage sections.' }
  }

  const parsed = sectionFormSchema.safeParse({
    classId: Number(formData.get('classId')),
    name: formData.get('name'),
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : undefined,
    classTeacherId: formData.get('classTeacherId') || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('sections').insert({
    class_id: parsed.data.classId,
    name: parsed.data.name,
    capacity: parsed.data.capacity ?? null,
    class_teacher_id: parsed.data.classTeacherId ?? null,
  })

  if (error) {
    return { error: `Could not create section: ${error.message}` }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function updateSectionTeacher(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: 'You do not have permission to manage sections.' }
  }

  const sectionId = Number(formData.get('sectionId'))
  const classTeacherId = (formData.get('classTeacherId') as string) || null
  const capacity = formData.get('capacity') ? Number(formData.get('capacity')) : null

  const supabase = await createClient()
  const { error } = await supabase
    .from('sections')
    .update({ class_teacher_id: classTeacherId, capacity })
    .eq('id', sectionId)

  if (error) {
    return { error: `Could not update section: ${error.message}` }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}