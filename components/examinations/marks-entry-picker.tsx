'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Option { id: number; name?: string; label?: string }

export function MarksEntryPicker({
  examinations,
  examSubjects,
  defaultExaminationId,
  defaultExamSubjectId,
}: {
  examinations: Option[]
  examSubjects: Option[]
  defaultExaminationId?: number
  defaultExamSubjectId?: number
}) {
  const router = useRouter()
  const [examinationId, setExaminationId] = useState<string | undefined>(
    defaultExaminationId ? String(defaultExaminationId) : undefined
  )
  const [examSubjectId, setExamSubjectId] = useState<string | undefined>(
    defaultExamSubjectId ? String(defaultExamSubjectId) : undefined
  )

  function handleExaminationChange(val: string | null) {
    if (!val) return
    setExaminationId(val)
    router.push(`/dashboard/examinations/marks?examinationId=${val}`)
  }

  function handleLoad() {
    if (!examinationId || !examSubjectId) return
    router.push(`/dashboard/examinations/marks?examinationId=${examinationId}&examSubjectId=${examSubjectId}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Examination</label>
        <Select
          items={examinations.map((e) => ({ label: e.name!, value: String(e.id) }))}
          value={examinationId}
          onValueChange={handleExaminationChange}
        >
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select examination" /></SelectTrigger>
          <SelectContent>{examinations.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {examinationId && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Subject / Section</label>
          <Select
            items={examSubjects.map((e) => ({ label: e.label!, value: String(e.id) }))}
            value={examSubjectId}
            onValueChange={(val) => setExamSubjectId(val ?? undefined)}
          >
            <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select subject/section" /></SelectTrigger>
            <SelectContent>{examSubjects.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      {examinationId && examSubjectId && <Button onClick={handleLoad}>Load</Button>}
    </div>
  )
}