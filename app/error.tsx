'use client'

import * as React from 'react'
import Link from 'next/link'
import { mapErrorMessage, logTechnicalError } from '@/lib/error-messages'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    logTechnicalError('root.app.error', error)
  }, [error])

  const friendlyMessage = mapErrorMessage(error, "We couldn't complete your request. Please try again later.")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">
            System Notice
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Something unexpected occurred
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {friendlyMessage}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry request</span>
          </Button>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <Home className="h-4 w-4" />
            <span>Go to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
