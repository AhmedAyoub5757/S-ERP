import * as React from 'react'
import { cn } from '@/lib/utils'

export type StatusType =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'transferred'
  | 'pending'
  | 'approved'
  | 'enrolled'
  | 'rejected'
  | 'paid'
  | 'partially_paid'
  | 'unpaid'
  | 'overdue'
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'

interface StatusBadgeProps {
  status: string
  className?: string
  dot?: boolean
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dotColor: string }
> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  enrolled: {
    label: 'Enrolled',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  present: {
    label: 'Present',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  partially_paid: {
    label: 'Partially Paid',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  late: {
    label: 'Late',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  unpaid: {
    label: 'Unpaid',
    bg: 'bg-muted dark:bg-muted/60',
    text: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-destructive/10 dark:bg-destructive/20',
    text: 'text-destructive',
    dotColor: 'bg-destructive',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-destructive/10 dark:bg-destructive/20',
    text: 'text-destructive',
    dotColor: 'bg-destructive',
  },
  absent: {
    label: 'Absent',
    bg: 'bg-destructive/10 dark:bg-destructive/20',
    text: 'text-destructive',
    dotColor: 'bg-destructive',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground/60',
  },
  graduated: {
    label: 'Graduated',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    dotColor: 'bg-purple-500',
  },
  transferred: {
    label: 'Transferred',
    bg: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground/60',
  },
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase()
  const config = statusConfig[normalized] ?? {
    label: status.replace(/_/g, ' '),
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide transition-colors',
        config.bg,
        config.text,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />}
      <span>{config.label}</span>
    </span>
  )
}
