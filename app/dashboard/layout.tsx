import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { UserMenu } from '@/components/user-menu'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { PageTransition } from '@/components/page-transition'

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
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-background/92 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="size-9 rounded-md border border-border bg-card" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Greenwood School</p>
              <p className="mt-0.5 text-sm font-semibold">School Workspace</p>
            </div>
          </div>
          <UserMenu email={user.email ?? ''} roles={roles} />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}