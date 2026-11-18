import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { SectionDatePicker } from '@/components/attendance/section-date-picker'
import { AttendanceForm } from '@/components/attendance/attendance-form'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ sectionId?: string; date?: string }>
}) {
  const { sectionId, date } = await searchParams
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!roles.includes('school_admin') && !roles.includes('principal') && !roles.includes('teacher')) {
    redirect('/dashboard')
  }

  const isAdmin = roles.includes('school_admin')
  const editable = isAdmin || roles.includes('teacher')

  let sectionOptions: { id: number; label: string }[] = []

  if (isAdmin || roles.includes('principal')) {
    const { data: sections } = await supabase
      .from('sections')
      .select('id, name, classes ( name )')
      .order('class_id')
    sectionOptions = (sections ?? []).map((s: any) => ({
      id: s.id,
      label: `${s.classes?.name ?? ''} - ${s.name}`,
    }))
  } else if (roles.includes('teacher') && user) {
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('sections ( id, name, classes ( name ) )')
      .eq('teacher_id', user.id)
    const { data: homeroomSections } = await supabase
      .from('sections')
      .select('id, name, classes ( name )')
      .eq('class_teacher_id', user.id)

    const map = new Map<number, { id: number; label: string }>()
    ;(assignments ?? []).forEach((a: any) => {
      if (a.sections) {
        map.set(a.sections.id, { id: a.sections.id, label: `${a.sections.classes?.name ?? ''} - ${a.sections.name}` })
      }
    })
    ;(homeroomSections ?? []).forEach((s: any) => {
      map.set(s.id, { id: s.id, label: `${s.classes?.name ?? ''} - ${s.name}` })
    })
    sectionOptions = Array.from(map.values())
  }

  const today = new Date().toISOString().split('T')[0]
  const selectedSectionId = sectionId ? Number(sectionId) : undefined
  const selectedDate = date ?? today

  let roster: any[] = []
  if (selectedSectionId) {
    const { data: students } = await supabase
      .from('students')
      .select('id, admission_number, profiles ( full_name )')
      .eq('section_id', selectedSectionId)
      .order('admission_number')

    const { data: existing } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('section_id', selectedSectionId)
      .eq('date', selectedDate)

    const existingMap = new Map((existing ?? []).map((e: any) => [e.student_id, e.status]))

    roster = (students ?? []).map((s: any) => ({
      id: s.id,
      fullName: s.profiles?.full_name ?? 'Unknown',
      admissionNumber: s.admission_number,
      status: existingMap.get(s.id) ?? 'present',
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Mark or review daily attendance by section.</p>
      </div>

      <SectionDatePicker sections={sectionOptions} defaultSectionId={selectedSectionId} defaultDate={selectedDate} />

      {selectedSectionId ? (
        roster.length > 0 ? (
          <AttendanceForm sectionId={selectedSectionId} date={selectedDate} students={roster} editable={editable} />
        ) : (
          <p className="text-muted-foreground">No students found in this section.</p>
        )
      ) : (
        <p className="text-muted-foreground">Select a section and date to begin.</p>
      )}
    </div>
  )
}