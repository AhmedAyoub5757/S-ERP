import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import Link from 'next/link'
import { AddExaminationDialog } from '@/components/examinations/add-examination-dialog'

export const dynamic = 'force-dynamic'

export default async function ExaminationsPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const isAdmin = roles.includes('school_admin')

  const { data: examinations } = await supabase
    .from('examinations')
    .select('id, name, start_date, end_date')
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Examinations</h1>
          <p className="text-muted-foreground">{examinations?.length ?? 0} examinations</p>
        </div>
        {isAdmin && <AddExaminationDialog />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(examinations ?? []).map((exam) => (
          <Link key={exam.id} href={`/dashboard/examinations/${exam.id}`} className="rounded-lg border p-4 hover:bg-accent">
            <p className="font-semibold">{exam.name}</p>
            <p className="text-sm text-muted-foreground">{exam.start_date} – {exam.end_date}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}