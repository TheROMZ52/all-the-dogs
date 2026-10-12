# PixelIndex — Image SEO Studio

A Persian-first image publishing and SEO metadata workspace. This project lives in its own folder in `TheROMZ52/all-the-dogs`.

## Features
- Responsive dark, neon-green interface with live search-result preview.
- Image upload UI (JPG, PNG, WebP, GIF, AVIF; 10 MB limit; SVG rejected).
- Per-image title, unique slug, alt text, description and comma-separated keywords.
- Supabase Storage publishing and public metadata records.
- JSON-LD `ImageObject` preview/copy helper.
- SEO checklist and published image session gallery.

## Run locally
```bash
npm install
cp .env.example .env
npm run dev
```

## Enable public publishing
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` in `.env` for the browser app.
4. For Vercel, also configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SITE_URL` in project environment variables so the serverless image sitemap can read public records.
5. Deploy the `ImageSEOStudio` folder as a Vercel project with the Vite build preset.

**Security note:** the included starter schema intentionally demonstrates public uploads. Before opening this to the public internet, add rate limits, CAPTCHA/abuse controls, moderation and storage quotas. Never put a Supabase service-role key in client-side environment variables. The public anon key is designed for browser use only with appropriate RLS policies.

## Important Google indexing notes
Uploading an image does not automatically put it in Google Images or guarantee indexing. The deployed site needs crawlable, public, stable image URLs; each image should have a public HTML page with a unique title, descriptive alt text and canonical URL; publish a sitemap (ideally an image sitemap), verify the domain in Google Search Console, and request indexing where appropriate. Indexing and ranking are decided by Google.

Published images have a client-rendered public detail route with canonical/Open Graph metadata and ImageObject JSON-LD, plus a Vercel `/api/sitemap` endpoint that emits an image sitemap. The UI search preview is illustrative; Google controls the final appearance and crawl/index decisions. As a client-rendered Vite app, search engines may need time to render the page JavaScript; server-rendered HTML would be stronger for dependable SEO.
