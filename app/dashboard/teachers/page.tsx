import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { TeachersTable } from '@/components/teachers/teachers-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { TeacherRow } from '@/lib/types/teacher'

export const dynamic = 'force-dynamic'

export default async function TeachersPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canCreate = roles.includes('school_admin')

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select(`
      id,
      employee_number,
      qualification,
      joining_date,
      profiles ( full_name, email, phone, status )
    `)
    .order('employee_number')

  if (error) {
    return <p className="text-red-600">Failed to load teachers: {error.message}</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">{teachers?.length ?? 0} teachers</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/teachers/new" className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Link>
        )}
      </div>
      <TeachersTable data={(teachers ?? []) as unknown as TeacherRow[]} />
    </div>
  )
}