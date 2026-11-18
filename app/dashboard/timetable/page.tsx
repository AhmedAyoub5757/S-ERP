import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { SectionPicker } from '@/components/timetable/section-picker'
import { AddSlotDialog } from '@/components/timetable/add-slot-dialog'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ sectionId?: string }>
}) {
  const { sectionId } = await searchParams
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = roles.includes('school_admin')
  const canPickSection = isAdmin || roles.includes('principal')

  let sectionOptions: { id: number; label: string }[] = []
  let resolvedSectionId: number | undefined

  if (canPickSection) {
    const { data: sections } = await supabase
      .from('sections')
      .select('id, name, classes ( name )')
      .order('class_id')
    sectionOptions = (sections ?? []).map((s: any) => ({ id: s.id, label: `${s.classes?.name ?? ''} - ${s.name}` }))
    resolvedSectionId = sectionId ? Number(sectionId) : undefined
  } else if (roles.includes('student')) {
    const { data: student } = await supabase.from('students').select('section_id').eq('id', user.id).single()
    resolvedSectionId = student?.section_id
  }

  let slots: any[] = []

  if (roles.includes('teacher') && !isAdmin) {
    const { data } = await supabase
      .from('timetable_slots')
      .select('day_of_week, start_time, end_time, subjects ( name ), sections ( name, classes ( name ) )')
      .eq('teacher_id', user.id)
      .order('day_of_week')
      .order('start_time')
    slots = data ?? []
  } else if (resolvedSectionId) {
    const { data } = await supabase
      .from('timetable_slots')
      .select('day_of_week, start_time, end_time, subjects ( name ), profiles ( full_name )')
      .eq('section_id', resolvedSectionId)
      .order('day_of_week')
      .order('start_time')
    slots = data ?? []
  }

  const grouped = new Map<number, any[]>()
  for (const slot of slots) {
    const day = slot.day_of_week
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(slot)
  }

  let teacherOptions: { id: string; name: string }[] = []
  let subjectOptions: { id: number; name: string }[] = []
  if (isAdmin && resolvedSectionId) {
    const { data: teacherRows } = await supabase.from('teachers').select('id, profiles ( full_name )')
    teacherOptions = (teacherRows ?? []).map((t: any) => ({ id: t.id, name: t.profiles?.full_name ?? 'Unnamed' }))
    const { data: subjectRows } = await supabase.from('subjects').select('id, name').order('name')
    subjectOptions = subjectRows ?? []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">
            {roles.includes('teacher') && !isAdmin ? 'Your weekly schedule' : 'Weekly class schedule'}
          </p>
        </div>
        {isAdmin && resolvedSectionId && (
          <AddSlotDialog sectionId={resolvedSectionId} teachers={teacherOptions} subjects={subjectOptions} />
        )}
      </div>

      {canPickSection && <SectionPicker sections={sectionOptions} defaultSectionId={resolvedSectionId} />}

      {slots.length > 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 0, 6].filter((d) => grouped.has(d)).map((day) => (
            <div key={day}>
              <h2 className="mb-2 font-semibold">{DAY_NAMES[day]}</h2>
              <div className="divide-y rounded-md border">
                {grouped.get(day)!.map((slot: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">{slot.start_time} – {slot.end_time}</span>
                    <span className="font-medium">{slot.subjects?.name}</span>
                    <Badge variant="outline">
                      {slot.sections ? `${slot.sections.classes?.name} ${slot.sections.name}` : slot.profiles?.full_name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          {canPickSection && !resolvedSectionId ? 'Select a section to view its schedule.' : 'No schedule found.'}
        </p>
      )}
    </div>
  )
}