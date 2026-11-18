export interface InvoiceRow {
  id: number
  invoice_number: string
  issue_date: string
  due_date: string
  total_amount: number
  status: string
  students: { admission_number: string; profiles: { full_name: string } | null } | null
}