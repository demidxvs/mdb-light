alter table public.cart_items
  add column if not exists selected_length text;

alter table public.order_items
  add column if not exists selected_length text;

update public.cart_items
set selected_length = product_snapshot ->> 'selected_length'
where selected_length is null
  and coalesce(product_snapshot ->> 'selected_length', '') <> '';

update public.order_items
set selected_length = product_snapshot ->> 'selected_length'
where selected_length is null
  and coalesce(product_snapshot ->> 'selected_length', '') <> '';

drop index if exists public.cart_items_cart_product_color_idx;
drop index if exists public.cart_items_cart_product_variant_idx;

create unique index if not exists cart_items_cart_product_variant_idx
  on public.cart_items (
    cart_id,
    product_id,
    coalesce(selected_color, ''),
    coalesce(selected_length, '')
  );
