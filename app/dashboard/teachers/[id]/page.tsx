import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canEdit = roles.includes('school_admin')

  const { data: teacher } = await supabase
    .from('teachers')
    .select(`
      id,
      employee_number,
      qualification,
      joining_date,
      profiles ( full_name, email, phone, status )
    `)
    .eq('id', id)
    .single()

  if (!teacher) {
    notFound()
  }

  const { data: assignments } = await supabase
    .from('teacher_assignments')
    .select('subjects ( name ), sections ( name, classes ( name ) )')
    .eq('teacher_id', id)

  const profile = (teacher as any).profiles

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name ?? 'Teacher'}</h1>
          <p className="text-muted-foreground">Employee #{teacher.employee_number}</p>
        </div>
        {canEdit && (
          <Link href={`/dashboard/teachers/${id}/edit`} className={cn(buttonVariants({ variant: 'outline' }))}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Email</p><p>{profile?.email}</p></div>
          <div><p className="text-muted-foreground">Phone</p><p>{profile?.phone ?? '—'}</p></div>
          <div><p className="text-muted-foreground">Qualification</p><p>{teacher.qualification ?? '—'}</p></div>
          <div><p className="text-muted-foreground">Joining Date</p><p>{teacher.joining_date}</p></div>
          <div><p className="text-muted-foreground">Status</p><Badge className="capitalize">{profile?.status}</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assigned Classes &amp; Subjects</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {assignments && assignments.length > 0 ? (
            assignments.map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span>{a.subjects?.name}</span>
                <Badge variant="outline">{a.sections?.classes?.name} - {a.sections?.name}</Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No assignments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}