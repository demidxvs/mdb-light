alter table public.cart_items
  add column if not exists selected_material text;

alter table public.order_items
  add column if not exists selected_material text;

update public.cart_items
set selected_material = product_snapshot ->> 'selected_material'
where selected_material is null
  and coalesce(product_snapshot ->> 'selected_material', '') <> '';

update public.order_items
set selected_material = product_snapshot ->> 'selected_material'
where selected_material is null
  and coalesce(product_snapshot ->> 'selected_material', '') <> '';

drop index if exists public.cart_items_cart_product_color_idx;
drop index if exists public.cart_items_cart_product_variant_idx;

create unique index if not exists cart_items_cart_product_variant_idx
  on public.cart_items (
    cart_id,
    product_id,
    coalesce(selected_color, ''),
    coalesce(selected_length, ''),
    coalesce(selected_material, '')
  );
