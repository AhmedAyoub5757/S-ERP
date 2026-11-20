import { createClient } from '@/lib/supabase/server'
import { StudentsTable } from '@/components/students/students-table'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { mapErrorMessage, logTechnicalError } from '@/lib/error-messages'
import { ErrorState } from '@/components/ui/error-state'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import type { StudentRow } from '@/lib/types/student'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudentsPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canCreate = roles.includes('school_admin') || roles.includes('receptionist')

  const { data: students, error } = await supabase
    .from('students')
    .select(`
      id,
      admission_number,
      date_of_birth,
      gender,
      status,
      profiles ( full_name, email, phone ),
      sections ( name, classes ( name ) )
    `)
    .order('admission_number')

  if (error) {
    logTechnicalError('StudentsPage.fetchStudents', error)
    const userMessage = mapErrorMessage(error, 'Something went wrong while loading the student directory.')
    return <ErrorState message={userMessage} />
  }

  const studentCount = students?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Enrollment Register
            </span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl mt-1">
            Students
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete register of active, enrolled, and past students with academic section assignments.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/students/new"
            className={cn(buttonVariants({ variant: 'default' }), 'gap-2 shrink-0')}
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </Link>
        )}
      </div>

      <StudentsTable data={(students ?? []) as unknown as StudentRow[]} />
    </div>
  )
}
