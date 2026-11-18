'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { examinationFormSchema, type ExaminationFormValues } from '@/lib/validations/examination'
import { createExamination } from '@/app/dashboard/examinations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus } from 'lucide-react'

export function AddExaminationDialog() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationFormSchema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  })

  async function onSubmit(values: ExaminationFormValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('name', values.name)
    formData.set('startDate', values.startDate)
    formData.set('endDate', values.endDate)
    const result = await createExamination(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Examination created')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Examination
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Examination</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Final Examination 2026" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}