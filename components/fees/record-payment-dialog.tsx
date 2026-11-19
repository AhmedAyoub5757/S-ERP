'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { paymentFormSchema, type PaymentFormValues } from '@/lib/validations/fee'
import { createPayment } from '@/app/dashboard/fees/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function RecordPaymentDialog({ invoiceId, maxAmount }: { invoiceId: number; maxAmount: number }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { invoiceId, amount: maxAmount, paymentMethod: undefined, referenceNumber: '', notes: '' },
  })

  async function onSubmit(values: PaymentFormValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('invoiceId', String(invoiceId))
    formData.set('amount', String(values.amount))
    formData.set('paymentMethod', values.paymentMethod)
    if (values.referenceNumber) formData.set('referenceNumber', values.referenceNumber)
    if (values.notes) formData.set('notes', values.notes)

    const result = await createPayment(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Payment recorded')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Amount (balance: Rs. {maxAmount.toLocaleString()})</FormLabel><FormControl>
                <Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="paymentMethod" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  items={[
                    { label: 'Cash', value: 'cash' },
                    { label: 'Bank Transfer', value: 'bank_transfer' },
                    { label: 'Card', value: 'card' },
                    { label: 'Cheque', value: 'cheque' },
                    { label: 'Online', value: 'online' },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="referenceNumber" render={({ field }) => (
              <FormItem><FormLabel>Reference Number</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" loading={submitting}>{submitting ? 'Saving...' : 'Record Payment'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}