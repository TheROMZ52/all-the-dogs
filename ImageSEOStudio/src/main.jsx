import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");
const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes("YOUR_PROJECT") ? createClient(supabaseUrl, supabaseKey) : null;
const slugify = (value) => value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 90) || "image";
const prettyBytes = (bytes) => bytes < 1024 * 1024 ? Math.round(bytes / 1024) + " KB" : (bytes / 1024 / 1024).toFixed(2) + " MB";


function PublicImagePage({ slug }) {
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) { setError("برای مشاهده تصاویر منتشرشده، اتصال Supabase باید تنظیم شده باشد."); return; }
    let active = true;
    supabase.from("images").select("title,slug,alt_text,description,keywords,object_path,created_at").eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError || !data) { setError("این تصویر پیدا نشد یا منتشر نشده است."); return; }
        const { data: publicData } = supabase.storage.from("public-images").getPublicUrl(data.object_path);
        setRecord({ ...data, imageUrl: publicData.publicUrl });
        document.title = data.title + " | PixelIndex";
        const setMeta = (name, value, property = false) => {
          const selector = property ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
          let node = document.head.querySelector(selector);
          if (!node) { node = document.createElement("meta"); node.setAttribute(property ? "property" : "name", name); document.head.appendChild(node); }
          node.content = value || "";
        };
        setMeta("description", data.description || data.alt_text);
        setMeta("robots", "index,follow");
        setMeta("og:title", data.title, true);
        setMeta("og:description", data.description || data.alt_text, true);
        setMeta("og:image", publicData.publicUrl, true);
        setMeta("og:type", "article", true);
        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
        canonical.href = siteUrl + "/image/" + data.slug;
        let ld = document.getElementById("image-object-jsonld");
        if (!ld) { ld = document.createElement("script"); ld.id = "image-object-jsonld"; ld.type = "application/ld+json"; document.head.appendChild(ld); }
        ld.textContent = JSON.stringify({ "@context":"https://schema.org", "@type":"ImageObject", name:data.title, description:data.description || data.alt_text, caption:data.alt_text, contentUrl:publicData.publicUrl, url:siteUrl + "/image/" + data.slug, keywords:(data.keywords || []).join(", ") });
      }).catch(() => { if (active) setError("خطا در دریافت تصویر."); });
    return () => { active = false; };
  }, [slug]);
  return <main className="shell public-page"><header className="topbar"><a className="brand" href="/"><span className="brand-mark">P<span>×</span></span><span>PIXEL<span className="muted">INDEX</span><small>IMAGE SEO STUDIO</small></span></a><a className="github-link" href="/">بازگشت به استودیو ↗</a></header>
    {record ? <article className="public-image"><span className="step">PUBLIC IMAGE / INDEXABLE PAGE</span><h1>{record.title}</h1><img src={record.imageUrl} alt={record.alt_text}/><p>{record.description || record.alt_text}</p><div className="chips">{(record.keywords || []).map((word)=><span key={word}>{word}</span>)}</div><small className="public-alt">متن جایگزین: {record.alt_text}</small></article> : <div className="public-message"><span className="step">PIXELINDEX / IMAGE</span><h1>{error || "در حال دریافت تصویر..."}</h1><p>اگر مدیر سایت هستی، متغیرهای اتصال و سیاست‌های Supabase را بررسی کن.</p></div>}
    <footer><span>PIXELINDEX <i>●</i> IMAGE DISCOVERY</span><span>INDEXING IS NOT GUARANTEED.</span></footer>
  </main>;
}

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [alt, setAlt] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [customSlug, setCustomSlug] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [gallery, setGallery] = useState([]);

  const keywordList = useMemo(() => keywords.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20), [keywords]);
  const chooseFile = (next) => {
    if (!next) return;
    if (!next.type.startsWith("image/") || next.type === "image/svg+xml") return setNotice("فقط فایل‌های تصویری رایج مثل JPG، PNG، WebP و GIF مجازند.");
    if (next.size > 10 * 1024 * 1024) return setNotice("حداکثر حجم هر تصویر ۱۰ مگابایت است.");
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setNotice("");
    setPublishedUrl("");
    if (!title) setTitle(next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    if (!customSlug) setSlug(slugify(next.name.replace(/\.[^.]+$/, "")));
    if (!alt) setAlt(next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  };

  const publish = async () => {
    if (!file || !title.trim() || !slug.trim() || !alt.trim()) return setNotice("تصویر، عنوان، آدرس یکتا و متن جایگزین را کامل کن.");
    if (!supabase) return setNotice("برای انتشار عمومی، ابتدا Supabase را بساز، schema.sql را اجرا و متغیرهای .env را تنظیم کن. پیش‌نمایش محلی فعال است.");
    setBusy(true); setNotice("");
    try {
      const safeSlug = slugify(slug);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const objectPath = safeSlug + "-" + crypto.randomUUID() + "." + ext;
      const { error: uploadError } = await supabase.storage.from("public-images").upload(objectPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("public-images").getPublicUrl(objectPath);
      const { data, error: rowError } = await supabase.from("images").insert({
        title: title.trim(), slug: safeSlug, alt_text: alt.trim(), description: description.trim(),
        keywords: keywordList, object_path: objectPath, mime_type: file.type, size_bytes: file.size, published: true
      }).select("id, slug, title").single();
      if (rowError) throw rowError;
      const url = siteUrl + "/image/" + data.slug;
      setPublishedUrl(url);
      setGallery((old) => [{ ...data, imageUrl: publicData.publicUrl, alt_text: alt, description }, ...old]);
      setNotice("تصویر منتشر شد؛ ایندکس شدن در گوگل خودکار یا فوری تضمین نمی‌شود.");
    } catch (error) {
      setNotice("انتشار انجام نشد: " + (error?.message || "خطای ناشناخته"));
    } finally { setBusy(false); }
  };

  const copy = async (value) => { try { await navigator.clipboard.writeText(value); setNotice("کپی شد."); } catch { setNotice("کپی خودکار ممکن نیست؛ متن را دستی انتخاب کن."); } };
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@type": "ImageObject", name: title, description, caption: alt, contentUrl: publishedUrl || (preview ? "[PUBLIC_IMAGE_URL]" : ""), keywords: keywordList.join(", ") }, null, 2);

  if (window.location.pathname.startsWith("/image/")) return <PublicImagePage slug={decodeURIComponent(window.location.pathname.split("/").pop() || "")} />;\n\n  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">P<span>×</span></span><span>PIXEL<span className="muted">INDEX</span><small>IMAGE SEO STUDIO</small></span></a><div className="top-actions"><span className="status-dot"></span><span>{supabase ? "اتصال آماده انتشار" : "حالت پیش‌نمایش"}</span><a className="github-link" href="https://github.com/TheROMZ52/all-the-dogs/tree/image-seo-studio/ImageSEOStudio" target="_blank" rel="noreferrer">سورس پروژه ↗</a></div></header>
    <section className="hero"><div className="eyebrow"><span></span> IMAGE DISCOVERY PLATFORM / 01</div><h1>عکس‌هات رو منتشر کن.<br/><em>قابل پیدا شدنشون کن.</em></h1><p>برای هر تصویر، متادیتای دقیق بساز، نتیجه جست‌وجو رو پیش‌نمایش کن و صفحه‌ای آماده برای موتورهای جست‌وجو منتشر کن.</p><div className="hero-stats"><div><strong>01</strong><span>آپلود تصویر</span></div><div><strong>02</strong><span>تنظیم سئو</span></div><div><strong>03</strong><span>انتشار عمومی</span></div></div></section>
    <section className="workspace">
      <div className="editor-panel">
        <div className="section-heading"><div><span className="step">01 / EDITOR</span><h2>مشخصات تصویر</h2></div><span className="live-pill"><i></i> LIVE PREVIEW</span></div>
        <label className={"dropzone " + (preview ? "has-image" : "")} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();chooseFile(e.dataTransfer.files?.[0]);}}>
          {preview ? <><img src={preview} alt="پیش‌نمایش تصویر انتخاب‌شده"/><span className="replace-file">برای تعویض، کلیک کن یا تصویر جدید بنداز</span></> : <><span className="upload-icon">↑</span><strong>تصویرت رو اینجا بنداز</strong><span>یا برای انتخاب از دستگاه کلیک کن</span><small>JPG · PNG · WEBP · GIF · حداکثر ۱۰MB</small></>}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e)=>chooseFile(e.target.files?.[0])} hidden/>
        </label>
        {file && <div className="file-meta"><span className="file-type">IMG</span><div><strong>{file.name}</strong><small>{prettyBytes(file.size)} · {file.type}</small></div><button className="text-button" onClick={()=>{setFile(null);setPreview("");}}>حذف</button></div>}
        <div className="form-grid"><label className="field full"><span>عنوان تصویر <b>*</b></span><input value={title} maxLength={120} onChange={(e)=>setTitle(e.target.value)} placeholder="مثلاً: منظره جنگل در مه صبحگاهی"/><small>{title.length}/120 · عنوان واضح و توصیفی انتخاب کن</small></label>
          <label className="field full"><span>آدرس صفحه (Slug) <b>*</b></span><div className="slug-input"><span>/image/</span><input value={slug} onChange={(e)=>{setSlug(e.target.value);setCustomSlug(true);}} placeholder="forest-morning"/></div><small>حروف و اعداد به آدرس سازگار تبدیل می‌شوند.</small></label>
          <label className="field full"><span>متن جایگزین تصویر (Alt Text) <b>*</b></span><input value={alt} maxLength={180} onChange={(e)=>setAlt(e.target.value)} placeholder="توضیح کوتاه و دقیق از محتوای تصویر"/><small>{alt.length}/180 · برای دسترس‌پذیری و درک تصویر</small></label>
          <label className="field full"><span>توضیحات صفحه</span><textarea value={description} maxLength={300} onChange={(e)=>setDescription(e.target.value)} placeholder="این تصویر چه چیزی را نشان می‌دهد؟" rows={3}/><small>{description.length}/300</small></label>
          <label className="field full"><span>کلیدواژه‌ها <small className="inline-note">با کاما جدا کن</small></span><input value={keywords} onChange={(e)=>setKeywords(e.target.value)} placeholder="جنگل، طبیعت، مه، منظره"/><div className="chips">{keywordList.map((word)=><span key={word}>{word}</span>)}</div></label>
        </div>
        <div className="publish-row"><div><strong>آماده انتشار؟</strong><small>صفحه عمومی + متادیتای تصویر</small></div><button className="publish-button" onClick={publish} disabled={busy || !file}>{busy ? "در حال انتشار..." : "انتشار تصویر"} <span>↗</span></button></div>
        {notice && <div className="notice" role="status">{notice}</div>}
        {publishedUrl && <div className="published-link"><span>لینک عمومی</span><a href={publishedUrl} target="_blank" rel="noreferrer">{publishedUrl}</a><button onClick={()=>copy(publishedUrl)}>کپی لینک</button></div>}
      </div>
      <aside className="preview-column"><div className="section-heading"><div><span className="step">02 / PREVIEW</span><h2>نمایش در گوگل</h2></div><span className="google-tag">G<span>o</span>o<span>g</span>l<span>e</span></span></div>
        <div className="search-card"><div className="search-top"><span className="google-g">G</span><div className="search-bar">⌕ <span>جست‌وجوی تصویر...</span></div><span>⋮</span></div><div className="search-result"><div className="result-url">{siteUrl.replace(/^https?:\/\//,"")} › image › {slugify(slug || "your-image")}</div><h3>{title || "عنوان تصویر شما"}</h3><p>{description || alt || "توضیحات تصویر در این قسمت نمایش داده می‌شود. توضیحی دقیق و مرتبط بنویس."}</p></div><div className="result-image">{preview ? <img src={preview} alt={alt || ""}/> : <div className="image-placeholder"><span>✳</span><small>پیش‌نمایش تصویر</small></div>}</div><div className="preview-foot"><span className="green-check">✓</span> پیش‌نمایش تقریبی است؛ نمایش نهایی را گوگل تعیین می‌کند.</div></div>
        <div className="quality-card"><div className="quality-head"><span>SEO CHECKLIST</span><span>{[file,title.trim(),slug.trim(),alt.trim(),description.trim()].filter(Boolean).length}/5</span></div>{[["تصویر انتخاب شده",!!file],["عنوان توصیفی",title.trim().length>3],["آدرس صفحه",slug.trim().length>1],["متن جایگزین",alt.trim().length>3],["توضیحات صفحه",description.trim().length>10]].map(([label,ok])=><div className="check-row" key={label}><span className={ok?"check-ok":"check-empty"}>{ok?"✓":"·"}</span>{label}<span className={ok?"check-state":"pending"}>{ok?"تکمیل":"در انتظار"}</span></div>)}</div>
        <div className="schema-card"><div className="schema-head"><span>STRUCTURED DATA</span><button onClick={()=>copy(jsonLd)}>کپی JSON-LD ↗</button></div><pre>{jsonLd}</pre></div>
      </aside>
    </section>
    {gallery.length > 0 && <section className="gallery"><div className="section-heading"><div><span className="step">03 / PUBLISHED</span><h2>تصاویر منتشرشده در این نشست</h2></div></div><div className="gallery-grid">{gallery.map((item)=><article className="gallery-item" key={item.id}><img src={item.imageUrl} alt={item.alt_text}/><div><strong>{item.title}</strong><a href={siteUrl+"/image/"+item.slug} target="_blank" rel="noreferrer">مشاهده صفحه ↗</a></div></article>)}</div></section>}
    <footer><span>PIXELINDEX <i>●</i> BUILT FOR IMAGE DISCOVERY</span><span>SEO IS A SIGNAL, NOT A GUARANTEE.</span></footer>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
