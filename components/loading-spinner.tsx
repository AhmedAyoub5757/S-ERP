import { Loader2Icon } from 'lucide-react'

export function LoadingSpinner({ label }: { label: string }) {
  return (
    <>
      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </>
  )
}
