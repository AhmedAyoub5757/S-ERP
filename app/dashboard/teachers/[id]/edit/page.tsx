import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect, notFound } from 'next/navigation'
import { TeacherEditForm, type TeacherEditDefaults } from '@/components/teachers/teacher-edit-form'

export const dynamic = 'force-dynamic'

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin')) {
    redirect(`/dashboard/teachers/${id}`)
  }

  const supabase = await createClient()
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, employee_number, qualification, joining_date, profiles ( full_name, email, phone, status )')
    .eq('id', id)
    .single()

  if (!teacher) {
    notFound()
  }

  const profile = (teacher as any).profiles

  const defaults: TeacherEditDefaults = {
    email: profile?.email ?? '',
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    employeeNumber: teacher.employee_number,
    qualification: teacher.qualification ?? '',
    joiningDate: teacher.joining_date,
    status: profile?.status,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Teacher</h1>
      <TeacherEditForm teacherId={id} defaults={defaults} />
    </div>
  )
}