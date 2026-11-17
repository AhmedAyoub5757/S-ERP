import { LayoutDashboard, Users } from 'lucide-react'

export type NavItem = {
  title: string
  url: string
  icon: typeof LayoutDashboard
  roles: string[]
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['school_admin', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent'],
  },
  {
    title: 'Students',
    url: '/dashboard/students',
    icon: Users,
    roles: ['school_admin', 'principal', 'teacher', 'receptionist'],
  },
]