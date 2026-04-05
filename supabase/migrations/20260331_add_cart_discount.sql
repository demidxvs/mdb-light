alter table public.carts
  add column if not exists discount_cents integer not null default 0;

alter table public.carts
  drop constraint if exists carts_discount_cents_check;

alter table public.carts
  add constraint carts_discount_cents_check
  check (discount_cents >= 0);
