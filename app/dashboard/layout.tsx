import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { UserMenu } from '@/components/user-menu'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roles = await getCurrentUserRoles()

  return (
    <SidebarProvider>
      <AppSidebar roles={roles} userId={user.id} />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />
          <UserMenu email={user.email ?? ''} roles={roles} />
        </header>
        <main className="page-enter flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}