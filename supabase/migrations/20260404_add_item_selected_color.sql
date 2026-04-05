alter table public.cart_items
  add column if not exists selected_color text;

alter table public.order_items
  add column if not exists selected_color text;

update public.cart_items
set selected_color = product_snapshot ->> 'selected_color'
where selected_color is null
  and coalesce(product_snapshot ->> 'selected_color', '') <> '';

update public.order_items
set selected_color = product_snapshot ->> 'selected_color'
where selected_color is null
  and coalesce(product_snapshot ->> 'selected_color', '') <> '';

alter table public.cart_items
  drop constraint if exists cart_items_cart_id_product_id_key;

drop index if exists public.cart_items_cart_product_color_idx;

create unique index if not exists cart_items_cart_product_color_idx
  on public.cart_items (
    cart_id,
    product_id,
    coalesce(selected_color, '')
  );
