'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SectionOption {
  id: number
  label: string
}

export function SectionDatePicker({
  sections,
  defaultSectionId,
  defaultDate,
}: {
  sections: SectionOption[]
  defaultSectionId?: number
  defaultDate: string
}) {
  const router = useRouter()
  const [sectionId, setSectionId] = useState<string | undefined>(
    defaultSectionId ? String(defaultSectionId) : undefined
  )
  const [date, setDate] = useState(defaultDate)

  function handleLoad() {
    if (!sectionId) return
    router.push(`/dashboard/attendance?sectionId=${sectionId}&date=${date}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Section</label>
        <Select
          items={sections.map((s) => ({ label: s.label, value: String(s.id) }))}
          value={sectionId}
          onValueChange={setSectionId}
        >
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select a section" /></SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[160px]" />
      </div>
      <Button onClick={handleLoad}>Load</Button>
    </div>
  )
}