-- Run this only after the admin panel has been fully moved to:
-- 1. separate admin auth project
-- 2. server-side admin API routes using SUPABASE_SERVICE_ROLE_KEY
--
-- If you run this too early, the current admin CRUD pages will lose access.

begin;

-- Storefront-facing policies without legacy admin bypass.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories
  for select
  using (is_active);

drop policy if exists "category_translations_public_read" on public.category_translations;
create policy "category_translations_public_read"
  on public.category_translations
  for select
  using (
    exists (
      select 1
      from public.categories
      where public.categories.id = category_translations.category_id
        and public.categories.is_active
    )
  );

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  using (is_active);

drop policy if exists "product_translations_public_read" on public.product_translations;
create policy "product_translations_public_read"
  on public.product_translations
  for select
  using (
    exists (
      select 1
      from public.products
      where public.products.id = product_translations.product_id
        and public.products.is_active
    )
  );

drop policy if exists "carts_select_own_or_admin" on public.carts;
create policy "carts_select_own_or_admin"
  on public.carts
  for select
  using (auth.uid() = user_id);

drop policy if exists "carts_insert_own_or_admin" on public.carts;
create policy "carts_insert_own_or_admin"
  on public.carts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "carts_update_own_or_admin" on public.carts;
create policy "carts_update_own_or_admin"
  on public.carts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "carts_delete_own_or_admin" on public.carts;
create policy "carts_delete_own_or_admin"
  on public.carts
  for delete
  using (auth.uid() = user_id);

drop policy if exists "cart_items_select_own_or_admin" on public.cart_items;
create policy "cart_items_select_own_or_admin"
  on public.cart_items
  for select
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
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
        and public.carts.user_id = auth.uid()
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
        and public.carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
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
        and public.carts.user_id = auth.uid()
    )
  );

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders
  for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin"
  on public.orders
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
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
        and public.orders.user_id = auth.uid()
    )
  );

drop policy if exists "product_attribute_values_public_read" on public.product_attribute_values;
create policy "product_attribute_values_public_read"
  on public.product_attribute_values
  for select
  using (
    exists (
      select 1
      from public.products
      where public.products.id = product_attribute_values.product_id
        and public.products.is_active
    )
  );

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects
  for select
  using (is_active);

-- Remove old admin-only storage/object policies.
drop policy if exists "catalog_media_admin_insert" on storage.objects;
drop policy if exists "catalog_media_admin_update" on storage.objects;
drop policy if exists "catalog_media_admin_delete" on storage.objects;

drop policy if exists "invoice_pdfs_admin_read" on storage.objects;
drop policy if exists "invoice_pdfs_admin_insert" on storage.objects;
drop policy if exists "invoice_pdfs_admin_update" on storage.objects;
drop policy if exists "invoice_pdfs_admin_delete" on storage.objects;

-- Remove old table policies that existed only for browser-admin access.
drop policy if exists "admins_select_own_or_admin" on public.admins;
drop policy if exists "categories_admin_manage" on public.categories;
drop policy if exists "category_translations_admin_manage" on public.category_translations;
drop policy if exists "products_admin_manage" on public.products;
drop policy if exists "product_translations_admin_manage" on public.product_translations;
drop policy if exists "invoices_admin_manage" on public.invoices;
drop policy if exists "invoice_items_admin_manage" on public.invoice_items;
drop policy if exists "orders_admin_update" on public.orders;
drop policy if exists "order_items_admin_update" on public.order_items;
drop policy if exists "order_items_admin_delete" on public.order_items;
drop policy if exists "attributes_admin_manage" on public.attributes;
drop policy if exists "product_attribute_values_admin_manage" on public.product_attribute_values;
drop policy if exists "projects_admin_manage" on public.projects;
drop policy if exists "project_translations_public_read" on public.project_translations;
drop policy if exists "project_translations_admin_manage" on public.project_translations;

-- Remove legacy admin auth artifacts from the storefront database.
drop function if exists public.is_admin();
drop table if exists public.admins;

commit;
