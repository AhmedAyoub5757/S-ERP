import * as React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccessDeniedProps {
  requiredRole?: string
  message?: string
  className?: string
}

export function AccessDenied({
  requiredRole,
  message = "You don't have permission to perform this action or view this section.",
  className,
}: AccessDeniedProps) {
  return (
    <div
      className={cn(
        'flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        Access Restricted
      </p>
      <h3 className="mt-1 font-serif text-xl font-medium text-foreground">
        Permissions required
      </h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {message}
        {requiredRole && (
          <span className="block mt-1 font-mono text-[11px] text-foreground">
            Role requirement: {requiredRole}
          </span>
        )}
      </p>
      <div className="mt-5 flex items-center gap-2.5">
        <Button size="sm" variant="outline" render={<Link href="/dashboard" />} className="gap-1.5">
          <Home className="h-3.5 w-3.5" />
          <span>Back to Overview</span>
        </Button>
      </div>
    </div>
  )
}
