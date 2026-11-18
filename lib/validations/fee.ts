import { z } from 'zod'

export const feeStructureFormSchema = z.object({
  classId: z.number().min(1, 'Class is required'),
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(1, 'Amount is required'),
  frequency: z.enum(['monthly', 'term', 'annual', 'one_time']),
})
export type FeeStructureFormValues = z.infer<typeof feeStructureFormSchema>

export const paymentFormSchema = z.object({
  invoiceId: z.number().min(1),
  amount: z.number().min(1, 'Amount is required'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card', 'cheque', 'online']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})
export type PaymentFormValues = z.infer<typeof paymentFormSchema>