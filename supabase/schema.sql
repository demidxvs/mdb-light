create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  first_name text,
  last_name text,
  full_name text,
  phone text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'ru', 'el', 'lv')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  cover_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null check (locale in ('en', 'ru', 'el', 'lv')),
  name text not null,
  slug text,
  description text,
  meta_title text,
  meta_description text,
  primary key (category_id, locale)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  sku text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  brand text,
  currency char(3) not null default 'EUR',
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  track_inventory boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  primary_image_url text,
  image_urls text[] not null default '{}'::text[],
  attributes jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check (locale in ('en', 'ru', 'el', 'lv')),
  name text not null,
  slug text,
  short_description text,
  description text,
  specs jsonb not null default '{}'::jsonb,
  primary key (product_id, locale)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  currency char(3) not null default 'EUR',
  discount_cents integer not null default 0 check (discount_cents >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists carts_one_active_cart_per_user_idx
  on public.carts(user_id)
  where status = 'active';

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  selected_color text,
  selected_length text,
  selected_material text,
  selected_options jsonb not null default '{}'::jsonb,
  variant_key text not null default '',
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  currency char(3) not null default 'EUR',
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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
  pdf_path text,
  pdf_generated_at timestamptz,
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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated by default as identity unique,
  order_code text unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  cart_id uuid references public.carts(id) on delete set null,
  payment_method text not null default 'stripe'
    check (payment_method in ('stripe', 'bank_transfer')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'authorized', 'paid', 'failed', 'refunded')),
  fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency char(3) not null default 'EUR',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  payment_id text,
  customer_email citext,
  customer_name text,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb not null default '{}'::jsonb,
  notes text,
  placed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  selected_color text,
  selected_length text,
  selected_material text,
  selected_options jsonb not null default '{}'::jsonb,
  product_name text not null,
  product_sku text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products
  add column if not exists image_urls text[] not null default '{}'::text[];

alter table public.cart_items
  add column if not exists selected_color text;

alter table public.cart_items
  add column if not exists selected_length text;

alter table public.cart_items
  add column if not exists selected_material text;

alter table public.cart_items
  add column if not exists selected_options jsonb not null default '{}'::jsonb;

alter table public.cart_items
  add column if not exists variant_key text not null default '';

alter table public.order_items
  add column if not exists selected_color text;

alter table public.order_items
  add column if not exists selected_length text;

alter table public.order_items
  add column if not exists selected_material text;

alter table public.order_items
  add column if not exists selected_options jsonb not null default '{}'::jsonb;

alter table public.orders
  add column if not exists order_code text;

alter table public.orders
  add column if not exists payment_method text not null default 'stripe'
    check (payment_method in ('stripe', 'bank_transfer'));

alter table public.orders
  add column if not exists payment_id text;

alter table public.invoices
  add column if not exists order_id uuid references public.orders(id) on delete set null;

update public.orders
set order_code = 'MDB-' || lpad(order_number::text, 6, '0')
where order_code is null
  and order_number is not null;

alter table public.product_attribute_values
  add column if not exists price_adjustments jsonb not null default '{}'::jsonb;

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists categories_sort_order_idx on public.categories(sort_order);
create unique index if not exists category_translations_locale_slug_idx
  on public.category_translations(locale, slug)
  where slug is not null;
create unique index if not exists product_translations_locale_slug_idx
  on public.product_translations(locale, slug)
  where slug is not null;
create index if not exists products_category_sort_order_idx on public.products(category_id, sort_order, created_at desc);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_is_active_idx on public.products(is_active);
create index if not exists products_is_featured_idx on public.products(is_featured);
create index if not exists carts_user_id_idx on public.carts(user_id);
create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);
create unique index if not exists cart_items_cart_product_variant_idx
  on public.cart_items(cart_id, product_id, variant_key);
create index if not exists invoices_issue_date_idx on public.invoices(issue_date);
create index if not exists invoices_status_idx on public.invoices(status);
create unique index if not exists invoices_order_id_idx
  on public.invoices(order_id)
  where order_id is not null;
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create unique index if not exists orders_order_code_idx on public.orders(order_code);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    phone
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')
    ),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
  before update on public.carts
  for each row execute procedure public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute procedure public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "admins_select_own_or_admin" on public.admins;
create policy "admins_select_own_or_admin"
  on public.admins
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories
  for select
  using (is_active or public.is_admin());

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
  on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "category_translations_public_read" on public.category_translations;
create policy "category_translations_public_read"
  on public.category_translations
  for select
  using (
    exists (
      select 1
      from public.categories
      where public.categories.id = category_translations.category_id
        and (public.categories.is_active or public.is_admin())
    )
  );

drop policy if exists "category_translations_admin_manage" on public.category_translations;
create policy "category_translations_admin_manage"
  on public.category_translations
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  using (is_active or public.is_admin());

drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
  on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_translations_public_read" on public.product_translations;
create policy "product_translations_public_read"
  on public.product_translations
  for select
  using (
    exists (
      select 1
      from public.products
      where public.products.id = product_translations.product_id
        and (public.products.is_active or public.is_admin())
    )
  );

drop policy if exists "product_translations_admin_manage" on public.product_translations;
create policy "product_translations_admin_manage"
  on public.product_translations
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "carts_select_own_or_admin" on public.carts;
create policy "carts_select_own_or_admin"
  on public.carts
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "carts_insert_own_or_admin" on public.carts;
create policy "carts_insert_own_or_admin"
  on public.carts
  for insert
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "carts_update_own_or_admin" on public.carts;
create policy "carts_update_own_or_admin"
  on public.carts
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "carts_delete_own_or_admin" on public.carts;
create policy "carts_delete_own_or_admin"
  on public.carts
  for delete
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "cart_items_select_own_or_admin" on public.cart_items;
create policy "cart_items_select_own_or_admin"
  on public.cart_items
  for select
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and (public.carts.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "cart_items_insert_own_or_admin" on public.cart_items;
create policy "cart_items_insert_own_or_admin"
  on public.cart_items
  for insert
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and (public.carts.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "cart_items_update_own_or_admin" on public.cart_items;
create policy "cart_items_update_own_or_admin"
  on public.cart_items
  for update
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and (public.carts.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and (public.carts.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "cart_items_delete_own_or_admin" on public.cart_items;
create policy "cart_items_delete_own_or_admin"
  on public.cart_items
  for delete
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and (public.carts.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders
  for select
  using (auth.uid() = user_id or public.is_admin());

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

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin"
  on public.orders
  for insert
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and (public.orders.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items_insert_own_or_admin" on public.order_items;
create policy "order_items_insert_own_or_admin"
  on public.order_items
  for insert
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and (public.orders.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items_admin_update" on public.order_items;
create policy "order_items_admin_update"
  on public.order_items
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "order_items_admin_delete" on public.order_items;
create policy "order_items_admin_delete"
  on public.order_items
  for delete
  using (public.is_admin());

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
