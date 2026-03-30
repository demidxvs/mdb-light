alter table public.categories
  add column if not exists cover_image_url text;
