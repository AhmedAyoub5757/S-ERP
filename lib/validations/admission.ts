import { z } from 'zod'

export const admissionApplicationSchema = z.object({
  applicantName: z.string().min(1, 'Applicant name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
  guardianEmail: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  applyingForClassId: z.number().min(1, 'Class is required'),
  notes: z.string().optional(),
})
export type AdmissionApplicationValues = z.infer<typeof admissionApplicationSchema>

export const reviewDecisionSchema = z.object({
  applicationId: z.number().min(1),
  decision: z.enum(['approved', 'rejected']),
})
export type ReviewDecisionValues = z.infer<typeof reviewDecisionSchema>

export const enrollApplicationSchema = z.object({
  applicationId: z.number().min(1),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  sectionId: z.number().min(1, 'Section is required'),
  studentEmail: z.string().email('Enter a valid student email'),
  parentEmail: z.string().email('Enter a valid guardian email'),
  parentPhone: z.string().min(1, 'Guardian phone is required'),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
})
export type EnrollApplicationValues = z.infer<typeof enrollApplicationSchema>