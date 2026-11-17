import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddClassDialog } from '@/components/classes/add-class-dialog'
import { AddSectionDialog } from '@/components/classes/add-section-dialog'
import { EditSectionDialog } from '@/components/classes/edit-section-dialog'

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const isAdmin = roles.includes('school_admin')

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      sections (
        id,
        name,
        capacity,
        class_teacher_id,
        profiles ( full_name )
      )
    `)
    .order('name')

  const { data: teacherRows } = await supabase
    .from('teachers')
    .select('id, profiles ( full_name )')

  const teacherOptions = (teacherRows ?? []).map((t: any) => ({
    id: t.id,
    name: t.profiles?.full_name ?? 'Unnamed',
  }))

  const classOptions = (classes ?? []).map((c: any) => ({ id: c.id, name: c.name }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes &amp; Sections</h1>
          <p className="text-muted-foreground">{classes?.length ?? 0} classes</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <AddClassDialog />
            <AddSectionDialog classes={classOptions} teachers={teacherOptions} />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(classes ?? []).map((cls: any) => (
          <Card key={cls.id}>
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cls.sections?.length ? (
                cls.sections.map((section: any) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">Section {section.name}</p>
                      <p className="text-muted-foreground">
                        Teacher: {section.profiles?.full_name ?? 'Unassigned'}
                        {section.capacity ? ` · Capacity: ${section.capacity}` : ''}
                      </p>
                    </div>
                    {isAdmin && (
                      <EditSectionDialog
                        sectionId={section.id}
                        currentTeacherId={section.class_teacher_id}
                        currentCapacity={section.capacity}
                        teachers={teacherOptions}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sections yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}