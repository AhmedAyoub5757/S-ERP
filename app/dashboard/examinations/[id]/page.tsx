import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { notFound } from 'next/navigation'
import { AddExamSubjectDialog } from '@/components/examinations/add-exam-subject-dialog'

export const dynamic = 'force-dynamic'

export default async function ExaminationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const isAdmin = roles.includes('school_admin')

  const { data: examination } = await supabase
    .from('examinations')
    .select('id, name, start_date, end_date')
    .eq('id', id)
    .single()

  if (!examination) notFound()

  const { data: examSubjects } = await supabase
    .from('exam_subjects')
    .select('id, exam_date, max_marks, passing_marks, subjects ( name ), classes ( name )')
    .eq('examination_id', id)
    .order('exam_date')

  const { data: subjects } = await supabase.from('subjects').select('id, name').order('name')
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{examination.name}</h1>
          <p className="text-muted-foreground">{examination.start_date} – {examination.end_date}</p>
        </div>
        {isAdmin && (
          <AddExamSubjectDialog
            examinationId={Number(id)}
            subjects={(subjects ?? []).map((s) => ({ id: s.id, name: s.name }))}
            classes={(classes ?? []).map((c) => ({ id: c.id, name: c.name }))}
          />
        )}
      </div>

      <div className="divide-y rounded-md border">
        {(examSubjects ?? []).map((es: any) => (
          <div key={es.id} className="flex items-center justify-between p-3 text-sm">
            <div>
              <p className="font-medium">{es.subjects?.name} — {es.classes?.name}</p>
              <p className="text-muted-foreground">{es.exam_date}</p>
            </div>
            <p className="text-muted-foreground">Max: {es.max_marks} · Pass: {es.passing_marks}</p>
          </div>
        ))}
        {(!examSubjects || examSubjects.length === 0) && (
          <p className="p-3 text-sm text-muted-foreground">No subjects added yet.</p>
        )}
      </div>
    </div>
  )
}