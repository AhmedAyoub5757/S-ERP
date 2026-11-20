'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({
  className,
  variant = 'ghost',
  size = 'icon-sm',
}: {
  className?: string
  variant?: 'ghost' | 'outline' | 'default' | 'secondary'
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = (resolvedTheme || theme) === 'dark'
    const nextTheme = isDark ? 'light' : 'dark'

    // If View Transitions API is not available or reduced motion is preferred
    if (
      typeof document === 'undefined' ||
      !(document as any).startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(nextTheme)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
  }

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('relative rounded-xl text-muted-foreground', className)}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = (resolvedTheme || theme) === 'dark'

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        'relative rounded-xl transition-transform active:scale-95 hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-primary',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500 dark:text-foreground" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-foreground dark:text-emerald-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
