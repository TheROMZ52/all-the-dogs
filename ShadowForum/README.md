# ShadowForum

A pseudonymous knowledge archive for useful research, practical guides, and documents worth preserving.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth and PostgreSQL
- Row Level Security for published articles and user-owned content
- Vercel-ready, with no dependency on CampusNet

## Features in this first build

- Responsive dark archive interface
- Search and category filters
- Article detail view with tags and pseudonymous author names
- Email/password sign-up and sign-in
- Publish articles to the public archive
- PostgreSQL schema with RLS policies and indexes
- Demo content while the database is not configured

## Run locally

```bash
cd ShadowForum
npm install
cp .env.example .env.local
npm run dev
```

Set the Supabase project URL and anon key in `.env.local`. Then run `supabase/schema.sql` in the Supabase SQL Editor.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Open http://localhost:3000.

## Deploy to Vercel

Import `TheROMZ52/all-the-dogs` as a Vercel project and set **Root Directory** to `ShadowForum`. Add the two Supabase environment variables to the Vercel project before deploying.

## Onion-service readiness

The application is independent of its public hostname and can later sit behind a Tor onion-service reverse proxy. Vercel does not itself create or host a self-managed `.onion` service. A separate Tor host and a carefully restricted origin connection will be required for that deployment.

## Current limitations

- This is the first functional foundation, not a production launch.
- Article body is currently plain text; file attachments, document version history, comments, and a moderation dashboard are not implemented yet.
- Pseudonyms are display names, not a guarantee of anonymity. Account email, hosting logs, and network metadata may still identify users.
- Do not publish personal information, credentials, copyrighted material without permission, or illegal content.
- Before public launch, add rate limiting, abuse controls, email verification policy, backups, moderation tooling, and security review.

