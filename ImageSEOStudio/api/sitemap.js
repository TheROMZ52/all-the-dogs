export default async function handler(req, res) {
  const base = (process.env.VITE_SITE_URL || process.env.SITE_URL || ("https://" + req.headers.host)).replace(/\/+$/, "");
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  if (!supabaseUrl || !anonKey) {
    res.status(503).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    return;
  }
  try {
    const response = await fetch(supabaseUrl + "/rest/v1/images?select=title,slug,alt_text,created_at,object_path&published=eq.true&order=created_at.desc&limit=50000", {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!response.ok) throw new Error("Could not load image records");
    const images = await response.json();
    const esc = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    const staticUrls = [base + "/", base + "/images"].map((url) => "<url><loc>" + esc(url) + "</loc></url>").join("");
    const imageUrls = images.map((item) => {
      const pageUrl = base + "/image/" + encodeURIComponent(item.slug);
      const imageUrl = supabaseUrl + "/storage/v1/object/public/public-images/" + item.object_path.split("/").map(encodeURIComponent).join("/");
      const lastmod = item.created_at ? "<lastmod>" + new Date(item.created_at).toISOString() + "</lastmod>" : "";
      return "<url><loc>" + esc(pageUrl) + "</loc>" + lastmod + "<image:image><image:loc>" + esc(imageUrl) + "</image:loc><image:title>" + esc(item.title) + "</image:title><image:caption>" + esc(item.alt_text) + "</image:caption></image:image></url>";
    }).join("");
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' +
      staticUrls + imageUrls + "</urlset>");
  } catch {
    res.status(500).send("Unable to generate sitemap");
  }
}