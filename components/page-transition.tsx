'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      '[data-slot="card"], [data-slot="table-row"], h1, [data-slot="table-container"]'
    ))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px' }
    )

    targets.forEach((target, index) => {
      target.classList.add('scroll-reveal')
      target.style.setProperty('--scroll-delay', `${Math.min(index * 35, 210)}ms`)
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [pathname])

  return (
    <div ref={ref} key={pathname} className="page-enter flex-1">
      {children}
    </div>
  )
}
