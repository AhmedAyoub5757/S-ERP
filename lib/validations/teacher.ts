import { z } from 'zod'

export const teacherFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  qualification: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
})
export type TeacherFormValues = z.infer<typeof teacherFormSchema>

export const teacherUpdateSchema = teacherFormSchema.omit({ email: true }).extend({
  status: z.enum(['active', 'inactive', 'suspended']),
})
export type TeacherUpdateValues = z.infer<typeof teacherUpdateSchema>