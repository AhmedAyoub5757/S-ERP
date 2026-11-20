'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { navItems } from '@/lib/nav-config'
import {
  GraduationCap,
  User as UserIcon,
  ChevronRight,
  Shield,
  BookOpen,
} from 'lucide-react'
import { NavigationProgress } from '@/components/navigation-progress'
import { cn } from '@/lib/utils'

export function AppSidebar({ roles, userId }: { roles: string[]; userId: string }) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) => item.roles.some((r) => roles.includes(r)))

  const extraItems: { title: string; url: string; icon: typeof UserIcon }[] = []
  if (roles.includes('student')) {
    extraItems.push({ title: 'My Student Profile', url: `/dashboard/students/${userId}`, icon: UserIcon })
  }
  if (roles.includes('teacher')) {
    extraItems.push({ title: 'My Teacher Profile', url: `/dashboard/teachers/${userId}`, icon: UserIcon })
  }

  // Categorize navigation items for an editorial layout
  const overviewItem = visibleItems.find((i) => i.url === '/dashboard')
  const academicItems = visibleItems.filter((i) =>
    ['/dashboard/students', '/dashboard/classes', '/dashboard/teachers', '/dashboard/timetable', '/dashboard/children'].includes(i.url)
  )
  const assessmentItems = visibleItems.filter((i) =>
    ['/dashboard/attendance', '/dashboard/examinations', '/dashboard/examinations/marks'].includes(i.url)
  )
  const administrativeItems = visibleItems.filter((i) =>
    ['/dashboard/fees', '/dashboard/admissions', '/dashboard/announcements'].includes(i.url)
  )

  const primaryRole = roles[0] ? roles[0].replace(/_/g, ' ') : 'Member'

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar transition-all duration-300">
      {/* Editorial Header */}
      <SidebarHeader className="border-b border-sidebar-border/80 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-[15px] font-semibold tracking-tight text-sidebar-foreground truncate">
              Greenwood
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60 font-medium">
              School Register
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-1 py-3">
        {/* Main Dashboard Link */}
        {overviewItem && (
          <SidebarGroup className="px-3 py-1">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href={overviewItem.url} />}
                    isActive={pathname === overviewItem.url}
                    className={cn(
                      'relative h-10 rounded-lg px-3 transition-colors duration-150',
                      pathname === overviewItem.url
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                    )}
                  >
                    <overviewItem.icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                    <span className="flex-1 truncate">{overviewItem.title}</span>
                    {pathname === overviewItem.url && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {pathname !== overviewItem.url && <NavigationProgress />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Academics & Register */}
        {academicItems.length > 0 && (
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
              Academics & Roster
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {academicItems.map((item) => {
                  const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url + '/'))
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className={cn(
                          'relative h-9 rounded-lg px-3 text-sm transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-sidebar-foreground/60')} strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                        {!isActive && <NavigationProgress />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Assessment & Records */}
        {assessmentItems.length > 0 && (
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
              Records & Grading
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {assessmentItems.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className={cn(
                          'relative h-9 rounded-lg px-3 text-sm transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-sidebar-foreground/60')} strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                        {!isActive && <NavigationProgress />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administrative & Finances */}
        {administrativeItems.length > 0 && (
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
              Administration & Fees
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {administrativeItems.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className={cn(
                          'relative h-9 rounded-lg px-3 text-sm transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-sidebar-foreground/60')} strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                        {!isActive && <NavigationProgress />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Profiles */}
        {extraItems.length > 0 && (
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
              My Profile
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {extraItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className={cn(
                          'relative h-9 rounded-lg px-3 text-sm transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer Role Badge */}
      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-sidebar-foreground/60">
              Authorized Role
            </span>
            <span className="text-xs font-semibold capitalize text-sidebar-foreground truncate">
              {primaryRole}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
