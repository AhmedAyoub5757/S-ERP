import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect, notFound } from 'next/navigation'
import { StudentEditForm, type SectionOption, type StudentEditDefaults } from '@/components/students/student-edit-form'

export const dynamic = 'force-dynamic'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('receptionist')) {
    redirect(`/dashboard/students/${id}`)
  }

  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select(`
      id,
      admission_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      status,
      section_id,
      profiles ( full_name, email, phone )
    `)
    .eq('id', id)
    .single()

  if (!student) {
    notFound()
  }

  const { data: sections } = await supabase
    .from('sections')
    .select('id, name, classes ( name )')
    .order('class_id')

  const sectionOptions: SectionOption[] = (sections ?? []).map((s: any) => ({
    id: s.id,
    label: `${s.classes?.name ?? ''} - ${s.name}`,
  }))

  const profile = (student as any).profiles

  const defaults: StudentEditDefaults = {
    email: profile?.email ?? '',
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    admissionNumber: student.admission_number,
    sectionId: student.section_id,
    dateOfBirth: student.date_of_birth,
    gender: student.gender,
    bloodGroup: student.blood_group ?? '',
    address: student.address ?? '',
    status: student.status,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Student</h1>
      <StudentEditForm studentId={id} sections={sectionOptions} defaults={defaults} />
    </div>
  )
}