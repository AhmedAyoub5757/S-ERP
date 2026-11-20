import Link from 'next/link'
import { GraduationCap, Home, Compass } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center text-foreground">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            404 — Record Not Found
          </p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
            Page not in the register
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page, record, or resource you are looking for does not exist or may have been moved to another section of the school portal.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </Link>
          <Link
            href="/dashboard/students"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student Register</span>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/80 border-t border-border pt-4">
          Greenwood School Management ERP · All rights reserved.
        </p>
      </div>
    </div>
  )
}
