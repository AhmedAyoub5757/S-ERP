'use client'

import { useFormStatus } from 'react-dom'
import { ArrowRight, Loader2Icon } from 'lucide-react'

export function LoginSubmit() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex h-12 w-full items-center justify-center rounded-md bg-[#18372a] text-sm font-medium text-white transition duration-200 hover:bg-[#234936] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Signing in...' : 'Sign in'}
      {!pending && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </button>
  )
}
