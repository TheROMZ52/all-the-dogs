const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").trim();
  const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || ("https://" + req.headers.host)).replace(/\/+$/, "");
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (!slug || !supabaseUrl || !anonKey) {
    res.status(404).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><meta charset=\"utf-8\"><title>تصویر پیدا نشد | PixelIndex</title><meta name=\"robots\" content=\"noindex,follow\"><h1>تصویر پیدا نشد</h1><a href=\"/images\">گالری تصاویر</a></html>");
    return;
  }

  try {
    const query = new URLSearchParams({
      select: "title,slug,alt_text,description,keywords,object_path,mime_type,created_at",
      slug: "eq." + slug,
      published: "eq.true",
      limit: "1"
    });
    const response = await fetch(supabaseUrl + "/rest/v1/images?" + query.toString(), {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!response.ok) throw new Error("Image lookup failed");
    const rows = await response.json();
    const item = rows[0];
    if (!item) {
      res.status(404).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,follow\"><title>تصویر پیدا نشد | PixelIndex</title></head><body><h1>این تصویر پیدا نشد یا منتشر نشده است.</h1><a href=\"/images\">گالری تصاویر</a></body></html>");
      return;
    }

    const imageUrl = supabaseUrl + "/storage/v1/object/public/public-images/" + item.object_path.split("/").map(encodeURIComponent).join("/");
    const canonical = siteUrl + "/image/" + encodeURIComponent(item.slug);
    const description = item.description || item.alt_text || item.title;
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    const published = item.created_at ? new Date(item.created_at).toISOString() : "";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: item.title,
      description,
      caption: item.alt_text,
      contentUrl: imageUrl,
      url: canonical,
      keywords: keywords.join(", "),
      datePublished: published || undefined,
      encodingFormat: item.mime_type || undefined,
      inLanguage: "fa"
    };
    const ld = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

    res.status(200).send("<!doctype html>" +
      "<html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
      "<meta name=\"theme-color\" content=\"#090d0b\">" +
      "<meta name=\"robots\" content=\"index,follow,max-image-preview:large\">" +
      "<title>" + escapeHtml(item.title) + " | PixelIndex</title>" +
      "<meta name=\"description\" content=\"" + escapeHtml(description.slice(0, 300)) + "\">" +
      "<link rel=\"canonical\" href=\"" + escapeHtml(canonical) + "\">" +
      "<meta property=\"og:type\" content=\"article\">" +
      "<meta property=\"og:site_name\" content=\"PixelIndex\">" +
      "<meta property=\"og:locale\" content=\"fa_IR\">" +
      "<meta property=\"og:title\" content=\"" + escapeHtml(item.title) + "\">" +
      "<meta property=\"og:description\" content=\"" + escapeHtml(description.slice(0, 300)) + "\">" +
      "<meta property=\"og:url\" content=\"" + escapeHtml(canonical) + "\">" +
      "<meta property=\"og:image\" content=\"" + escapeHtml(imageUrl) + "\">" +
      "<meta property=\"og:image:alt\" content=\"" + escapeHtml(item.alt_text) + "\">" +
      "<meta name=\"twitter:card\" content=\"summary_large_image\">" +
      "<meta name=\"twitter:title\" content=\"" + escapeHtml(item.title) + "\">" +
      "<meta name=\"twitter:description\" content=\"" + escapeHtml(description.slice(0, 300)) + "\">" +
      "<meta name=\"twitter:image\" content=\"" + escapeHtml(imageUrl) + "\">" +
      "<script type=\"application/ld+json\">" + ld + "</script>" +
      "<style>body{margin:0;background:#090d0b;color:#e9f0eb;font-family:system-ui,sans-serif}main{max-width:980px;margin:auto;padding:24px}a{color:#b7ff63}header{display:flex;justify-content:space-between;gap:16px;align-items:center;border-bottom:1px solid #26332b;padding:12px 0}article{padding:36px 0}h1{font-size:clamp(28px,5vw,48px);line-height:1.35}figure{margin:24px 0}img{display:block;max-width:100%;max-height:72vh;height:auto;object-fit:contain;margin:auto;border:1px solid #26332b}figcaption,p{line-height:2;color:#b4c0b6}.keywords{display:flex;gap:8px;flex-wrap:wrap}.keywords span{border:1px solid #304133;padding:5px 9px;color:#a7d38c;font-size:13px}footer{border-top:1px solid #26332b;padding:20px 0;color:#829087;font-size:12px}</style>" +
      "</head><body><main><header><a href=\"/\">PIXELINDEX</a><nav><a href=\"/images\">گالری تصاویر</a> · <a href=\"/\">انتشار تصویر</a></nav></header>" +
      "<article><h1>" + escapeHtml(item.title) + "</h1>" +
      "<figure><img src=\"" + escapeHtml(imageUrl) + "\" alt=\"" + escapeHtml(item.alt_text) + "\" fetchpriority=\"high\"><figcaption>" + escapeHtml(item.alt_text) + "</figcaption></figure>" +
      "<p>" + escapeHtml(description) + "</p>" +
      (keywords.length ? "<div class=\"keywords\">" + keywords.map((word) => "<span>" + escapeHtml(word) + "</span>").join("") + "</div>" : "") +
      "</article><footer>PixelIndex — انتشار و کشف تصاویر · <a href=\"/api/sitemap\">نقشه سایت</a></footer></main></body></html>");
  } catch {
    res.status(500).send("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,follow\"><title>خطا | PixelIndex</title></head><body><h1>فعلاً دریافت تصویر ممکن نیست.</h1><a href=\"/images\">بازگشت به گالری</a></body></html>");
  }
}