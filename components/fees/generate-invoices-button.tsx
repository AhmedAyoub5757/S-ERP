'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { generateInvoices } from '@/app/dashboard/fees/actions'
import { Button } from '@/components/ui/button'

export function GenerateInvoicesButton({ feeStructureId }: { feeStructureId: number }) {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setSubmitting(true)
    const formData = new FormData()
    formData.set('feeStructureId', String(feeStructureId))
    const result = await generateInvoices(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Generated ${result?.created ?? 0} invoice(s)`)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={submitting}>
      {submitting ? 'Generating...' : 'Generate Invoices'}
    </Button>
  )
}