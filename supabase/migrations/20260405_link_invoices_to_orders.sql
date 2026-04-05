alter table public.invoices
  add column if not exists order_id uuid references public.orders(id) on delete set null;

create unique index if not exists invoices_order_id_idx
  on public.invoices(order_id)
  where order_id is not null;
