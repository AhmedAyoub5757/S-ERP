'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { markAttendance } from '@/app/dashboard/attendance/actions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface StudentRecord {
  id: string
  fullName: string
  admissionNumber: string
  status: 'present' | 'absent' | 'late' | 'excused'
}

const statusOptions = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Late', value: 'late' },
  { label: 'Excused', value: 'excused' },
]

export function AttendanceForm({
  sectionId,
  date,
  students,
  editable,
}: {
  sectionId: number
  date: string
  students: StudentRecord[]
  editable: boolean
}) {
  const [records, setRecords] = useState<Record<string, string>>(
    Object.fromEntries(students.map((s) => [s.id, s.status]))
  )
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function setStatus(studentId: string, status: string) {
    setRecords((prev) => ({ ...prev, [studentId]: status }))
  }

  async function handleSave() {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('sectionId', String(sectionId))
    formData.set('date', date)
    formData.set(
      'records',
      JSON.stringify(students.map((s) => ({ studentId: s.id, status: records[s.id] })))
    )

    const result = await markAttendance(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Attendance saved')
    router.refresh()
  }

  const badgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    present: 'default',
    absent: 'destructive',
    late: 'secondary',
    excused: 'outline',
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
            {editable ? (
              <Select
                items={statusOptions}
                value={records[s.id]}
                onValueChange={(val) => {
                  if (val) setStatus(s.id, val)
                }}
              >
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={badgeVariant[records[s.id]] ?? 'default'} className="capitalize">
                {records[s.id]}
              </Badge>
            )}
          </div>
        ))}
      </div>
      {editable && (
        <Button onClick={handleSave} loading={submitting}>
          {submitting ? 'Saving...' : 'Save Attendance'}
        </Button>
      )}
    </div>
  )
}