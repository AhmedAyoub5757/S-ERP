'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { admissionApplicationSchema, reviewDecisionSchema } from '@/lib/validations/admission'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { enrollApplicationSchema } from '@/lib/validations/admission'

const DEFAULT_STUDENT_PASSWORD = 'Student@123'
const DEFAULT_PARENT_PASSWORD = 'Parent@123'

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

export async function enrollApplication(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!canManageAdmissions(roles)) {
    return { error: 'You are not allowed to enroll applications.' }
  }

  const parsed = enrollApplicationSchema.safeParse({
    applicationId: Number(formData.get('applicationId')),
    admissionNumber: String(formData.get('admissionNumber') ?? '').trim(),
    sectionId: Number(formData.get('sectionId')),
    studentEmail: String(formData.get('studentEmail') ?? '').trim(),
    parentEmail: String(formData.get('parentEmail') ?? '').trim(),
    parentPhone: String(formData.get('parentPhone') ?? '').trim(),
    bloodGroup: String(formData.get('bloodGroup') ?? '').trim() || undefined,
    address: String(formData.get('address') ?? '').trim() || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: application, error: applicationError } = await supabase
    .from('admission_applications')
    .select('id, applicant_name, date_of_birth, gender, guardian_name, guardian_phone, guardian_email, applying_for_class_id, status')
    .eq('id', parsed.data.applicationId)
    .single()

  if (applicationError || !application) {
    return { error: 'Application not found.' }
  }
  if (application.status !== 'approved') {
    return { error: 'Only an approved application can be enrolled.' }
  }

  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select('id, class_id')
    .eq('id', parsed.data.sectionId)
    .single()

  if (sectionError || !section) {
    return { error: 'Section not found.' }
  }
  if (section.class_id !== application.applying_for_class_id) {
    return { error: 'The selected section must belong to the applied-for class.' }
  }

  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .eq('admission_number', parsed.data.admissionNumber)
    .maybeSingle()
  if (existingStudent) {
    return { error: 'This admission number is already in use.' }
  }

  const { data: existingStudentProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', parsed.data.studentEmail)
    .maybeSingle()
  if (existingStudentProfile) {
    return { error: 'A profile already exists with the student email.' }
  }

  let newParentAuthId: string | null = null
  let newStudentAuthId: string | null = null
  let parentId: string | null = null

  try {
    const { data: existingParentProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', parsed.data.parentEmail)
      .maybeSingle()

    if (existingParentProfile) {
      parentId = existingParentProfile.id
    } else {
      const { data: parentAuth, error: parentAuthError } = await adminClient.auth.admin.createUser({
        email: parsed.data.parentEmail,
        password: DEFAULT_PARENT_PASSWORD,
        email_confirm: true,
      })
      if (parentAuthError || !parentAuth.user) {
        return { error: `Could not create parent login: ${parentAuthError?.message ?? 'Unknown error'}` }
      }

      parentId = parentAuth.user.id
      newParentAuthId = parentAuth.user.id

      const { error: parentProfileError } = await supabase.from('profiles').insert({
        id: parentId,
        full_name: application.guardian_name,
        email: parsed.data.parentEmail,
        phone: parsed.data.parentPhone,
      })
      if (parentProfileError) {
        await adminClient.auth.admin.deleteUser(parentId)
        newParentAuthId = null
        return { error: `Could not create parent profile: ${parentProfileError.message}` }
      }
    }

    const { data: parentRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'parent')
      .single()
    if (!parentRole) {
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: 'The parent role is missing.' }
    }

    const { error: parentRoleError } = await supabase.from('user_roles').upsert(
      { user_id: parentId, role_id: parentRole.id },
      { onConflict: 'user_id,role_id', ignoreDuplicates: true }
    )
    if (parentRoleError) {
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not assign the parent role: ${parentRoleError.message}` }
    }

    const { error: parentRowError } = await supabase.from('parents').upsert(
      { id: parentId, occupation: null },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    if (parentRowError) {
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not create parent record: ${parentRowError.message}` }
    }

    const { data: studentAuth, error: studentAuthError } = await adminClient.auth.admin.createUser({
      email: parsed.data.studentEmail,
      password: DEFAULT_STUDENT_PASSWORD,
      email_confirm: true,
    })
    if (studentAuthError || !studentAuth.user) {
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not create student login: ${studentAuthError?.message ?? 'Unknown error'}` }
    }

    newStudentAuthId = studentAuth.user.id

    const { error: studentProfileError } = await supabase.from('profiles').insert({
      id: newStudentAuthId,
      full_name: application.applicant_name,
      email: parsed.data.studentEmail,
      phone: null,
    })
    if (studentProfileError) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      newStudentAuthId = null
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not create student profile: ${studentProfileError.message}` }
    }

    const { data: studentRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .single()
    if (!studentRole) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: 'The student role is missing.' }
    }

    const { error: studentRoleError } = await supabase.from('user_roles').upsert(
      { user_id: newStudentAuthId, role_id: studentRole.id },
      { onConflict: 'user_id,role_id', ignoreDuplicates: true }
    )
    if (studentRoleError) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      newStudentAuthId = null
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not assign the student role: ${studentRoleError.message}` }
    }

    const { error: studentError } = await supabase.from('students').insert({
      id: newStudentAuthId,
      admission_number: parsed.data.admissionNumber,
      section_id: parsed.data.sectionId,
      admission_date: new Date().toISOString().slice(0, 10),
      date_of_birth: application.date_of_birth,
      gender: application.gender,
      blood_group: parsed.data.bloodGroup ?? null,
      address: parsed.data.address ?? null,
      status: 'active',
    })
    if (studentError) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      newStudentAuthId = null
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not create student record: ${studentError.message}` }
    }

    const { error: parentStudentError } = await supabase.from('parent_students').insert({
      parent_id: parentId,
      student_id: newStudentAuthId,
      relationship: 'Guardian',
    })
    if (parentStudentError) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      newStudentAuthId = null
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not link parent to student: ${parentStudentError.message}` }
    }

    const { error: enrolledError } = await supabase
      .from('admission_applications')
      .update({
        status: 'enrolled',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.applicationId)
      .eq('status', 'approved')

    if (enrolledError) {
      await adminClient.auth.admin.deleteUser(newStudentAuthId)
      if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
      return { error: `Could not finalize enrollment: ${enrolledError.message}` }
    }

    revalidatePath('/dashboard/admissions')
    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard')

    return {
      success: true,
      studentId: newStudentAuthId,
      studentPassword: DEFAULT_STUDENT_PASSWORD,
      parentPassword: DEFAULT_PARENT_PASSWORD,
      reusedParentAccount: !newParentAuthId,
    }
  } catch (error) {
    if (newStudentAuthId) await adminClient.auth.admin.deleteUser(newStudentAuthId)
    if (newParentAuthId) await adminClient.auth.admin.deleteUser(newParentAuthId)
    return { error: error instanceof Error ? error.message : 'Enrollment failed.' }
  }
}