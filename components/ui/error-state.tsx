'use client'

import * as React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Unable to display records',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center',
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-serif text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-destructive/30 hover:bg-destructive/10 text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry request</span>
        </Button>
      )}
    </div>
  )
}
