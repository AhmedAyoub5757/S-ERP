import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { UserMenu } from '@/components/user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardBreadcrumb } from '@/components/dashboard-breadcrumb'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { PageTransition } from '@/components/page-transition'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roles = await getCurrentUserRoles()

  return (
    <SidebarProvider>
      <AppSidebar roles={roles} userId={user.id} />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-border bg-background shadow-2xs hover:bg-muted" />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <DashboardBreadcrumb />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="outline" className="h-9 w-9 border-border bg-background shadow-2xs" />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <UserMenu email={user.email ?? ''} roles={roles} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
