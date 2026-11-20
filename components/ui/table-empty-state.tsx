import * as React from 'react'
import { SearchX, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  isFiltered?: boolean
  onClearFilters?: () => void
}

export function TableEmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria in this register.',
  actionLabel,
  onAction,
  actionHref,
  isFiltered,
  onClearFilters,
}: TableEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <SearchX className="h-5 w-5" />
      </div>
      <p className="mt-3 font-serif text-base font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-2">
        {isFiltered && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {actionLabel && (
          <Button
            size="sm"
            variant="default"
            onClick={onAction}
            {...(actionHref ? { render: <a href={actionHref} /> } : {})}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
