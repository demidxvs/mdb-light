insert into storage.buckets (id, name, public)
values ('catalog-media', 'catalog-media', true)
on conflict (id) do nothing;

drop policy if exists "catalog_media_public_read" on storage.objects;
create policy "catalog_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'catalog-media');

drop policy if exists "catalog_media_admin_insert" on storage.objects;
create policy "catalog_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'catalog-media' and public.is_admin());

drop policy if exists "catalog_media_admin_update" on storage.objects;
create policy "catalog_media_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'catalog-media' and public.is_admin())
with check (bucket_id = 'catalog-media' and public.is_admin());

drop policy if exists "catalog_media_admin_delete" on storage.objects;
create policy "catalog_media_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'catalog-media' and public.is_admin());
