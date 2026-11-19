'use client'

import { useLinkStatus } from 'next/link'

export function NavigationProgress() {
  const { pending } = useLinkStatus()

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
    >
      {pending && (
        <span className="block h-full w-1/3 animate-[shimmer_1s_ease-in-out_infinite] bg-primary" />
      )}
    </span>
  )
}
