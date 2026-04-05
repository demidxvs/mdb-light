alter table public.orders
  add column if not exists order_code text,
  add column if not exists payment_method text not null default 'stripe'
    check (payment_method in ('stripe', 'bank_transfer')),
  add column if not exists payment_id text;

update public.orders
set order_code = 'MDB-' || lpad(order_number::text, 6, '0')
where order_code is null
  and order_number is not null;

create unique index if not exists orders_order_code_idx on public.orders(order_code);
