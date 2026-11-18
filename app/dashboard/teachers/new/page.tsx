import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { TeacherForm } from '@/components/teachers/teacher-form'

export const dynamic = 'force-dynamic'

export default async function NewTeacherPage() {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin')) {
    redirect('/dashboard/teachers')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Teacher</h1>
      <TeacherForm />
    </div>
  )
}