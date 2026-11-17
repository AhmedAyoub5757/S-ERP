import { z } from 'zod'

export const studentFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  sectionId: z.number().min(1, 'Section is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>

export const studentUpdateSchema = studentFormSchema
  .omit({ email: true })
  .extend({
    status: z.enum(['active', 'inactive', 'graduated', 'transferred']),
  })

export type StudentUpdateValues = z.infer<typeof studentUpdateSchema>