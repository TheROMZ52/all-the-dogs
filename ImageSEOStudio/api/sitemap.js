export default async function handler(req, res) {
  const base = (process.env.VITE_SITE_URL || process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(503).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    return;
  }
  try {
    const response = await fetch(supabaseUrl.replace(/\/$/, "") + "/rest/v1/images?select=slug,created_at,object_path&published=eq.true&order=created_at.desc&limit=50000", {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!response.ok) throw new Error("Could not load image records");
    const images = await response.json();
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const urls = images.map((item) => {
      const publicImage = supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/public/public-images/" + item.object_path.split("/").map(encodeURIComponent).join("/");
      return `<url><loc>${esc(base + "/image/" + encodeURIComponent(item.slug))}</loc><lastmod>${new Date(item.created_at).toISOString()}</lastmod><image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><image:loc>${esc(publicImage)}</image:loc></image:image></url>`;
    }).join("");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`);
  } catch {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("Unable to generate sitemap");
  }
}
