'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { feeStructureFormSchema, type FeeStructureFormValues } from '@/lib/validations/fee'
import { createFeeStructure } from '@/app/dashboard/fees/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option { id: number; name: string }

export function AddFeeStructureDialog({ classes }: { classes: Option[] }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: { classId: undefined, name: '', amount: 0, frequency: undefined },
  })

  async function onSubmit(values: FeeStructureFormValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('classId', String(values.classId))
    formData.set('name', values.name)
    formData.set('amount', String(values.amount))
    formData.set('frequency', values.frequency)

    const result = await createFeeStructure(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Fee structure created')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Fee Structure
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Fee Structure</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="classId" render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select
                  items={classes.map((c) => ({ label: c.name, value: String(c.id) }))}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Tuition Fee - Term 2" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Amount</FormLabel><FormControl>
                <Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="frequency" render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select
                  items={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Term', value: 'term' },
                    { label: 'Annual', value: 'annual' },
                    { label: 'One-time', value: 'one_time' },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="term">Term</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}