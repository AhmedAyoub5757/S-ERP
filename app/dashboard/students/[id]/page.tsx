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

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canEdit = roles.includes('school_admin') || roles.includes('receptionist')

  const { data: student } = await supabase
    .from('students')
    .select(`
      id,
      admission_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      status,
      admission_date,
      profiles ( full_name, email, phone ),
      sections ( name, classes ( name ) )
    `)
    .eq('id', id)
    .single()

  if (!student) {
    notFound()
  }

  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('relationship, parents ( id, occupation, profiles ( full_name, email, phone ) )')
    .eq('student_id', id)

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('date, status')
    .eq('student_id', id)
    .order('date', { ascending: false })
    .limit(20)

  const { data: markRecords } = await supabase
    .from('marks')
    .select('marks_obtained, exam_subjects ( max_marks, passing_marks, subjects ( name ), examinations ( name ) )')
    .eq('student_id', id)

  const profile = (student as any).profiles
  const section = (student as any).sections

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name ?? 'Student'}</h1>
          <p className="text-muted-foreground">Admission #{student.admission_number}</p>
        </div>
        {canEdit && (
          <Link href={`/dashboard/students/${id}/edit`} className={cn(buttonVariants({ variant: 'outline' }))}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{profile?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{profile?.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class / Section</p>
            <p>{section ? `${section.classes?.name ?? ''} - ${section.name}` : '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge className="capitalize">{student.status}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Date of Birth</p>
            <p>{student.date_of_birth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="capitalize">{student.gender}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Blood Group</p>
            <p>{student.blood_group ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Admission Date</p>
            <p>{student.admission_date}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Address</p>
            <p>{student.address ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guardians</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {parentLinks && parentLinks.length > 0 ? (
            parentLinks.map((link: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{link.parents?.profiles?.full_name}</p>
                  <p className="text-muted-foreground">{link.parents?.profiles?.email}</p>
                </div>
                <Badge variant="outline" className="capitalize">{link.relationship}</Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No guardians linked.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {attendanceRecords && attendanceRecords.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {attendanceRecords.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded border p-2">
                  <span className="text-muted-foreground">{r.date}</span>
                  <Badge
                    variant={r.status === 'present' ? 'default' : r.status === 'absent' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No attendance records yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Exam Results</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {markRecords && markRecords.length > 0 ? (
            markRecords.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{m.exam_subjects?.subjects?.name}</p>
                  <p className="text-muted-foreground">{m.exam_subjects?.examinations?.name}</p>
                </div>
                <Badge variant={m.marks_obtained >= m.exam_subjects?.passing_marks ? 'default' : 'destructive'}>
                  {m.marks_obtained} / {m.exam_subjects?.max_marks}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No exam results yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}