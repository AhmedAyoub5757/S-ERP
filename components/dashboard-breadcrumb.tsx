'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const labelMap: Record<string, string> = {
  dashboard: 'Overview',
  students: 'Students',
  teachers: 'Teachers',
  classes: 'Classes & Sections',
  attendance: 'Attendance',
  examinations: 'Examinations',
  marks: 'Enter Marks',
  fees: 'Fees & Invoicing',
  invoices: 'Invoices',
  timetable: 'Timetable',
  children: 'My Children',
  announcements: 'Announcements',
  admissions: 'Admissions',
  new: 'Create New',
  edit: 'Edit Details',
}

export function DashboardBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Home className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Dashboard Overview</span>
        </span>
      </nav>
    )
  }

  const items = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const isLast = idx === segments.length - 1
    const rawLabel = labelMap[seg] ?? (seg.length > 20 ? `${seg.slice(0, 8)}...` : seg.replace(/-/g, ' '))
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className={cn('hidden items-center gap-1.5 text-xs md:flex', className)}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          {item.isLast ? (
            <span className="font-semibold text-foreground tracking-tight" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground font-medium"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
