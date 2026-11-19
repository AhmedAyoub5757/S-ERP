'use client'

import { useFormStatus } from 'react-dom'
import { Loader2Icon } from 'lucide-react'

export function LoginSubmit() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}
