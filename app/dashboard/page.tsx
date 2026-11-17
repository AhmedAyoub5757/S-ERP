import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const roles = await getCurrentUserRoles()

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Role(s): {roles.join(', ') || 'none assigned'}</p>
    </div>
  )
}