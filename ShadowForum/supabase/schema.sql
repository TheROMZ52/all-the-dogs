create extension if not exists pgcrypto;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 3 and 24),
  title text not null check (char_length(title) between 8 and 120),
  excerpt text not null check (char_length(excerpt) between 20 and 220),
  body text not null check (char_length(body) >= 80),
  category text not null check (category in ('Technology','Privacy','Knowledge','Research','Tutorials')),
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft','published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_created_idx on public.articles (created_at desc) where status = 'published';
create index if not exists articles_search_idx on public.articles using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,'')));
create index if not exists articles_tags_idx on public.articles using gin (tags);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null check (char_length(reason) between 10 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;
alter table public.reports enable row level security;

create policy "Published articles are public" on public.articles for select using (status = 'published' or auth.uid() = author_id);
create policy "Authenticated users can publish" on public.articles for insert to authenticated with check (auth.uid() = author_id and status = 'published');
create policy "Authors can edit their articles" on public.articles for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Authors can delete their articles" on public.articles for delete to authenticated using (auth.uid() = author_id);
create policy "Users can submit reports" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "Users can view their own reports" on public.reports for select to authenticated using (auth.uid() = reporter_id);
