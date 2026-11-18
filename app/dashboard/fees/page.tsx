import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AddFeeStructureDialog } from '@/components/fees/add-fee-structure-dialog'
import { GenerateInvoicesButton } from '@/components/fees/generate-invoices-button'

export const dynamic = 'force-dynamic'

export default async function FeesPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canManage = roles.includes('school_admin') || roles.includes('accountant')

  const { data: feeStructures } = await supabase
    .from('fee_structures')
    .select('id, name, amount, frequency, classes ( name )')
    .order('class_id')

  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Structures</h1>
          <p className="text-muted-foreground">{feeStructures?.length ?? 0} fee structures</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/fees/invoices" className={cn(buttonVariants({ variant: 'outline' }))}>
            View Invoices
          </Link>
          {canManage && <AddFeeStructureDialog classes={(classes ?? []).map((c) => ({ id: c.id, name: c.name }))} />}
        </div>
      </div>

      <div className="divide-y rounded-md border">
        {(feeStructures ?? []).map((fs: any) => (
          <div key={fs.id} className="flex items-center justify-between p-3 text-sm">
            <div>
              <p className="font-medium">{fs.name} — {fs.classes?.name}</p>
              <p className="capitalize text-muted-foreground">{fs.frequency} · Rs. {fs.amount}</p>
            </div>
            {canManage && <GenerateInvoicesButton feeStructureId={fs.id} />}
          </div>
        ))}
        {(!feeStructures || feeStructures.length === 0) && (
          <p className="p-3 text-sm text-muted-foreground">No fee structures yet.</p>
        )}
      </div>
    </div>
  )
}