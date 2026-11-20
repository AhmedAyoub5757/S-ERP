'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface DetailField {
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}

interface DetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  badge?: React.ReactNode
  fields: DetailField[]
  actions?: React.ReactNode
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  subtitle,
  badge,
  fields,
  actions,
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {subtitle && <DialogDescription className="mt-0.5">{subtitle}</DialogDescription>}
            </div>
            {badge && <div>{badge}</div>}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          {fields.map((field, idx) => (
            <div
              key={idx}
              className={field.fullWidth ? 'col-span-1 sm:col-span-2' : 'col-span-1'}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {field.label}
              </p>
              <div className="mt-1 text-sm font-medium text-foreground">
                {field.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter showCloseButton>
          {actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
