import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { StudentForm, type SectionOption } from '@/components/students/student-form'

export const dynamic = 'force-dynamic'

export default async function NewStudentPage() {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('receptionist')) {
    redirect('/dashboard/students')
  }

  const supabase = await createClient()
  const { data: sections } = await supabase
    .from('sections')
    .select('id, name, classes ( name )')
    .order('class_id')

  const sectionOptions: SectionOption[] = (sections ?? []).map((s: any) => ({
    id: s.id,
    label: `${s.classes?.name ?? ''} - ${s.name}`,
  }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Student</h1>
      <StudentForm sections={sectionOptions} />
    </div>
  )
}