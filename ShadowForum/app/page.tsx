'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Article = { id: string; title: string; excerpt: string; body?: string; category: string; tags: string[]; author_name: string; created_at: string; };
const demo: Article[] = [
  { id:'a1', title:'A practical guide to digital privacy', excerpt:'A clear starting point for understanding browser isolation, password managers, and safer everyday habits.', category:'Privacy', tags:['privacy','security','guide'], author_name:'quietobserver', created_at:'2026-10-29T12:00:00Z', body:'Digital privacy is a set of habits, not a single tool. Start with unique passwords, a password manager, multi-factor authentication, software updates, and careful review of app permissions.' },
  { id:'a2', title:'How the Tor network works', excerpt:'An introduction to onion routing, relays, circuits, and what anonymity does — and does not — mean.', category:'Technology', tags:['tor','networking','research'], author_name:'packetghost', created_at:'2026-10-25T09:30:00Z', body:'Tor routes traffic through multiple volunteer-operated relays. Each relay knows only the adjacent hop, reducing the amount of information any one relay can see.' },
  { id:'a3', title:'Building a useful personal knowledge base', excerpt:'Simple principles for collecting sources, writing durable notes, and making information searchable.', category:'Knowledge', tags:['notes','research','workflow'], author_name:'indexzero', created_at:'2026-10-21T16:10:00Z', body:'A useful knowledge base favors small notes, explicit sources, consistent tags, and links between related ideas.' },
  { id:'a4', title:'Open-source research: a beginner workflow', excerpt:'A responsible workflow for checking sources, preserving citations, and separating evidence from assumptions.', category:'Research', tags:['osint','verification','sources'], author_name:'papertrail', created_at:'2026-10-18T11:00:00Z', body:'Begin with a precise question, record where each claim came from, cross-check independent sources, and clearly label uncertainty.' },
];
const categories = ['All','Technology','Privacy','Knowledge','Research','Tutorials'];

