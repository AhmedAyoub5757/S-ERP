import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { DashboardWelcome } from '@/components/dashboard/dashboard-welcome'
import { StatCard } from '@/components/dashboard/stat-card'
import { AttendanceTrendChart } from '@/components/dashboard/attendance-trend-chart'
import { FeeStatusChart } from '@/components/dashboard/fee-status-chart'
import { StudentsPerClassChart } from '@/components/dashboard/students-per-class-chart'
import { CollectionsTrendChart } from '@/components/dashboard/collections-trend-chart'
import { AttendanceBreakdownChart } from '@/components/dashboard/attendance-breakdown-chart'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdminOrPrincipal = roles.includes('school_admin') || roles.includes('principal')
  const isAccountant = roles.includes('accountant')

  // 1. ADMIN / PRINCIPAL VIEW
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
      { data: recentAnnouncements },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('teachers').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount'),
      supabase.from('invoices').select('total_amount, status'),
      supabase.from('attendance').select('date, status').gte('date', fromDate),
      supabase.from('students').select('sections ( classes ( name ) )').eq('status', 'active'),
      supabase
        .from('announcements')
        .select('id, title, content, audience, published_at')
        .order('published_at', { ascending: false })
        .limit(3),
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
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'Add Student', href: '/dashboard/students/new', icon: 'users', variant: 'default' },
            { label: 'Record Attendance', href: '/dashboard/attendance', icon: 'calendar', variant: 'outline' },
            { label: 'Fee Invoicing', href: '/dashboard/fees', icon: 'wallet', variant: 'outline' },
            { label: 'Post Notice', href: '/dashboard/announcements', icon: 'megaphone', variant: 'outline' },
          ]}
        />

        {/* Asymmetric KPI Compositions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Roster"
            value={totalStudents ?? 0}
            description="Enrolled and active students"
            delta={{ value: '+4.2%', isPositive: true, label: 'vs last term' }}
            icon="users"
            featured={true}
          />
          <StatCard
            title="Faculty & Staff"
            value={totalTeachers ?? 0}
            description="Full-time academic instructors"
            delta={{ value: '100%', isPositive: true, label: 'coverage' }}
            icon="faculty"
          />
          <StatCard
            title="Academic Classes"
            value={totalClasses ?? 0}
            description="Operational class levels"
            icon="classes"
          />
          <StatCard
            title="Fee Collections"
            value={`Rs. ${(totalCollected / 1000).toFixed(0)}k`}
            description={`Outstanding: Rs. ${totalOutstanding.toLocaleString()}`}
            delta={{ value: 'Target On Track', isPositive: totalOutstanding < totalCollected }}
            icon="wallet"
          />
        </div>

        {/* Charts & Analytical Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg font-medium text-foreground">
                    Attendance Trend
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Whole-school percentage present across the last 14 academic days.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">Last 14 Days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AttendanceTrendChart data={attendanceTrendData} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg font-medium text-foreground">
                    Fee Status Distribution
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Breakdown of issued invoices by payment settlement status.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">Current Term</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FeeStatusChart data={feeStatusData} />
            </CardContent>
          </Card>
        </div>

        {/* Secondary Row: Students Per Class + Recent Announcements Timeline */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-border bg-card shadow-2xs lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Enrollment by Class Level
              </CardTitle>
              <CardDescription className="text-xs">
                Active students registered in each standard class group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentsPerClassChart data={studentsPerClassData} />
            </CardContent>
          </Card>

          {/* Announcements & Notices */}
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg font-medium text-foreground">
                    Notice Board
                  </CardTitle>
                  <CardDescription className="text-xs">Recent dispatches</CardDescription>
                </div>
                <Link
                  href="/dashboard/announcements"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(recentAnnouncements ?? []).length === 0 ? (
                <EmptyState
                  title="No notices published"
                  description="Broadcast announcements to staff and families from this board."
                  actionLabel="New Notice"
                  actionHref="/dashboard/announcements"
                  className="min-h-[180px] p-4 border-none"
                />
              ) : (
                <div className="divide-y divide-border/60">
                  {(recentAnnouncements ?? []).map((ann: any) => (
                    <div key={ann.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-xs text-foreground truncate">
                          {ann.title}
                        </span>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider shrink-0">
                          {ann.audience}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/75 font-mono">
                        {new Date(ann.published_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
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

  // 2. ACCOUNTANT VIEW
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
        .limit(8),
      supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, due_date, students ( admission_number, profiles ( full_name ) )')
        .eq('status', 'overdue')
        .order('due_date', { ascending: true })
        .limit(8),
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
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'Fees & Invoicing', href: '/dashboard/fees', icon: 'wallet', variant: 'default' },
            { label: 'View Students', href: '/dashboard/students', icon: 'users', variant: 'outline' },
          ]}
        />

        {/* Asymmetric Financial KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Invoiced"
            value={`Rs. ${totalInvoiced.toLocaleString()}`}
            description="Cumulative tuition and term fees"
            icon="wallet"
          />
          <StatCard
            title="Settled Collections"
            value={`Rs. ${totalCollected.toLocaleString()}`}
            description="Verified student payment receipts"
            delta={{ value: 'Target 91%', isPositive: true }}
            icon="trending"
            featured={true}
          />
          <StatCard
            title="Outstanding Balance"
            value={`Rs. ${totalOutstanding.toLocaleString()}`}
            description="Unsettled or overdue accounts"
            delta={{ value: `${overdueInvoices?.length ?? 0} overdue`, isPositive: false }}
            icon="clock"
          />
        </div>

        {/* Financial Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Collection Velocity (Last 30 Days)
              </CardTitle>
              <CardDescription className="text-xs">
                Daily incoming fee receipts credited to school accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollectionsTrendChart data={collectionsTrendData} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Invoice Settlement Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Distribution across fully paid, partial, unpaid, and overdue invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeeStatusChart data={feeStatusData} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions & Overdue Ledger */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Recent Payment Receipts
              </CardTitle>
              <CardDescription className="text-xs">Latest recorded transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {(recentPayments ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent payments recorded.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {(recentPayments ?? []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">
                          {p.invoices?.students?.profiles?.full_name ?? 'Student'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.invoices?.invoice_number} · {p.payment_method?.replace(/_/g, ' ')} ·{' '}
                          {new Date(p.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Rs. {Number(p.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Overdue Invoices Requiring Follow-up
              </CardTitle>
              <CardDescription className="text-xs">Accounts past payment deadline</CardDescription>
            </CardHeader>
            <CardContent>
              {(overdueInvoices ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No invoices are currently overdue. All accounts are settled.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {(overdueInvoices ?? []).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">
                          {inv.students?.profiles?.full_name ?? 'Student'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {inv.invoice_number} · Due {new Date(inv.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground tabular-nums">
                          Rs. {Number(inv.total_amount).toLocaleString()}
                        </span>
                        <StatusBadge status="overdue" />
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

  // 3. TEACHER VIEW
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
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'Take Attendance', href: '/dashboard/attendance', icon: 'calendar', variant: 'default' },
            { label: 'Enter Marks', href: '/dashboard/examinations/marks', icon: 'file-text', variant: 'outline' },
            { label: 'My Timetable', href: '/dashboard/timetable', icon: 'clock', variant: 'outline' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Classes Scheduled Today"
            value={(todaySlots ?? []).length}
            description="Teaching periods today"
            icon="clock"
            featured={true}
          />
          <StatCard
            title="Assigned Sections"
            value={responsibleSections.length}
            description={
              homeroomSection
                ? `Homeroom: ${(homeroomSection as any).classes?.name ?? ''} ${(homeroomSection as any).name}`
                : 'No homeroom assigned'
            }
            icon="classes"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Today&apos;s Class Schedule
              </CardTitle>
              <CardDescription className="text-xs">Assigned periods and class venues</CardDescription>
            </CardHeader>
            <CardContent>
              {(todaySlots ?? []).length === 0 ? (
                <EmptyState
                  title="No teaching periods today"
                  description="You have no classes scheduled on the school timetable for today."
                  className="min-h-[160px] p-4 border-none"
                />
              ) : (
                <div className="divide-y divide-border/60">
                  {(todaySlots ?? []).map((slot: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 text-xs">
                      <span className="font-mono text-muted-foreground tabular-nums">
                        {slot.start_time} – {slot.end_time}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {slot.subjects?.name}
                      </span>
                      <Badge variant="outline">
                        {slot.sections?.classes?.name} {slot.sections?.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Attendance Register Status
              </CardTitle>
              <CardDescription className="text-xs">Section check for today</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceStatus.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You are not assigned as homeroom class teacher for attendance.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {attendanceStatus.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <span className="font-semibold text-foreground text-sm">{s.label}</span>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {s.marked} of {s.total} students recorded
                        </p>
                      </div>
                      {s.total > 0 && s.marked >= s.total ? (
                        <StatusBadge status="present" />
                      ) : (
                        <StatusBadge status="pending" />
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

  // 4. STUDENT VIEW
  if (roles.includes('student')) {
    const { data: studentRow } = await supabase
      .from('students')
      .select('section_id, sections ( name, classes ( name ) )')
      .eq('id', user.id)
      .single()

    const dayOfWeek = new Date().getDay()

    const [{ data: todaySlots }, { data: attendanceRows }, { data: markRows }, { data: myInvoices }] =
      await Promise.all([
        studentRow
          ? supabase
              .from('timetable_slots')
              .select('start_time, end_time, subjects ( name ), profiles ( full_name )')
              .eq('section_id', studentRow.section_id)
              .eq('day_of_week', dayOfWeek)
              .order('start_time')
          : Promise.resolve({ data: [] }),
        supabase.from('attendance').select('status').eq('student_id', user.id),
        supabase
          .from('marks')
          .select('marks_obtained, exam_subjects ( max_marks, subjects ( name ), examinations ( name ) )')
          .eq('student_id', user.id),
        supabase.from('invoices').select('id, total_amount').eq('student_id', user.id),
      ])

    const totalAttendance = (attendanceRows ?? []).length
    const presentCount = (attendanceRows ?? []).filter((a) => a.status === 'present').length
    const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : null

    const attendanceCounts: Record<string, number> = { present: 0, absent: 0, late: 0, excused: 0 }
    for (const a of attendanceRows ?? []) {
      if (a.status in attendanceCounts) attendanceCounts[a.status]++
    }
    const attendanceBreakdownData = Object.entries(attendanceCounts).map(([status, count]) => ({ status, count }))

    const totalMaxMarks = (markRows ?? []).reduce((sum, m: any) => sum + Number(m.exam_subjects?.max_marks ?? 0), 0)
    const totalObtained = (markRows ?? []).reduce((sum, m: any) => sum + Number(m.marks_obtained ?? 0), 0)
    const averagePercent = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 100) : null

    const invoiceIds = (myInvoices ?? []).map((i) => i.id)
    const totalInvoiced = (myInvoices ?? []).reduce((sum, i) => sum + Number(i.total_amount), 0)
    let totalPaid = 0
    if (invoiceIds.length > 0) {
      const { data: myPayments } = await supabase.from('payments').select('amount').in('invoice_id', invoiceIds)
      totalPaid = (myPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    }
    const feesDue = totalInvoiced - totalPaid

    return (
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'View Schedule', href: '/dashboard/timetable', icon: 'clock', variant: 'default' },
            { label: 'Fee Records', href: '/dashboard/fees', icon: 'wallet', variant: 'outline' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Attendance Rate"
            value={attendancePercent !== null ? `${attendancePercent}%` : '—'}
            description="Term attendance record"
            delta={{ value: attendancePercent !== null && attendancePercent >= 85 ? 'Good standing' : 'Needs attention', isPositive: Boolean(attendancePercent && attendancePercent >= 85) }}
            icon="calendar"
            featured={true}
          />
          <StatCard
            title="Academic Standing"
            value={averagePercent !== null ? `${averagePercent}%` : '—'}
            description="Overall marks average"
            icon="file"
          />
          <StatCard
            title="Fees Balance"
            value={`Rs. ${feesDue.toLocaleString()}`}
            description={feesDue > 0 ? 'Pending payment' : 'Fully settled'}
            delta={{ value: feesDue > 0 ? 'Balance due' : 'Settled', isPositive: feesDue === 0 }}
            icon="wallet"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Today&apos;s Lectures
              </CardTitle>
              <CardDescription className="text-xs">Classes scheduled for your section</CardDescription>
            </CardHeader>
            <CardContent>
              {(todaySlots ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No classes scheduled for today.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {(todaySlots ?? []).map((slot: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5 text-xs">
                      <span className="font-mono text-muted-foreground tabular-nums">
                        {slot.start_time} – {slot.end_time}
                      </span>
                      <span className="font-semibold text-foreground">{slot.subjects?.name}</span>
                      <Badge variant="outline">{slot.profiles?.full_name}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-medium text-foreground">
                Attendance Breakdown
              </CardTitle>
              <CardDescription className="text-xs">Days present, absent, and excused</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceBreakdownChart data={attendanceBreakdownData} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 5. PARENT VIEW
  if (roles.includes('parent')) {
    const { data: links } = await supabase
      .from('parent_students')
      .select('students ( id, admission_number, profiles ( full_name ), sections ( name, classes ( name ) ) )')
      .eq('parent_id', user.id)

    const children = (links ?? []).map((l: any) => l.students).filter(Boolean)

    const childSummaries = await Promise.all(
      children.map(async (child: any) => {
        const { data: attendanceRows } = await supabase.from('attendance').select('status').eq('student_id', child.id)
        const total = attendanceRows?.length ?? 0
        const present = (attendanceRows ?? []).filter((a) => a.status === 'present').length
        const attendancePercent = total > 0 ? Math.round((present / total) * 100) : null

        const { data: invoices } = await supabase.from('invoices').select('id, total_amount').eq('student_id', child.id)
        const invoiceIds = (invoices ?? []).map((i) => i.id)
        const totalInvoiced = (invoices ?? []).reduce((sum, i) => sum + Number(i.total_amount), 0)
        let totalPaid = 0
        if (invoiceIds.length > 0) {
          const { data: payments } = await supabase.from('payments').select('amount').in('invoice_id', invoiceIds)
          totalPaid = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
        }
        const feesDue = totalInvoiced - totalPaid

        return { ...child, attendancePercent, feesDue }
      })
    )

    return (
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'Parent Portal', href: '/dashboard/children', icon: 'users', variant: 'default' },
            { label: 'Notices', href: '/dashboard/announcements', icon: 'megaphone', variant: 'outline' },
          ]}
        />

        {childSummaries.length === 0 ? (
          <EmptyState
            title="No children linked yet"
            description="Your parent account is registered, but no student records are linked yet. Please contact the admissions office."
            actionLabel="Contact Administration"
            actionHref="/dashboard/announcements"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {childSummaries.map((child: any) => (
              <Card key={child.id} className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-serif text-lg font-medium text-foreground">
                        {child.profiles?.full_name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {child.sections?.classes?.name} — {child.sections?.name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {child.admission_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {child.attendancePercent !== null ? `${child.attendancePercent}%` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees Balance</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        child.feesDue > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      Rs. {child.feesDue.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 6. RECEPTIONIST VIEW
  if (roles.includes('receptionist')) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      { count: activeStudents },
      { count: pendingCount },
      { count: approvedCount },
      { count: thisMonthCount },
      { data: recentApplications },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('admission_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('admission_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase
        .from('admission_applications')
        .select('*', { count: 'exact', head: true })
        .gte('submitted_at', startOfMonth.toISOString()),
      supabase
        .from('admission_applications')
        .select('id, applicant_name, status, submitted_at, classes ( name )')
        .order('submitted_at', { ascending: false })
        .limit(10),
    ])

    return (
      <div className="space-y-8">
        <DashboardWelcome
          roles={roles}
          email={user.email ?? ''}
          actions={[
            { label: 'New Application', href: '/dashboard/admissions', icon: 'clipboard', variant: 'default' },
            { label: 'Enroll Student', href: '/dashboard/students/new', icon: 'users', variant: 'outline' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Roster"
            value={activeStudents ?? 0}
            description="Currently enrolled students"
            icon="users"
            featured={true}
          />
          <StatCard
            title="Pending Review"
            value={pendingCount ?? 0}
            description="Applications awaiting screening"
            delta={{ value: 'Action Required', isPositive: false }}
            icon="clock"
          />
          <StatCard
            title="Approved (Unenrolled)"
            value={approvedCount ?? 0}
            description="Ready for student creation"
            icon="check"
          />
          <StatCard
            title="Received This Month"
            value={thisMonthCount ?? 0}
            description="New inquiry submissions"
            icon="calendar"
          />
        </div>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg font-medium text-foreground">
              Recent Admission Inquiries
            </CardTitle>
            <CardDescription className="text-xs">Candidate applications pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {(recentApplications ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No applications recorded yet.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {(recentApplications ?? []).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{a.applicant_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Applying for {a.classes?.name ?? 'Standard'} ·{' '}
                        {new Date(a.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback for default user
  return (
    <div className="space-y-4">
      <DashboardWelcome roles={roles} email={user.email ?? ''} />
      <p className="text-xs text-muted-foreground">
        Signed in as: {roles.join(', ') || 'General member'}
      </p>
    </div>
  )
}
