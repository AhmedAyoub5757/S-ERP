import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { AddAnnouncementDialog } from '@/components/announcements/add-announcement-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const AUDIENCE_LABELS: Record<string, string> = {
  all: 'Everyone',
  teachers: 'Teachers',
  students: 'Students',
  parents: 'Parents',
  specific_class: 'A class',
  specific_section: 'A section',
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isManager = roles.includes('school_admin') || roles.includes('principal')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, audience, target_class_id, target_section_id, published_at')
    .order('published_at', { ascending: false })

  let visible = announcements ?? []

  if (!isManager) {
    let sectionIds: number[] = []
    let classIds: number[] = []

    if (roles.includes('student')) {
      const { data: student } = await supabase
        .from('students')
        .select('section_id, sections ( class_id )')
        .eq('id', user.id)
        .single()
      if (student) {
        sectionIds = [student.section_id]
        classIds = student.sections ? [(student.sections as any).class_id] : []
      }
    }

    if (roles.includes('parent')) {
      const { data: links } = await supabase
        .from('parent_students')
        .select('students ( section_id, sections ( class_id ) )')
        .eq('parent_id', user.id)
      for (const l of links ?? []) {
        const s: any = l.students
        if (s?.section_id) sectionIds.push(s.section_id)
        if (s?.sections?.class_id) classIds.push(s.sections.class_id)
      }
    }

    visible = visible.filter((a: any) => {
      if (a.audience === 'all') return true
      if (a.audience === 'teachers') return roles.includes('teacher')
      if (a.audience === 'students') return roles.includes('student')
      if (a.audience === 'parents') return roles.includes('parent')
      if (a.audience === 'specific_class') return classIds.includes(a.target_class_id)
      if (a.audience === 'specific_section') return sectionIds.includes(a.target_section_id)
      return false
    })
  }

  let classOptions: { id: number; label: string }[] = []
  let sectionOptions: { id: number; label: string }[] = []
  if (isManager) {
    const { data: classRows } = await supabase.from('classes').select('id, name').order('name')
    classOptions = (classRows ?? []).map((c: any) => ({ id: c.id, label: c.name }))

    const { data: sectionRows } = await supabase.from('sections').select('id, name, classes ( name )').order('class_id')
    sectionOptions = (sectionRows ?? []).map((s: any) => ({ id: s.id, label: `${s.classes?.name ?? ''} - ${s.name}` }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">School-wide and targeted notices.</p>
        </div>
        {isManager && <AddAnnouncementDialog classes={classOptions} sections={sectionOptions} />}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((a: any) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <Badge variant="outline">{AUDIENCE_LABELS[a.audience]}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}