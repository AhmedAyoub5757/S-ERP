'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveMarks } from '@/app/dashboard/examinations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudentRecord {
  id: string
  fullName: string
  admissionNumber: string
  marksObtained: number | string
}

export function MarksEntryForm({
  examSubjectId,
  maxMarks,
  students,
}: {
  examSubjectId: number
  maxMarks: number
  students: StudentRecord[]
}) {
  const [marks, setMarks] = useState<Record<string, string>>(
    Object.fromEntries(students.map((s) => [s.id, String(s.marksObtained ?? '')]))
  )
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('examSubjectId', String(examSubjectId))
    formData.set(
      'records',
      JSON.stringify(
        students.filter((s) => marks[s.id] !== '').map((s) => ({ studentId: s.id, marksObtained: Number(marks[s.id]) }))
      )
    )

    const result = await saveMarks(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Marks saved')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="divide-y rounded-md border">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{s.fullName}</p>
              <p className="text-sm text-muted-foreground">#{s.admissionNumber}</p>
            </div>
            <Input
              type="number"
              min={0}
              max={maxMarks}
              className="w-24"
              value={marks[s.id]}
              onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Max marks: {maxMarks}</p>
      <Button onClick={handleSave} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Marks'}
      </Button>
    </div>
  )
}