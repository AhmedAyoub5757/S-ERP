import { z } from 'zod'

export const timetableSlotSchema = z.object({
  sectionId: z.number().min(1),
  subjectId: z.number().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
})
export type TimetableSlotValues = z.infer<typeof timetableSlotSchema>