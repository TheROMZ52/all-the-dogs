create extension if not exists pgcrypto;

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  alt_text text not null,
  description text not null default '',
  keywords text[] not null default '{}',
  object_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  published boolean not null default true
);

alter table public.images enable row level security;
create policy "Public can read published images" on public.images for select using (published = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-images', 'public-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do nothing;

create policy "Anyone can upload images" on storage.objects for insert to anon with check (bucket_id = 'public-images');
create policy "Public can view images" on storage.objects for select to anon using (bucket_id = 'public-images');

create policy "Anyone can publish image metadata" on public.images for insert to anon with check (published = true);
