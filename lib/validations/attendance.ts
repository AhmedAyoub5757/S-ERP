import { z } from 'zod'

export const attendanceStatusEnum = z.enum(['present', 'absent', 'late', 'excused'])

export const markAttendanceSchema = z.object({
  sectionId: z.number().min(1),
  date: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: attendanceStatusEnum,
    })
  ),
})

export type MarkAttendanceValues = z.infer<typeof markAttendanceSchema>