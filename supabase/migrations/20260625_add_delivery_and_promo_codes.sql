alter table public.products
  add column if not exists delivery_type text not null default 'parcel_locker'
  check (delivery_type in ('parcel_locker', 'home_delivery'));

alter table public.cart_items
  add column if not exists delivery_type text not null default 'parcel_locker'
  check (delivery_type in ('parcel_locker', 'home_delivery'));

alter table public.cart_items
  add column if not exists delivery_cents integer not null default 300
  check (delivery_cents >= 0);

alter table public.orders
  add column if not exists delivery_type text
  check (delivery_type is null or delivery_type in ('parcel_locker', 'home_delivery'));

alter table public.orders
  add column if not exists promo_code text;

alter table public.orders
  add column if not exists promo_discount_percent numeric(5,2) not null default 0
  check (promo_discount_percent >= 0 and promo_discount_percent <= 100);

alter table public.order_items
  add column if not exists delivery_type text
  check (delivery_type is null or delivery_type in ('parcel_locker', 'home_delivery'));

alter table public.order_items
  add column if not exists delivery_cents integer not null default 0
  check (delivery_cents >= 0);

create table if not exists public.promo_codes (
  code citext primary key,
  discount_percent numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists promo_codes_created_at_idx on public.promo_codes(created_at desc);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_admin_manage" on public.promo_codes;
create policy "promo_codes_admin_manage"
  on public.promo_codes
  for all
  using (public.is_admin())
  with check (public.is_admin());
