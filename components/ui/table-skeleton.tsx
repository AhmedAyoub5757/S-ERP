import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className="space-y-4">
      {/* Top search & filter skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table container skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Header row */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border/60">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-3/4 rounded" />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4 py-2.5 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 rounded ${colIndex === 0 ? 'w-1/2' : colIndex === 1 ? 'w-4/5' : 'w-2/3'}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination footer skeleton */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}
