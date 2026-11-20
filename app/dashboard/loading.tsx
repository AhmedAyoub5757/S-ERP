import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300" aria-label="Loading dashboard">
      {/* Editorial Welcome Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-lg sm:w-80" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Asymmetric KPI Skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Featured larger card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3 sm:col-span-2 lg:col-span-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-3.5 w-44 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Charts & Timeline Skeletons */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
