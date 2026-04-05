alter table public.product_attribute_values
  add column if not exists price_adjustments jsonb not null default '{}'::jsonb;

alter table public.cart_items
  add column if not exists selected_options jsonb not null default '{}'::jsonb;

alter table public.cart_items
  add column if not exists variant_key text not null default '';

alter table public.order_items
  add column if not exists selected_options jsonb not null default '{}'::jsonb;

update public.cart_items
set selected_options =
  jsonb_strip_nulls(
    jsonb_build_object(
      'available-colors', nullif(selected_color, ''),
      'length', nullif(selected_length, ''),
      'material', nullif(selected_material, '')
    )
  )
where selected_options = '{}'::jsonb;

update public.cart_items
set variant_key = md5(coalesce(selected_options::text, '{}'::text))
where coalesce(variant_key, '') = '';

update public.order_items
set selected_options =
  jsonb_strip_nulls(
    jsonb_build_object(
      'available-colors', nullif(selected_color, ''),
      'length', nullif(selected_length, ''),
      'material', nullif(selected_material, '')
    )
  )
where selected_options = '{}'::jsonb;

drop index if exists public.cart_items_cart_product_color_idx;
drop index if exists public.cart_items_cart_product_variant_idx;

create unique index if not exists cart_items_cart_product_variant_idx
  on public.cart_items (
    cart_id,
    product_id,
    variant_key
  );
