'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { studentFormSchema } from '@/lib/validations/student'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DEFAULT_STUDENT_PASSWORD = 'Student@123'

export async function createStudent(formData: FormData) {
  // No RLS exists for auth.admin.* calls, so this Server Action is the
  // real enforcement boundary for that one operation. Everything after
  // it uses the normal RLS-respecting client.
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('receptionist')) {
    return { error: 'You do not have permission to add students.' }
  }

  const raw = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    admissionNumber: formData.get('admissionNumber'),
    sectionId: formData.get('sectionId'),
    dateOfBirth: formData.get('dateOfBirth'),
    gender: formData.get('gender'),
    bloodGroup: formData.get('bloodGroup') || undefined,
    address: formData.get('address') || undefined,
  }

  const parsed = studentFormSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const data = parsed.data

  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: DEFAULT_STUDENT_PASSWORD,
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

  const { error: studentError } = await supabase.from('students').insert({
    id: newUserId,
    admission_number: data.admissionNumber,
    section_id: data.sectionId,
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
    blood_group: data.bloodGroup ?? null,
    address: data.address ?? null,
    status: 'active',
  })

  if (studentError) {
    await adminClient.auth.admin.deleteUser(newUserId)
    return { error: `Could not create student record: ${studentError.message}` }
  }

  const { data: roleRow } = await supabase.from('roles').select('id').eq('name', 'student').single()
  if (roleRow) {
    await supabase.from('user_roles').insert({ user_id: newUserId, role_id: roleRow.id })
  }

  revalidatePath('/dashboard/students')
  redirect('/dashboard/students')
}