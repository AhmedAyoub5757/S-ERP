'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateSectionTeacher } from '@/app/dashboard/classes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'

interface Teacher {
  id: string
  name: string
}

export function EditSectionDialog({
  sectionId,
  currentTeacherId,
  currentCapacity,
  teachers,
}: {
  sectionId: number
  currentTeacherId: string | null
  currentCapacity: number | null
  teachers: Teacher[]
}) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [teacherId, setTeacherId] = useState<string | undefined>(currentTeacherId ?? undefined)
  const [capacity, setCapacity] = useState<string>(currentCapacity ? String(currentCapacity) : '')
  const router = useRouter()

  async function handleSave() {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('sectionId', String(sectionId))
    if (teacherId) formData.set('classTeacherId', teacherId)
    if (capacity) formData.set('capacity', capacity)

    const result = await updateSectionTeacher(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Section updated')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Class Teacher</Label>
            <Select
              items={teachers.map((t) => ({ label: t.name, value: t.id }))}
              value={teacherId}
              onValueChange={setTeacherId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}