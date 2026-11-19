import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceTrendChart } from '@/components/dashboard/attendance-trend-chart'
import { FeeStatusChart } from '@/components/dashboard/fee-status-chart'
import { StudentsPerClassChart } from '@/components/dashboard/students-per-class-chart'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdminOrPrincipal = roles.includes('school_admin') || roles.includes('principal')

  if (!isAdminOrPrincipal) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          Signed in as: {roles.join(', ') || 'no role assigned'}
        </p>
      </div>
    )
  }

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  const fromDate = fourteenDaysAgo.toISOString().slice(0, 10)

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalClasses },
    { data: payments },
    { data: invoices },
    { data: attendanceRows },
    { data: studentSections },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount'),
    supabase.from('invoices').select('total_amount, status'),
    supabase.from('attendance').select('date, status').gte('date', fromDate),
    supabase.from('students').select('sections ( classes ( name ) )').eq('status', 'active'),
  ])

  const totalInvoiced = (invoices ?? []).reduce((sum, r) => sum + Number(r.total_amount), 0)
  const totalCollected = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  const totalOutstanding = totalInvoiced - totalCollected

  const statusCounts: Record<string, number> = { paid: 0, partially_paid: 0, unpaid: 0, overdue: 0 }
  for (const inv of invoices ?? []) {
    if (inv.status in statusCounts) statusCounts[inv.status]++
  }
  const feeStatusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  const attendanceByDate = new Map<string, { present: number; total: number }>()
  for (const a of attendanceRows ?? []) {
    const entry = attendanceByDate.get(a.date) ?? { present: 0, total: 0 }
    entry.total++
    if (a.status === 'present') entry.present++
    attendanceByDate.set(a.date, entry)
  }
  const attendanceTrendData = Array.from(attendanceByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { present, total }]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      percentPresent: total > 0 ? Math.round((present / total) * 100) : 0,
    }))

  const classCounts = new Map<string, number>()
  for (const s of studentSections ?? []) {
    const className = (s.sections as any)?.classes?.name ?? 'Unassigned'
    classCounts.set(className, (classCounts.get(className) ?? 0) + 1)
  }
  const studentsPerClassData = Array.from(classCounts.entries()).map(([className, count]) => ({ className, count }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Overview</h1>
        <p className="text-muted-foreground">Live snapshot across the whole school.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Active Students</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalStudents ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Teachers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalTeachers ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Classes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalClasses ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Fees Collected</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Attendance Trend (Last 14 Days)</CardTitle></CardHeader>
          <CardContent><AttendanceTrendChart data={attendanceTrendData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fee Status Breakdown</CardTitle></CardHeader>
          <CardContent><FeeStatusChart data={feeStatusData} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Active Students per Class</CardTitle></CardHeader>
        <CardContent><StudentsPerClassChart data={studentsPerClassData} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Outstanding Fees</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold text-red-600">Rs. {totalOutstanding.toLocaleString()}</CardContent>
      </Card>
    </div>
  )
}