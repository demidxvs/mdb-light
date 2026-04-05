create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  issue_date date not null default current_date,
  client_name text not null,
  client_registration_number text,
  client_address text not null,
  client_email text,
  client_phone text,
  amount_in_words text,
  advance_payment_cents integer not null default 0 check (advance_payment_cents >= 0),
  note text,
  supplier_name text not null default 'MDB Group, SIA',
  supplier_registration_number text not null default '40203701967',
  supplier_address text not null default 'Jurmala, Skolas iela 30 - 107, LV-2016',
  supplier_phone text not null default '+371 24443333',
  supplier_email text not null default 'info@mdbgroup.lv',
  supplier_website text not null default 'mdbgroup.lv',
  supplier_iban text not null default 'LV12HABA0551063522870',
  supplier_bank text not null default 'AS "Swedbank", Kods: HABALV22',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  position integer not null default 0,
  name text not null,
  sku text,
  unit text not null default 'gab',
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists invoices_issue_date_idx on public.invoices(issue_date);
create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

drop policy if exists "invoices_admin_manage" on public.invoices;
create policy "invoices_admin_manage"
  on public.invoices
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "invoice_items_admin_manage" on public.invoice_items;
create policy "invoice_items_admin_manage"
  on public.invoice_items
  for all
  using (public.is_admin())
  with check (public.is_admin());
