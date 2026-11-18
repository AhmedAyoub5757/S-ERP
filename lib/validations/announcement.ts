import { z } from 'zod'

export const announcementSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    audience: z.enum(['all', 'teachers', 'students', 'parents', 'specific_class', 'specific_section']),
    targetClassId: z.number().optional(),
    targetSectionId: z.number().optional(),
  })
  .refine((data) => data.audience !== 'specific_class' || !!data.targetClassId, {
    message: 'Select a class',
    path: ['targetClassId'],
  })
  .refine((data) => data.audience !== 'specific_section' || !!data.targetSectionId, {
    message: 'Select a section',
    path: ['targetSectionId'],
  })

export type AnnouncementValues = z.infer<typeof announcementSchema>