'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { teacherFormSchema, teacherUpdateSchema } from '@/lib/validations/teacher'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DEFAULT_TEACHER_PASSWORD = 'Teacher@123'

export async function createTeacher(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin')) {
    return { error: 'Only a school admin can add teachers.' }
  }

  const parsed = teacherFormSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    employeeNumber: formData.get('employeeNumber'),
    qualification: formData.get('qualification') || undefined,
    joiningDate: formData.get('joiningDate'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const data = parsed.data

  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: DEFAULT_TEACHER_PASSWORD,
    email_confirm: true,
  })
  if (userError || !userData.user) {
    return { error: `Could not create login: ${userError?.message}` }
  }
  const newUserId = userData.user.id
  const supabase = await createClient()

  const { error: profileError } = await supabase.from('profiles').insert({
    id: newUserId,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
  })
  if (profileError) {
    await adminClient.auth.admin.deleteUser(newUserId)
    return { error: `Could not create profile: ${profileError.message}` }
  }

  const { error: teacherError } = await supabase.from('teachers').insert({
    id: newUserId,
    employee_number: data.employeeNumber,
    qualification: data.qualification ?? null,
    joining_date: data.joiningDate,
  })
  if (teacherError) {
    await adminClient.auth.admin.deleteUser(newUserId)
    return { error: `Could not create teacher record: ${teacherError.message}` }
  }

  const { data: roleRow } = await supabase.from('roles').select('id').eq('name', 'teacher').single()
  if (roleRow) {
    await supabase.from('user_roles').insert({ user_id: newUserId, role_id: roleRow.id })
  }

  revalidatePath('/dashboard/teachers')
  redirect('/dashboard/teachers')
}

export async function updateTeacher(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin')) {
    return { error: 'Only a school admin can edit teachers.' }
  }

  const teacherId = formData.get('teacherId') as string

  const parsed = teacherUpdateSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
    employeeNumber: formData.get('employeeNumber'),
    qualification: formData.get('qualification') || undefined,
    joiningDate: formData.get('joiningDate'),
    status: formData.get('status'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const data = parsed.data
  const supabase = await createClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: data.fullName, phone: data.phone ?? null, status: data.status })
    .eq('id', teacherId)
  if (profileError) {
    return { error: `Could not update profile: ${profileError.message}` }
  }

  const { error: teacherError } = await supabase
    .from('teachers')
    .update({
      employee_number: data.employeeNumber,
      qualification: data.qualification ?? null,
      joining_date: data.joiningDate,
    })
    .eq('id', teacherId)
  if (teacherError) {
    return { error: `Could not update teacher record: ${teacherError.message}` }
  }

  revalidatePath(`/dashboard/teachers/${teacherId}`)
  revalidatePath('/dashboard/teachers')
  redirect(`/dashboard/teachers/${teacherId}`)
}