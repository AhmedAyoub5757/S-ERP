import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { AddApplicationDialog } from '@/components/admissions/add-application-dialog'
import { ReviewActions } from '@/components/admissions/review-actions'
import { StatusFilter } from '@/components/admissions/status-filter'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'secondary',
  enrolled: 'default',
  rejected: 'destructive',
}

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isManager = roles.includes('school_admin') || roles.includes('receptionist')

  let query = supabase
    .from('admission_applications')
    .select('id, applicant_name, date_of_birth, gender, guardian_name, guardian_phone, guardian_email, applying_for_class_id, status, submitted_at, classes ( name )')
    .order('submitted_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: applications } = await query

  let classOptions: { id: number; name: string }[] = []
  let sectionOptions: { id: number; name: string; class_id: number; classes: { name: string } | null }[] = []
  if (isManager) {
    const { data: classRows } = await supabase.from('classes').select('id, name').order('name')
    classOptions = classRows ?? []
    const { data: sectionRows } = await supabase
      .from('sections')
      .select('id, name, class_id, classes ( name )')
      .order('name')
    sectionOptions = (sectionRows ?? []) as unknown as typeof sectionOptions
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admissions</h1>
          <p className="text-muted-foreground">Track and review admission applications.</p>
        </div>
        {isManager && <AddApplicationDialog classes={classOptions} />}
      </div>

      <StatusFilter current={status ?? ''} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Applying For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              {isManager && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(applications ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 8 : 7} className="text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              (applications ?? []).map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.applicant_name}</TableCell>
                  <TableCell>{new Date(a.date_of_birth).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{a.gender}</TableCell>
                  <TableCell>
                    <div>{a.guardian_name}</div>
                    <div className="text-xs text-muted-foreground">{a.guardian_phone}</div>
                  </TableCell>
                  <TableCell>{a.classes?.name ?? '—'}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[a.status] ?? 'outline'}>{a.status}</Badge></TableCell>
                  <TableCell>{new Date(a.submitted_at).toLocaleDateString()}</TableCell>
                  {isManager && (
                    <TableCell>
                      <ReviewActions
                        applicationId={a.id}
                        status={a.status}
                        applicantName={a.applicant_name}
                        guardianName={a.guardian_name}
                        guardianPhone={a.guardian_phone}
                        guardianEmail={a.guardian_email}
                        applyingForClassId={a.applying_for_class_id}
                        sections={sectionOptions}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}