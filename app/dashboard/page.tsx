import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AttendanceTrendChart } from '@/components/dashboard/attendance-trend-chart'
import { FeeStatusChart } from '@/components/dashboard/fee-status-chart'
import { StudentsPerClassChart } from '@/components/dashboard/students-per-class-chart'
import { CollectionsTrendChart } from '@/components/dashboard/collections-trend-chart'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdminOrPrincipal = roles.includes('school_admin') || roles.includes('principal')
  const isAccountant = roles.includes('accountant')

  if (isAdminOrPrincipal) {
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

  if (isAccountant) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    const fromDate = thirtyDaysAgo.toISOString().slice(0, 10)

    const [
      { data: invoices },
      { data: allPayments },
      { data: recentPayments },
      { data: overdueInvoices },
    ] = await Promise.all([
      supabase.from('invoices').select('total_amount, status'),
      supabase.from('payments').select('amount, payment_date').gte('payment_date', fromDate),
      supabase
        .from('payments')
        .select('amount, payment_date, payment_method, invoices ( invoice_number, students ( admission_number, profiles ( full_name ) ) )')
        .order('payment_date', { ascending: false })
        .limit(10),
      supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, due_date, students ( admission_number, profiles ( full_name ) )')
        .eq('status', 'overdue')
        .order('due_date', { ascending: true })
        .limit(10),
    ])

    const totalInvoiced = (invoices ?? []).reduce((sum, r) => sum + Number(r.total_amount), 0)

    const { data: allPaymentsEver } = await supabase.from('payments').select('amount')
    const totalCollected = (allPaymentsEver ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    const totalOutstanding = totalInvoiced - totalCollected

    const statusCounts: Record<string, number> = { paid: 0, partially_paid: 0, unpaid: 0, overdue: 0 }
    for (const inv of invoices ?? []) {
      if (inv.status in statusCounts) statusCounts[inv.status]++
    }
    const feeStatusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

    const collectionsByDate = new Map<string, number>()
    for (const p of allPayments ?? []) {
      collectionsByDate.set(p.payment_date, (collectionsByDate.get(p.payment_date) ?? 0) + Number(p.amount))
    }
    const collectionsTrendData = Array.from(collectionsByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount,
      }))

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Fee Collection Overview</h1>
          <p className="text-muted-foreground">Live snapshot of invoicing and payments.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Invoiced</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">Rs. {totalInvoiced.toLocaleString()}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Collected</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Outstanding</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">Rs. {totalOutstanding.toLocaleString()}</CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Collections (Last 30 Days)</CardTitle></CardHeader>
            <CardContent><CollectionsTrendChart data={collectionsTrendData} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Invoice Status Breakdown</CardTitle></CardHeader>
            <CardContent><FeeStatusChart data={feeStatusData} /></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
            <CardContent>
              {(recentPayments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="divide-y">
                  {(recentPayments ?? []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium">{p.invoices?.students?.profiles?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.invoices?.invoice_number} · {p.payment_method.replace('_', ' ')} · {new Date(p.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">Rs. {Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Overdue Invoices</CardTitle></CardHeader>
            <CardContent>
              {(overdueInvoices ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No overdue invoices. Nice.</p>
              ) : (
                <div className="divide-y">
                  {(overdueInvoices ?? []).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium">{inv.students?.profiles?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.invoice_number} · Due {new Date(inv.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Rs. {Number(inv.total_amount).toLocaleString()}</span>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (roles.includes('teacher')) {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const dayOfWeek = today.getDay()

    const [{ data: todaySlots }, { data: assignments }, { data: homeroomSection }] = await Promise.all([
      supabase
        .from('timetable_slots')
        .select('start_time, end_time, subjects ( name ), sections ( name, classes ( name ) )')
        .eq('teacher_id', user.id)
        .eq('day_of_week', dayOfWeek)
        .order('start_time'),
      supabase
        .from('teacher_assignments')
        .select('section_id, sections ( name, classes ( name ) )')
        .eq('teacher_id', user.id),
      supabase
        .from('sections')
        .select('id, name, classes ( name )')
        .eq('class_teacher_id', user.id)
        .maybeSingle(),
    ])

    const sectionMap = new Map<number, { id: number; label: string }>()
    for (const a of assignments ?? []) {
      const s: any = a.sections
      if (s) sectionMap.set(a.section_id, { id: a.section_id, label: `${s.classes?.name ?? ''} ${s.name}` })
    }
    if (homeroomSection) {
      const hs: any = homeroomSection
      sectionMap.set(hs.id, { id: hs.id, label: `${hs.classes?.name ?? ''} ${hs.name}` })
    }
    const responsibleSections = Array.from(sectionMap.values())

    const attendanceStatus = await Promise.all(
      responsibleSections.map(async (section) => {
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', section.id)
          .eq('status', 'active')

        const { count: markedCount } = await supabase
          .from('attendance')
          .select('id, students!inner(section_id)', { count: 'exact', head: true })
          .eq('date', todayStr)
          .eq('students.section_id', section.id)

        return {
          ...section,
          total: totalStudents ?? 0,
          marked: markedCount ?? 0,
        }
      })
    )

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            {homeroomSection
              ? `Homeroom: ${(homeroomSection as any).classes?.name ?? ''} ${(homeroomSection as any).name}`
              : 'No homeroom assigned'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Classes Today</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{(todaySlots ?? []).length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Sections You&apos;re Responsible For</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{responsibleSections.length}</CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Today&apos;s Schedule</CardTitle></CardHeader>
            <CardContent>
              {(todaySlots ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
              ) : (
                <div className="divide-y">
                  {(todaySlots ?? []).map((slot: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-muted-foreground">{slot.start_time} – {slot.end_time}</span>
                      <span className="font-medium">{slot.subjects?.name}</span>
                      <Badge variant="outline">{slot.sections?.classes?.name} {slot.sections?.name}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Attendance Status Today</CardTitle></CardHeader>
            <CardContent>
              {attendanceStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">You&apos;re not responsible for any section&apos;s attendance.</p>
              ) : (
                <div className="divide-y">
                  {attendanceStatus.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium">{s.label}</span>
                      {s.total > 0 && s.marked >= s.total ? (
                        <Badge className="bg-green-600">Marked</Badge>
                      ) : (
                        <Badge variant="destructive">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">
        Signed in as: {roles.join(', ') || 'no role assigned'}
      </p>
    </div>
  )
}