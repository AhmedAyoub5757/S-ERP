import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUSES = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Enrolled', value: 'enrolled' },
]

export function StatusFilter({ current }: { current: string }) {
  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <Link
          key={s.value}
          href={s.value ? `/dashboard/admissions?status=${s.value}` : '/dashboard/admissions'}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm',
            current === s.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {s.label}
        </Link>
      ))}
    </div>
  )
}