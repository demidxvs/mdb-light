alter table public.category_translations
  add column if not exists slug text;

alter table public.product_translations
  add column if not exists slug text;

alter table public.products
  add column if not exists sort_order integer not null default 0;

update public.category_translations
set slug = null
where slug is distinct from null;

update public.product_translations
set slug = null
where slug is distinct from null;

with ranked_products as (
  select
    id,
    row_number() over (
      partition by category_id
      order by created_at asc, id asc
    ) - 1 as position
  from public.products
)
update public.products
set sort_order = ranked_products.position
from ranked_products
where ranked_products.id = products.id
  and products.sort_order = 0;

create unique index if not exists category_translations_locale_slug_idx
  on public.category_translations(locale, slug)
  where slug is not null;

create unique index if not exists product_translations_locale_slug_idx
  on public.product_translations(locale, slug)
  where slug is not null;

create index if not exists products_category_sort_order_idx
  on public.products(category_id, sort_order, created_at desc);
