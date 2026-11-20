'use client'

import * as React from 'react'
import Link from 'next/link'
import { mapErrorMessage, logTechnicalError } from '@/lib/error-messages'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    logTechnicalError('dashboard.page.error', error)
  }, [error])

  const friendlyMessage = mapErrorMessage(error, 'Something went wrong while loading this page. Please try again.')

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-destructive/20 bg-card p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">
            Workspace Notice
          </p>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            Unable to display information
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {friendlyMessage}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try again</span>
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground/80 border-t border-border pt-4">
          Error digest: <span className="font-mono text-muted-foreground">{error?.digest ?? 'ERR_DASHBOARD'}</span>
        </p>
      </div>
    </div>
  )
}
