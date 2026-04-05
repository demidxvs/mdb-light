alter table public.products
  add column if not exists image_urls text[] not null default '{}'::text[];

update public.products
set image_urls = array[primary_image_url]
where primary_image_url is not null
  and coalesce(array_length(image_urls, 1), 0) = 0;
