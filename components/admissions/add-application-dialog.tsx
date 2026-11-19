'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { admissionApplicationSchema, type AdmissionApplicationValues } from '@/lib/validations/admission'
import { createApplication } from '@/app/dashboard/admissions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option { id: number; name: string }

const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

export function AddApplicationDialog({ classes }: { classes: Option[] }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<AdmissionApplicationValues>({
    resolver: zodResolver(admissionApplicationSchema),
    defaultValues: {
      applicantName: '',
      dateOfBirth: '',
      gender: 'male',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      applyingForClassId: undefined,
      notes: '',
    },
  })

  async function onSubmit(values: AdmissionApplicationValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('applicantName', values.applicantName)
    formData.set('dateOfBirth', values.dateOfBirth)
    formData.set('gender', values.gender)
    formData.set('guardianName', values.guardianName)
    formData.set('guardianPhone', values.guardianPhone)
    formData.set('guardianEmail', values.guardianEmail ?? '')
    formData.set('applyingForClassId', String(values.applyingForClassId))
    formData.set('notes', values.notes ?? '')

    const result = await createApplication(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Application submitted')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Application
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Admission Application</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="applicantName" render={({ field }) => (
              <FormItem><FormLabel>Applicant Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select items={GENDERS} value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{GENDERS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="applyingForClassId" render={({ field }) => (
              <FormItem>
                <FormLabel>Applying For Class</FormLabel>
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
            <FormField control={form.control} name="guardianName" render={({ field }) => (
              <FormItem><FormLabel>Guardian Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianPhone" render={({ field }) => (
              <FormItem><FormLabel>Guardian Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianEmail" render={({ field }) => (
              <FormItem><FormLabel>Guardian Email (optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes (optional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" loading={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}