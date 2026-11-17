import { createClient } from '@/lib/supabase/server'
import { StudentsTable } from '@/components/students/students-table'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { StudentRow } from '@/lib/types/student'

export const dynamic = 'force-dynamic'

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
    return <p className="text-red-600">Failed to load students: {error.message}</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            {students?.length ?? 0} student{students?.length === 1 ? '' : 's'}
          </p>
        </div>
        {canCreate && (
          <Link href="/dashboard/students/new" className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        )}
      </div>
      <StudentsTable data={(students ?? []) as unknown as StudentRow[]} />
    </div>
  )
}