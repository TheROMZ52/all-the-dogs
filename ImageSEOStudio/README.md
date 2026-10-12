# PixelIndex — Image SEO Studio

A Persian-first public image publishing and image-discovery workspace, located in \`TheROMZ52/all-the-dogs/ImageSEOStudio\`.

## Features
- Responsive dark, neon-green interface with live search-result preview.
- Per-image title, unique slug, descriptive alt text, description, and keywords.
- Secure public publishing through a Supabase Edge Function; the service-role key stays server-side.
- 10 MB image size limit, file-signature checks, and a five-publish-per-IP daily quota.
- Public server-rendered image pages at \`/image/:slug\` with canonical, Open Graph, Twitter, ImageObject JSON-LD, and crawlable HTML image elements.
- Server-rendered public gallery at \`/images\` with links to published image pages.
- XML sitemap at \`/api/sitemap\` containing public pages and Google Image Sitemap metadata.
- Homepage metadata, \`robots.txt\`, and live search-result preview.

## Environment
Set these variables in Vercel:
- \`VITE_SUPABASE_URL\`
- \`VITE_SUPABASE_ANON_KEY\` (publishable/anon key only; never the service-role key)
- \`VITE_SITE_URL=https://pixelindex-the-romz-52.vercel.app\`

The sitemap and server-rendered pages also read \`SUPABASE_URL\`, \`SUPABASE_ANON_KEY\`, and \`SITE_URL\` if set. The existing VITE-prefixed values are supported as fallbacks.

## Google indexing
1. Verify the production site in Google Search Console.
2. Submit \`https://pixelindex-the-romz-52.vercel.app/api/sitemap\`.
3. Use URL Inspection on the homepage, \`/images\`, and selected \`/image/:slug\` pages.
4. Check that Google can crawl both each HTML image page and the public image URL.
5. Improve every image's title and alt text so they accurately describe the actual image; do not stuff keywords.

Sitemap inclusion, metadata, and structured data help discovery but cannot guarantee indexing or rankings. New images can take time to be crawled. Stronger bot protection such as CAPTCHA/Turnstile and moderation can be added later if abuse appears; the current upload controls are rate limits and file validation, not a full CAPTCHA.
