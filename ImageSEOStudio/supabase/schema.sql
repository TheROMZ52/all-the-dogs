create extension if not exists pgcrypto;

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  alt_text text not null,
  description text not null default '',
  keywords text[] not null default '{}',
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/gif','image/avif')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now(),
  published boolean not null default false
);

alter table public.images enable row level security;

drop policy if exists "Public can read published images" on public.images;
create policy "Public can read published images"
on public.images for select to anon, authenticated
using (published = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-images', 'public-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];

drop policy if exists "Public can view images" on storage.objects;
create policy "Public can view images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'public-images');

create table if not exists public.upload_rate_limits (
  ip_hash text primary key,
  window_date date not null default current_date,
  upload_count integer not null default 0 check (upload_count >= 0)
);

alter table public.upload_rate_limits enable row level security;

create or replace function public.consume_upload_quota(p_ip_hash text, p_daily_limit integer default 5)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into public.upload_rate_limits (ip_hash, window_date, upload_count)
  values (p_ip_hash, current_date, 1)
  on conflict (ip_hash) do update
    set window_date = case
          when public.upload_rate_limits.window_date <> current_date then current_date
          else public.upload_rate_limits.window_date
        end,
        upload_count = case
          when public.upload_rate_limits.window_date <> current_date then 1
          else public.upload_rate_limits.upload_count + 1
        end
  returning upload_count into current_count;

  return current_count <= greatest(1, least(p_daily_limit, 10));
end;
$$;

revoke all on table public.upload_rate_limits from anon, authenticated;
revoke all on function public.consume_upload_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_upload_quota(text, integer) to service_role;
