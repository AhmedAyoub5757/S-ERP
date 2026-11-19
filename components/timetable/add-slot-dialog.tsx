'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { timetableSlotSchema, type TimetableSlotValues } from '@/lib/validations/timetable'
import { createTimetableSlot } from '@/app/dashboard/timetable/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option { id: number | string; name: string }

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
]

export function AddSlotDialog({ sectionId, teachers, subjects }: { sectionId: number; teachers: Option[]; subjects: Option[] }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<TimetableSlotValues>({
    resolver: zodResolver(timetableSlotSchema),
    defaultValues: { sectionId, subjectId: undefined, teacherId: undefined, dayOfWeek: 1, startTime: '', endTime: '' },
  })

  async function onSubmit(values: TimetableSlotValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('sectionId', String(sectionId))
    formData.set('subjectId', String(values.subjectId))
    formData.set('teacherId', values.teacherId)
    formData.set('dayOfWeek', String(values.dayOfWeek))
    formData.set('startTime', values.startTime)
    formData.set('endTime', values.endTime)

    const result = await createTimetableSlot(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Slot added')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Slot
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Timetable Slot</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="subjectId" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select
                  items={subjects.map((s) => ({ label: s.name, value: String(s.id) }))}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                  <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="teacherId" render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher</FormLabel>
                <Select items={teachers.map((t) => ({ label: t.name, value: String(t.id) }))} value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a teacher" /></SelectTrigger></FormControl>
                  <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
              <FormItem>
                <FormLabel>Day</FormLabel>
                <Select items={DAYS.map((d) => ({ label: d.label, value: String(d.value) }))} value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{DAYS.map((d) => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startTime" render={({ field }) => (
              <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endTime" render={({ field }) => (
              <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" loading={submitting}>{submitting ? 'Adding...' : 'Add Slot'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}