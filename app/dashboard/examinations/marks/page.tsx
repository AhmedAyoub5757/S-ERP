import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { MarksEntryPicker } from '@/components/examinations/marks-entry-picker'
import { MarksEntryForm } from '@/components/examinations/marks-entry-form'

export const dynamic = 'force-dynamic'

export default async function MarksEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ examinationId?: string; examSubjectId?: string }>
}) {
  const { examinationId, examSubjectId } = await searchParams
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!roles.includes('school_admin') && !roles.includes('teacher')) {
    redirect('/dashboard')
  }

  const { data: examinations } = await supabase
    .from('examinations')
    .select('id, name')
    .order('start_date', { ascending: false })

  let examSubjectOptions: { id: number; label: string; sectionId: number }[] = []

  if (examinationId) {
    if (roles.includes('school_admin')) {
      const { data } = await supabase
        .from('exam_subjects')
        .select('id, subjects ( name ), classes ( id, name )')
        .eq('examination_id', examinationId)
      for (const es of data ?? []) {
        const { data: sec } = await supabase
          .from('sections')
          .select('id')
          .eq('class_id', (es as any).classes.id)
          .limit(1)
          .single()
        if (sec) {
          examSubjectOptions.push({
            id: (es as any).id,
            label: `${(es as any).subjects?.name} — ${(es as any).classes?.name}`,
            sectionId: sec.id,
          })
        }
      }
    } else if (user) {
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('subject_id, sections ( id, name, class_id, classes ( name ) )')
        .eq('teacher_id', user.id)

      for (const a of assignments ?? []) {
        const section = (a as any).sections
        if (!section) continue
        const { data: es } = await supabase
          .from('exam_subjects')
          .select('id, subjects ( name )')
          .eq('examination_id', examinationId)
          .eq('subject_id', (a as any).subject_id)
          .eq('class_id', section.class_id)
          .maybeSingle()
        if (es) {
          examSubjectOptions.push({
            id: (es as any).id,
            label: `${(es as any).subjects?.name} — ${section.classes?.name} ${section.name}`,
            sectionId: section.id,
          })
        }
      }
    }
  }

  let roster: any[] = []
  let maxMarks = 100
  const selected = examSubjectOptions.find((o) => String(o.id) === examSubjectId)

  if (selected) {
    const { data: students } = await supabase
      .from('students')
      .select('id, admission_number, profiles ( full_name )')
      .eq('section_id', selected.sectionId)
      .order('admission_number')

    const { data: existingMarks } = await supabase
      .from('marks')
      .select('student_id, marks_obtained')
      .eq('exam_subject_id', selected.id)

    const { data: esInfo } = await supabase
      .from('exam_subjects')
      .select('max_marks')
      .eq('id', selected.id)
      .single()
    maxMarks = esInfo?.max_marks ?? 100

    const existingMap = new Map((existingMarks ?? []).map((m: any) => [m.student_id, m.marks_obtained]))

    roster = (students ?? []).map((s: any) => ({
      id: s.id,
      fullName: s.profiles?.full_name ?? 'Unknown',
      admissionNumber: s.admission_number,
      marksObtained: existingMap.get(s.id) ?? '',
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enter Marks</h1>
        <p className="text-muted-foreground">Select an examination and subject to enter marks.</p>
      </div>

      <MarksEntryPicker
        examinations={(examinations ?? []).map((e) => ({ id: e.id, name: e.name }))}
        examSubjects={examSubjectOptions.map((o) => ({ id: o.id, label: o.label }))}
        defaultExaminationId={examinationId ? Number(examinationId) : undefined}
        defaultExamSubjectId={examSubjectId ? Number(examSubjectId) : undefined}
      />

      {selected ? (
        roster.length > 0 ? (
          <MarksEntryForm examSubjectId={selected.id} maxMarks={maxMarks} students={roster} />
        ) : (
          <p className="text-muted-foreground">No students found for this section.</p>
        )
      ) : examinationId ? (
        <p className="text-muted-foreground">No matching subject/section assignment found for you in this examination.</p>
      ) : (
        <p className="text-muted-foreground">Select an examination to begin.</p>
      )}
    </div>
  )
}