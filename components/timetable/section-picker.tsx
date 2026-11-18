'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Option { id: number; label: string }

export function SectionPicker({ sections, defaultSectionId }: { sections: Option[]; defaultSectionId?: number }) {
  const router = useRouter()
  const [sectionId, setSectionId] = useState<string | undefined>(defaultSectionId ? String(defaultSectionId) : undefined)

  function handleLoad() {
    if (!sectionId) return
    router.push(`/dashboard/timetable?sectionId=${sectionId}`)
  }

  return (
    <div className="flex items-end gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Section</label>
        <Select 
          items={sections.map((s) => ({ label: s.label, value: String(s.id) }))} 
          value={sectionId} 
          onValueChange={(val) => setSectionId(val ?? undefined)}
        >
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select a section" /></SelectTrigger>
          <SelectContent>{sections.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={handleLoad}>Load</Button>
    </div>
  )
}