drop policy if exists "projects_admin_manage" on public.projects;
drop policy if exists "projects_public_read" on public.projects;

drop trigger if exists projects_set_updated_at on public.projects;

drop table if exists public.projects;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order integer not null default 0,
  cover_image_url text,
  is_active boolean not null default true,
  is_featured_home boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index projects_sort_order_idx on public.projects(sort_order);
create index projects_is_active_idx on public.projects(is_active);
create index projects_is_featured_home_idx on public.projects(is_featured_home);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

alter table public.projects enable row level security;

create policy "projects_public_read"
  on public.projects
  for select
  using (is_active or public.is_admin());

create policy "projects_admin_manage"
  on public.projects
  for all
  using (public.is_admin())
  with check (public.is_admin());
