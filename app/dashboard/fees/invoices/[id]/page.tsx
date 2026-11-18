import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecordPaymentDialog } from '@/components/fees/record-payment-dialog'

export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const canManage = roles.includes('school_admin') || roles.includes('accountant')

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, issue_date, due_date, total_amount, status,
      students ( admission_number, profiles ( full_name ) )
    `)
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const { data: items } = await supabase.from('invoice_items').select('id, description, amount').eq('invoice_id', id)
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, payment_method, reference_number')
    .eq('invoice_id', id)
    .order('payment_date', { ascending: false })

  const totalPaid = (payments ?? []).reduce((sum, p: any) => sum + Number(p.amount), 0)
  const balance = Number(invoice.total_amount) - totalPaid
  const studentInfo = (invoice as any).students

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          <p className="text-muted-foreground">{studentInfo?.profiles?.full_name} · #{studentInfo?.admission_number}</p>
        </div>
        {canManage && balance > 0 && <RecordPaymentDialog invoiceId={invoice.id} maxAmount={balance} />}
      </div>

      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Issue Date</p><p>{invoice.issue_date}</p></div>
          <div><p className="text-muted-foreground">Due Date</p><p>{invoice.due_date}</p></div>
          <div><p className="text-muted-foreground">Total</p><p>Rs. {Number(invoice.total_amount).toLocaleString()}</p></div>
          <div><p className="text-muted-foreground">Balance</p><p className={balance > 0 ? 'text-red-600' : 'text-green-600'}>Rs. {balance.toLocaleString()}</p></div>
          <div><p className="text-muted-foreground">Status</p><Badge className="capitalize">{invoice.status.replace('_', ' ')}</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <span>{item.description}</span>
              <span>Rs. {Number(item.amount).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {payments && payments.length > 0 ? (
            payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p>{p.payment_date}</p>
                  <p className="capitalize text-muted-foreground">
                    {p.payment_method.replace('_', ' ')}{p.reference_number ? ` · ${p.reference_number}` : ''}
                  </p>
                </div>
                <span>Rs. {Number(p.amount).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No payments recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}