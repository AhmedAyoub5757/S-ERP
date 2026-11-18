-- supabase/migrations/..._parent_fee_visibility.sql

create policy invoices_parent_select
on public.invoices
for select
to authenticated
using (
  current_user_has_role('parent') and is_parent_of(student_id)
);

create policy invoice_items_parent_select
on public.invoice_items
for select
to authenticated
using (
  current_user_has_role('parent')
  and exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and is_parent_of(i.student_id)
  )
);

create policy payments_parent_select
on public.payments
for select
to authenticated
using (
  current_user_has_role('parent')
  and exists (
    select 1 from public.invoices i
    where i.id = payments.invoice_id
      and is_parent_of(i.student_id)
  )
);