export default function Home() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [articles, setArticles] = useState<Article[]>(demo);
  const [configured, setConfigured] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { username?: string } } | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Article | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('signup');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const supabase = createClient(url, key);
    setClient(supabase);
    setConfigured(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.from('articles').select('id,title,excerpt,category,tags,author_name,created_at,body').eq('status','published').order('created_at',{ascending:false}).then(({data,error}) => {
      if (!error && data) setArticles(data as Article[]);
    });
  }, []);

  const filtered = useMemo(() => articles.filter(a => {
    const text = `${a.title} ${a.excerpt} ${a.author_name} ${a.tags.join(' ')}`.toLowerCase();
    return (category === 'All' || a.category === category) && text.includes(query.toLowerCase());
  }), [articles, category, query]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!client) return;
    const form = new FormData(event.currentTarget); const email = String(form.get('email')); const password = String(form.get('password'));
    const username = String(form.get('username') || '').trim(); setBusy(true); setNotice('');
    const result = authMode === 'signup' ? await client.auth.signUp({email,password,options:{data:{username}}}) : await client.auth.signInWithPassword({email,password});
    setBusy(false);
    if (result.error) return setNotice(result.error.message);
    if (authMode === 'signup' && !result.data.session) setNotice('Check your email to confirm your account.');
    else { setUser(result.data.user); setAuthOpen(false); setNotice('You are signed in.'); }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!client || !user) return;
    const form = new FormData(event.currentTarget); const title = String(form.get('title')).trim(); const body = String(form.get('body')).trim();
    const categoryValue = String(form.get('category')); const tags = String(form.get('tags')).split(',').map(t=>t.trim().toLowerCase()).filter(Boolean).slice(0,8);
    if (title.length < 8 || body.length < 80) return setNotice('Title must be 8+ characters and article body at least 80 characters.');
    setBusy(true); const excerpt = body.slice(0,190).trim() + (body.length > 190 ? '…' : '');
    const {data,error} = await client.from('articles').insert({title,body,excerpt,category:categoryValue,tags,author_id:(await client.auth.getUser()).data.user?.id,author_name:user.user_metadata?.username || 'anonymous',status:'published'}).select('id,title,excerpt,category,tags,author_name,created_at,body').single();
    setBusy(false); if (error) return setNotice(error.message);
    setArticles(current=>[data as Article,...current]); setPublishOpen(false); setNotice('Your article is now in the archive.');
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">S<span>.</span></span><span>SHADOW<span className="brand-light">FORUM</span><small>INDEPENDENT KNOWLEDGE ARCHIVE</small></span></a><nav><a href="#library">Library</a><a href="#about">About</a><button className="nav-cta" onClick={()=>user?setPublishOpen(true):setAuthOpen(true)}>{user?'Publish a document':'Sign in'}</button></nav></header>
    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><i/> OPEN KNOWLEDGE · PSEUDONYMOUS BY DESIGN</div><h1>Ideas deserve<br/><em>a place to stay.</em></h1><p>A quiet corner of the internet for useful research, practical guides, and documents worth preserving. Read freely. Publish under a pseudonym.</p><div className="hero-actions"><a className="primary" href="#library">Explore the archive <span>↗</span></a><button className="secondary" onClick={()=>user?setPublishOpen(true):setAuthOpen(true)}>Contribute a document</button></div><div className="hero-meta"><span><b>{articles.length.toString().padStart(2,'0')}</b> DOCUMENTS</span><span><b>06</b> COLLECTIONS</span><span><b>OPEN</b> ACCESS</span></div></div><div className="hero-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="core"><span>SH</span><small>ARCHIVE NODE 001</small></div><div className="art-label label-top">PUBLIC KNOWLEDGE / 001</div><div className="art-label label-bottom">NOISE DOWN. SIGNAL UP.</div></div></section>
    <section className="ticker"><span>THE ARCHIVE IS OPEN</span><b>✳</b><span>READ · LEARN · PRESERVE</span><b>✳</b><span>KNOWLEDGE WITHOUT THE NOISE</span><b>✳</b><span>THE ARCHIVE IS OPEN</span></section>
    <section className="library" id="library"><div className="section-head"><div><div className="eyebrow">01 / THE COLLECTION</div><h2>Explore the <em>archive.</em></h2><p>Independent notes, guides, and research from the community.</p></div><div className="count">{filtered.length.toString().padStart(2,'0')} <span>RESULTS</span></div></div>
      <div className="toolbar"><div className="searchbox"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search documents, topics, authors…" aria-label="Search documents"/><kbd>↵</kbd></div><div className="filters">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
      <div className="article-grid">{filtered.map((a,i)=><article className="article-card" key={a.id} onClick={()=>setSelected(a)}><div className="card-top"><span className="doc-number">DOC / {String(i+1).padStart(3,'0')}</span><span className="arrow">↗</span></div><div className="card-category">{a.category}</div><h3>{a.title}</h3><p>{a.excerpt}</p><div className="tags">{a.tags.slice(0,3).map(t=><span key={t}>#{t}</span>)}</div><div className="card-foot"><span>BY <b>{a.author_name}</b></span><span>{new Date(a.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span></div></article>)}</div>
      {filtered.length===0&&<div className="empty">No documents found. Try another search or category.</div>}
    </section>
    <section className="manifesto" id="about"><div className="eyebrow">02 / WHY SHADOWFORUM</div><div className="manifesto-content"><h2>Less noise.<br/><em>More signal.</em></h2><div><p>ShadowForum is a community archive built around ideas, not profiles. Publish with a pseudonym, keep sources attached, and help make useful knowledge easier to find.</p><div className="principles"><span><b>01</b> Pseudonymous publishing</span><span><b>02</b> Source-first contributions</span><span><b>03</b> Searchable, lasting knowledge</span></div></div></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">S<span>.</span></span><span>SHADOW<span className="brand-light">FORUM</span><small>INDEPENDENT KNOWLEDGE ARCHIVE</small></span></a><span>BUILT FOR THE CURIOUS. NOT THE LOUD.</span><span>© 2026 SHADOWFORUM</span></footer>
    {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
    {selected&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="dialog article-dialog"><button className="close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow">{selected.category} / ARCHIVE DOCUMENT</div><h2>{selected.title}</h2><div className="dialog-meta">BY {selected.author_name} · {new Date(selected.created_at).toLocaleDateString()}</div><div className="article-body">{selected.body||selected.excerpt}</div><div className="tags">{selected.tags.map(t=><span key={t}>#{t}</span>)}</div></div></div>}
    {authOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAuthOpen(false)}}><div className="dialog"><button className="close" onClick={()=>setAuthOpen(false)}>×</button><div className="eyebrow">YOUR HANDLE. YOUR WORK.</div><h2>{authMode==='signup'?'Join the archive.':'Welcome back.'}</h2><p className="dialog-intro">Use an email for account access. Your public contributions use a pseudonym.</p>{!configured&&<p className="warning">Database is not connected yet. Add the Supabase environment variables to enable accounts.</p>}<form onSubmit={authenticate}>{authMode==='signup'&&<label>PUBLIC PSEUDONYM<input name="username" required minLength={3} maxLength={24} placeholder="e.g. quietobserver"/></label>}<label>EMAIL<input name="email" type="email" required placeholder="you@example.com"/></label><label>PASSWORD<input name="password" type="password" required minLength={8} placeholder="At least 8 characters"/></label><button className="primary full" disabled={!client||busy}>{busy?'Please wait…':authMode==='signup'?'Create account':'Sign in'}</button></form><button className="switch" onClick={()=>setAuthMode(authMode==='signup'?'login':'signup')}>{authMode==='signup'?'Already registered? Sign in':'New here? Create an account'}</button></div></div>}
    {publishOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setPublishOpen(false)}}><div className="dialog publish-dialog"><button className="close" onClick={()=>setPublishOpen(false)}>×</button><div className="eyebrow">CONTRIBUTE / NEW DOCUMENT</div><h2>Put something <em>useful</em> out there.</h2><form onSubmit={publish}><label>DOCUMENT TITLE<input name="title" required minLength={8} maxLength={120} placeholder="A clear, useful title"/></label><label>COLLECTION<select name="category"><option>Technology</option><option>Privacy</option><option>Knowledge</option><option>Research</option><option>Tutorials</option></select></label><label>TAGS<input name="tags" placeholder="research, guide, networking"/></label><label>DOCUMENT BODY<textarea name="body" required minLength={80} rows={8} placeholder="Write your document. Include source links and distinguish facts from opinion."/></label><button className="primary full" disabled={!client||busy}>{busy?'Publishing…':'Publish document'}</button></form></div></div>}
  </main>;
}
