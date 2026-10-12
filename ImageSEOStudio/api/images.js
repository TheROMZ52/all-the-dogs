const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export default async function handler(req, res) {
  const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || ("https://" + req.headers.host)).replace(/\/+$/, "");
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (!supabaseUrl || !anonKey) {
    res.status(503).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><title>گالری تصاویر | PixelIndex</title></head><body><h1>گالری فعلاً در دسترس نیست.</h1><a href=\"/\">بازگشت</a></body></html>");
    return;
  }

  try {
    const query = new URLSearchParams({
      select: "title,slug,alt_text,description,object_path,created_at",
      published: "eq.true",
      order: "created_at.desc",
      limit: "500"
    });
    const response = await fetch(supabaseUrl + "/rest/v1/images?" + query.toString(), {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!response.ok) throw new Error("Image listing failed");
    const images = await response.json();
    const cards = images.map((item) => {
      const imageUrl = supabaseUrl + "/storage/v1/object/public/public-images/" + item.object_path.split("/").map(encodeURIComponent).join("/");
      const pageUrl = siteUrl + "/image/" + encodeURIComponent(item.slug);
      return "<article><a class=\"image-link\" href=\"" + escapeHtml(pageUrl) + "\"><img loading=\"lazy\" src=\"" + escapeHtml(imageUrl) + "\" alt=\"" + escapeHtml(item.alt_text) + "\"><h2>" + escapeHtml(item.title) + "</h2></a><p>" + escapeHtml(item.description || item.alt_text || "") + "</p></article>";
    }).join("");

    res.status(200).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"index,follow,max-image-preview:large\"><meta name=\"theme-color\" content=\"#090d0b\"><title>گالری تصاویر منتشرشده | PixelIndex</title><meta name=\"description\" content=\"مرور تصاویر عمومی منتشرشده در PixelIndex؛ هر تصویر دارای صفحه مستقل، متن جایگزین و اطلاعات توصیفی است.\"><link rel=\"canonical\" href=\"" + escapeHtml(siteUrl + "/images") + "\"><meta property=\"og:type\" content=\"website\"><meta property=\"og:title\" content=\"گالری تصاویر منتشرشده | PixelIndex\"><meta property=\"og:description\" content=\"مرور تصاویر عمومی منتشرشده در PixelIndex.\"><meta property=\"og:url\" content=\"" + escapeHtml(siteUrl + "/images") + "\"><style>body{margin:0;background:#090d0b;color:#e9f0eb;font-family:system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:24px}header,footer{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 0;border-bottom:1px solid #26332b}a{color:#b7ff63;text-decoration:none}h1{font-size:clamp(28px,5vw,44px)}.intro,p{color:#a4b0a7;line-height:1.9}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin:32px 0}article{border:1px solid #26332b;background:#101713;padding:12px;min-width:0}.image-link{color:#e9f0eb}img{width:100%;height:210px;object-fit:contain;background:#080d0a}h2{font-size:17px;line-height:1.6}article p{font-size:13px}footer{border-top:1px solid #26332b;border-bottom:0;font-size:12px;color:#829087}@media(max-width:480px){main{padding:16px}}</style></head><body><main><header><a href=\"/\">PIXELINDEX</a><a href=\"/\">انتشار تصویر ↗</a></header><h1>گالری تصاویر منتشرشده</h1><p class=\"intro\">صفحه‌های عمومی تصاویر منتشرشده در PixelIndex. برای هر تصویر، صفحه‌ای مستقل با عنوان، توضیح و متن جایگزین وجود دارد.</p><section class=\"grid\">" + (cards || "<p>هنوز تصویری منتشر نشده است.</p>") + "</section><footer><span>PixelIndex · Image Discovery</span><a href=\"/api/sitemap\">نقشه سایت XML</a></footer></main></body></html>");
  } catch {
    res.status(500).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,follow\"><title>خطا | PixelIndex</title></head><body><h1>فعلاً گالری در دسترس نیست.</h1><a href=\"/\">بازگشت</a></body></html>");
  }
}