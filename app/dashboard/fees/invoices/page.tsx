import { createClient } from '@/lib/supabase/server'
import { InvoicesTable } from '@/components/fees/invoices-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvoiceRow } from '@/lib/types/invoice'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, issue_date, due_date, total_amount, status,
      students ( admission_number, profiles ( full_name ) )
    `)
    .order('issue_date', { ascending: false })

  const rows = (invoices ?? []) as unknown as InvoiceRow[]
  const totalInvoiced = rows.reduce((sum, r) => sum + Number(r.total_amount), 0)
  const totalPaid = rows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + Number(r.total_amount), 0)
  const totalOutstanding = rows
    .filter((r) => r.status === 'unpaid' || r.status === 'partially_paid' || r.status === 'overdue')
    .reduce((sum, r) => sum + Number(r.total_amount), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Invoiced</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">Rs. {totalInvoiced.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Collected</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">Rs. {totalPaid.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">Rs. {totalOutstanding.toLocaleString()}</CardContent>
        </Card>
      </div>

      <InvoicesTable data={rows} />
    </div>
  )
}