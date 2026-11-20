import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Users,
  GraduationCap,
  School,
  Wallet,
  Clock,
  TrendingUp,
  CalendarCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react'

export type StatIconType =
  | 'users'
  | 'faculty'
  | 'classes'
  | 'wallet'
  | 'clock'
  | 'trending'
  | 'calendar'
  | 'file'
  | 'check'

const statIconMap: Record<StatIconType, React.ComponentType<{ className?: string }>> = {
  users: Users,
  faculty: GraduationCap,
  classes: School,
  wallet: Wallet,
  clock: Clock,
  trending: TrendingUp,
  calendar: CalendarCheck,
  file: FileText,
  check: CheckCircle2,
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  delta?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  icon?: StatIconType | React.ComponentType<{ className?: string }>
  featured?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  delta,
  icon,
  featured = false,
  className,
}: StatCardProps) {
  const IconComponent =
    typeof icon === 'string'
      ? statIconMap[icon as StatIconType] ?? null
      : (icon as React.ComponentType<{ className?: string }> | undefined)

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5',
        featured
          ? 'border-primary/30 bg-primary/5 shadow-xs'
          : 'border-border bg-card shadow-2xs hover:border-border/90',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="font-serif text-3xl font-medium tracking-tight text-foreground tabular-nums sm:text-4xl">
            {value}
          </div>
        </div>
        {IconComponent && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
              featured
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground group-hover:text-foreground'
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>
        )}
      </div>

      {(description || delta) && (
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
          {description && <span className="text-muted-foreground">{description}</span>}
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold tabular-nums',
                delta.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
              )}
            >
              {delta.value}
              {delta.label && <span className="text-[11px] font-normal text-muted-foreground">{delta.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
