import { z } from 'zod'

export const examinationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})
export type ExaminationFormValues = z.infer<typeof examinationFormSchema>

export const examSubjectFormSchema = z.object({
  examinationId: z.number().min(1),
  subjectId: z.number().min(1, 'Subject is required'),
  classId: z.number().min(1, 'Class is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  maxMarks: z.number().min(1, 'Max marks required'),
  passingMarks: z.number().min(0, 'Passing marks required'),
})
export type ExamSubjectFormValues = z.infer<typeof examSubjectFormSchema>