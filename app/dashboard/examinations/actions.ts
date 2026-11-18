'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { examinationFormSchema, examSubjectFormSchema } from '@/lib/validations/examination'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireAdmin() {
  const roles = await getCurrentUserRoles()
  return roles.includes('school_admin')
}

export async function createExamination(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: 'Only a school admin can manage examinations.' }
  }

  const parsed = examinationFormSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: currentYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentYear) {
    return { error: 'No current academic year is set.' }
  }

  const { error } = await supabase.from('examinations').insert({
    academic_year_id: currentYear.id,
    name: parsed.data.name,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
  })

  if (error) {
    return { error: `Could not create examination: ${error.message}` }
  }

  revalidatePath('/dashboard/examinations')
  return { success: true }
}

export async function createExamSubject(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: 'Only a school admin can manage examinations.' }
  }

  const parsed = examSubjectFormSchema.safeParse({
    examinationId: Number(formData.get('examinationId')),
    subjectId: Number(formData.get('subjectId')),
    classId: Number(formData.get('classId')),
    examDate: formData.get('examDate'),
    maxMarks: Number(formData.get('maxMarks')),
    passingMarks: Number(formData.get('passingMarks')),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('exam_subjects').insert({
    examination_id: parsed.data.examinationId,
    subject_id: parsed.data.subjectId,
    class_id: parsed.data.classId,
    exam_date: parsed.data.examDate,
    max_marks: parsed.data.maxMarks,
    passing_marks: parsed.data.passingMarks,
  })

  if (error) {
    return { error: `Could not add exam subject: ${error.message}` }
  }

  revalidatePath(`/dashboard/examinations/${parsed.data.examinationId}`)
  return { success: true }
}

const saveMarksSchema = z.object({
  examSubjectId: z.number().min(1),
  records: z.array(z.object({ studentId: z.string().uuid(), marksObtained: z.number().min(0) })),
})

export async function saveMarks(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('teacher')) {
    return { error: 'You do not have permission to enter marks.' }
  }

  const examSubjectId = Number(formData.get('examSubjectId'))
  let records
  try {
    records = JSON.parse(formData.get('records') as string)
  } catch {
    return { error: 'Invalid marks data.' }
  }

  const parsed = saveMarksSchema.safeParse({ examSubjectId, records })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const rows = parsed.data.records.map((r) => ({
    exam_subject_id: parsed.data.examSubjectId,
    student_id: r.studentId,
    marks_obtained: r.marksObtained,
    entered_by: user.id,
  }))

  const { error } = await supabase.from('marks').upsert(rows, { onConflict: 'exam_subject_id,student_id' })

  if (error) {
    // Likely source: the validate_marks_within_max trigger rejecting a score over max_marks.
    return { error: `Could not save marks: ${error.message}` }
  }

  revalidatePath('/dashboard/examinations/marks')
  return { success: true }
}