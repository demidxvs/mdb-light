alter table public.invoices
  add column if not exists pdf_path text,
  add column if not exists pdf_generated_at timestamptz;

insert into storage.buckets (id, name, public)
values ('invoice-pdfs', 'invoice-pdfs', false)
on conflict (id) do nothing;

drop policy if exists "invoice_pdfs_admin_read" on storage.objects;
create policy "invoice_pdfs_admin_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'invoice-pdfs' and public.is_admin());

drop policy if exists "invoice_pdfs_admin_insert" on storage.objects;
create policy "invoice_pdfs_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'invoice-pdfs' and public.is_admin());

drop policy if exists "invoice_pdfs_admin_update" on storage.objects;
create policy "invoice_pdfs_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'invoice-pdfs' and public.is_admin())
with check (bucket_id = 'invoice-pdfs' and public.is_admin());

drop policy if exists "invoice_pdfs_admin_delete" on storage.objects;
create policy "invoice_pdfs_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'invoice-pdfs' and public.is_admin());
