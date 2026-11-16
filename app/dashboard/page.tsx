import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roles = await getCurrentUserRoles()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Logged in as: {user.email}</p>
      <p>Roles: {roles.join(', ') || 'none assigned'}</p>
    </div>
  )
}