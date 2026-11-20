'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reviewApplication } from '@/app/dashboard/admissions/actions'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { EnrollApplicationDialog, type EnrollmentSection } from '@/components/admissions/enroll-application-dialog'

export function ReviewActions({
  applicationId,
  status,
  applicantName,
  guardianName,
  guardianPhone,
  guardianEmail,
  applyingForClassId,
  sections,
}: {
  applicationId: number
  status: 'pending' | 'approved' | 'rejected' | 'enrolled'
  applicantName: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string | null
  applyingForClassId: number
  sections: EnrollmentSection[]
}) {
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

  if (status === 'approved') {
    return (
      <EnrollApplicationDialog
        applicationId={applicationId}
        applicantName={applicantName}
        guardianName={guardianName}
        guardianPhone={guardianPhone}
        guardianEmail={guardianEmail}
        applyingForClassId={applyingForClassId}
        sections={sections}
      />
    )
  }

  if (status !== 'pending') {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" loading={submitting === 'approved'} disabled={!!submitting && submitting !== 'approved'} onClick={() => handleDecision('approved')}>
        {submitting !== 'approved' && <Check className="mr-1 h-3 w-3" />}
        {submitting === 'approved' ? 'Approving...' : 'Approve'}
      </Button>
      <Button size="sm" variant="outline" loading={submitting === 'rejected'} disabled={!!submitting && submitting !== 'rejected'} onClick={() => handleDecision('rejected')}>
        {submitting !== 'rejected' && <X className="mr-1 h-3 w-3" />}
        {submitting === 'rejected' ? 'Rejecting...' : 'Reject'}
      </Button>
    </div>
  )
}