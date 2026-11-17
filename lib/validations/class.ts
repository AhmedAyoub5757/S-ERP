import { z } from 'zod'

export const classFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
})

export const sectionFormSchema = z.object({
  classId: z.number().min(1, 'Class is required'),
  name: z.string().min(1, 'Section name is required'),
  capacity: z.number().min(1).max(100).optional(),
  classTeacherId: z.string().optional(),
})

export type ClassFormValues = z.infer<typeof classFormSchema>
export type SectionFormValues = z.infer<typeof sectionFormSchema>