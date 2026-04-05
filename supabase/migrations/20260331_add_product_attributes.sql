create table if not exists public.attributes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ru text not null,
  name_en text not null,
  name_lv text not null,
  name_el text not null,
  value_type text not null default 'text',
  option_values jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.attributes add column if not exists value_type text not null default 'text';
alter table public.attributes add column if not exists option_values jsonb not null default '[]'::jsonb;

update public.attributes
set option_values = '[]'::jsonb
where option_values is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attributes_value_type_check'
  ) then
    alter table public.attributes
      add constraint attributes_value_type_check
      check (value_type in ('text', 'boolean', 'multi_select'));
  end if;
end $$;

create table if not exists public.product_attribute_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  attribute_id uuid not null references public.attributes(id) on delete cascade,
  value text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, attribute_id)
);

create index if not exists attributes_slug_idx on public.attributes(slug);
create index if not exists product_attribute_values_product_id_idx on public.product_attribute_values(product_id);
create index if not exists product_attribute_values_attribute_id_idx on public.product_attribute_values(attribute_id);

drop trigger if exists attributes_set_updated_at on public.attributes;
create trigger attributes_set_updated_at
  before update on public.attributes
  for each row execute procedure public.set_updated_at();

drop trigger if exists product_attribute_values_set_updated_at on public.product_attribute_values;
create trigger product_attribute_values_set_updated_at
  before update on public.product_attribute_values
  for each row execute procedure public.set_updated_at();

alter table public.attributes enable row level security;
alter table public.product_attribute_values enable row level security;

drop policy if exists "attributes_public_read" on public.attributes;
create policy "attributes_public_read"
  on public.attributes
  for select
  using (true);

drop policy if exists "attributes_admin_manage" on public.attributes;
create policy "attributes_admin_manage"
  on public.attributes
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_attribute_values_public_read" on public.product_attribute_values;
create policy "product_attribute_values_public_read"
  on public.product_attribute_values
  for select
  using (
    exists (
      select 1
      from public.products
      where public.products.id = product_attribute_values.product_id
        and (public.products.is_active or public.is_admin())
    )
  );

drop policy if exists "product_attribute_values_admin_manage" on public.product_attribute_values;
create policy "product_attribute_values_admin_manage"
  on public.product_attribute_values
  for all
  using (public.is_admin())
  with check (public.is_admin());
