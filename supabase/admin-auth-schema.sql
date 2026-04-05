create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  full_name text,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_profiles_email_idx on public.admin_profiles(email);
create index if not exists admin_profiles_role_idx on public.admin_profiles(role);
create index if not exists admin_profiles_is_active_idx on public.admin_profiles(is_active);

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (
    id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      concat_ws(
        ' ',
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name'
      )
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.admin_profiles.full_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

drop trigger if exists on_auth_admin_user_created on auth.users;
create trigger on_auth_admin_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_admin_user();

drop trigger if exists admin_profiles_set_updated_at on public.admin_profiles;
create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute procedure public.set_updated_at();

alter table public.admin_profiles enable row level security;

drop policy if exists "admin_profiles_select_self" on public.admin_profiles;
create policy "admin_profiles_select_self"
  on public.admin_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "admin_profiles_update_self" on public.admin_profiles;
create policy "admin_profiles_update_self"
  on public.admin_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

comment on table public.admin_profiles is
  'Separate admin identities for the admin subdomain. This auth model is intentionally isolated from storefront customers.';
