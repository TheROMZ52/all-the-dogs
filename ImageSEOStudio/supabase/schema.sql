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
