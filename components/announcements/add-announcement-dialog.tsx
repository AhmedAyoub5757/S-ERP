'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { announcementSchema, type AnnouncementValues } from '@/lib/validations/announcement'
import { createAnnouncement } from '@/app/dashboard/announcements/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option { id: number; label: string }

const AUDIENCES = [
  { label: 'Everyone', value: 'all' },
  { label: 'Teachers', value: 'teachers' },
  { label: 'Students', value: 'students' },
  { label: 'Parents', value: 'parents' },
  { label: 'A specific class', value: 'specific_class' },
  { label: 'A specific section', value: 'specific_section' },
]

export function AddAnnouncementDialog({ classes, sections }: { classes: Option[]; sections: Option[] }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<AnnouncementValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '', audience: 'all', targetClassId: undefined, targetSectionId: undefined },
  })

  const audience = form.watch('audience')

  async function onSubmit(values: AnnouncementValues) {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('title', values.title)
    formData.set('content', values.content)
    formData.set('audience', values.audience)
    if (values.targetClassId) formData.set('targetClassId', String(values.targetClassId))
    if (values.targetSectionId) formData.set('targetSectionId', String(values.targetSectionId))

    const result = await createAnnouncement(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Announcement posted')
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Post Announcement
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="audience" render={({ field }) => (
              <FormItem>
                <FormLabel>Audience</FormLabel>
                <Select items={AUDIENCES} value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {audience === 'specific_class' && (
              <FormField control={form.control} name="targetClassId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    items={classes.map((c) => ({ label: c.label, value: String(c.id) }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                    <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            {audience === 'specific_section' && (
              <FormField control={form.control} name="targetSectionId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    items={sections.map((s) => ({ label: s.label, value: String(s.id) }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a section" /></SelectTrigger></FormControl>
                    <SelectContent>{sections.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <Button type="submit" loading={submitting}>{submitting ? 'Posting...' : 'Post Announcement'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}