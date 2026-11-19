'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reviewApplication } from '@/app/dashboard/admissions/actions'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

export function ReviewActions({ applicationId }: { applicationId: number }) {
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | null>(null)
  const router = useRouter()

  async function handleDecision(decision: 'approved' | 'rejected') {
    setSubmitting(decision)
    const formData = new FormData()
    formData.set('applicationId', String(applicationId))
    formData.set('decision', decision)

    const result = await reviewApplication(formData)
    setSubmitting(null)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success(decision === 'approved' ? 'Application approved' : 'Application rejected')
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={!!submitting} onClick={() => handleDecision('approved')}>
        <Check className="mr-1 h-3 w-3" />
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={!!submitting} onClick={() => handleDecision('rejected')}>
        <X className="mr-1 h-3 w-3" />
        Reject
      </Button>
    </div>
  )
}