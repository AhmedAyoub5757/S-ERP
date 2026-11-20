'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Sun,
  Moon,
  Sunset,
  Calendar,
  Users,
  CalendarCheck,
  Wallet,
  Megaphone,
  Clock,
  FileText,
  ClipboardList,
  Plus,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ActionIconType =
  | 'users'
  | 'calendar'
  | 'wallet'
  | 'megaphone'
  | 'clock'
  | 'file-text'
  | 'clipboard'
  | 'plus'

const iconMap: Record<ActionIconType, React.ComponentType<{ className?: string }>> = {
  users: Users,
  calendar: CalendarCheck,
  wallet: Wallet,
  megaphone: Megaphone,
  clock: Clock,
  'file-text': FileText,
  clipboard: ClipboardList,
  plus: Plus,
}

export interface QuickAction {
  label: string
  href: string
  icon?: ActionIconType
  variant?: 'default' | 'outline' | 'secondary'
}

interface DashboardWelcomeProps {
  roles: string[]
  email: string
  actions?: QuickAction[]
}

export function DashboardWelcome({ roles, email, actions = [] }: DashboardWelcomeProps) {
  const [greeting, setGreeting] = React.useState('Welcome')
  const [dateStr, setDateStr] = React.useState('')

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }

    const today = new Date()
    const formatted = today.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    setDateStr(formatted)
  }, [])

  const roleTitle = roles[0]
    ? roles[0].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Member'

  return (
    <div className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
      {/* Title & Narrative */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            suppressHydrationWarning
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-2xs"
          >
            <Calendar className="h-3 w-3 text-primary" />
            <span>{dateStr || 'Academic Term 2'}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Campus Operational</span>
          </span>
        </div>

        <h1
          suppressHydrationWarning
          className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
        >
          {greeting}, {roleTitle}
        </h1>

        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Here is your live daily snapshot across admissions, attendance registers, and academic operations.
        </p>
      </div>

      {/* Quick Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions.map((act, i) => {
            const Icon = act.icon ? iconMap[act.icon] ?? Plus : Plus
            return (
              <Link
                key={i}
                href={act.href}
                className={cn(
                  buttonVariants({
                    variant: act.variant ?? (i === 0 ? 'default' : 'outline'),
                    size: 'sm',
                  }),
                  'h-9 gap-1.5 shadow-2xs font-medium text-xs'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{act.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
