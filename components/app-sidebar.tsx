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
} from '@/components/ui/sidebar'
import { navItems } from '@/lib/nav-config'
import { GraduationCap, User as UserIcon, ChevronRight } from 'lucide-react'
import { NavigationProgress } from '@/components/navigation-progress'

export function AppSidebar({ roles, userId }: { roles: string[]; userId: string }) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) => item.roles.some((r) => roles.includes(r)))

  const extraItems: { title: string; url: string; icon: typeof UserIcon }[] = []
  if (roles.includes('student')) {
    extraItems.push({ title: 'My Profile', url: `/dashboard/students/${userId}`, icon: UserIcon })
  }
  if (roles.includes('teacher')) {
    extraItems.push({ title: 'My Profile', url: `/dashboard/teachers/${userId}`, icon: UserIcon })
  }
  const items = [...visibleItems, ...extraItems]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-primary/20 bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[15px] font-semibold tracking-tight">Greenwood</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/55">School Register</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    className="h-10 rounded-md px-3 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-sidebar-accent"
                  >
                    <item.icon strokeWidth={1.7} />
                    <span className="flex-1">{item.title}</span>
                    {pathname === item.url && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                    {pathname !== item.url && <NavigationProgress />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}