'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { examSubjectFormSchema, type ExamSubjectFormValues } from '@/lib/validations/examination'
import { createExamSubject } from '@/app/dashboard/examinations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option { id: number; name: string }

export function AddExamSubjectDialog({
  examinationId,
  subjects,
  classes,
}: {
  examinationId: number
  subjects: Option[]
  classes: Option[]
}) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<ExamSubjectFormValues>({
    resolver: zodResolver(examSubjectFormSchema),
    defaultValues: { examinationId, subjectId: undefined, classId: undefined, examDate: '', maxMarks: 100, passingMarks: 40 },
  })

  async function onSubmit(values: ExamSubjectFormValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('examinationId', String(examinationId))
    formData.set('subjectId', String(values.subjectId))
    formData.set('classId', String(values.classId))
    formData.set('examDate', values.examDate)
    formData.set('maxMarks', String(values.maxMarks))
    formData.set('passingMarks', String(values.passingMarks))

    const result = await createExamSubject(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Exam subject added')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Subject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Exam Subject</DialogTitle></DialogHeader>
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
            <FormField control={form.control} name="examDate" render={({ field }) => (
              <FormItem><FormLabel>Exam Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="maxMarks" render={({ field }) => (
              <FormItem><FormLabel>Max Marks</FormLabel><FormControl><Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="passingMarks" render={({ field }) => (
              <FormItem><FormLabel>Passing Marks</FormLabel><FormControl><Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" loading={submitting}>{submitting ? 'Adding...' : 'Add'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}