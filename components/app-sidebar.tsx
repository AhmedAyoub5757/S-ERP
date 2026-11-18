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
import { GraduationCap, User as UserIcon } from 'lucide-react'

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
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">Greenwood School</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname === item.url}>
                    <item.icon />
                    <span>{item.title}</span>
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