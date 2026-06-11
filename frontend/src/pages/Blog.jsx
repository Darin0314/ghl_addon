import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter === 'published') params.set('is_published', '1');
    if (statusFilter === 'draft')     params.set('is_published', '0');
    fetch(`/api/blog_posts?${params.toString()}`, { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setPosts(j.data || []); setLoading(false); });
  };
  useEffect(load, [statusFilter]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/blog_posts/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => setDetail(j.data));
  }, [selected]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/blog_posts/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: detail.slug, title: detail.title, excerpt: detail.excerpt,
        body_md: detail.body_md, hero_image_url: detail.hero_image_url,
        target_keyword: detail.target_keyword, meta_title: detail.meta_title,
        meta_description: detail.meta_description, funnel_stage: detail.funnel_stage,
        is_published: detail.is_published,
      }),
    });
    setSaving(false); load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Blog Posts <InfoTag sectionKey="blog.list" /></h1>
          <p className="text-slate-400 text-sm mt-1">{posts.length} posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#141923] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
            <option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Post</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          <ul className="divide-y divide-[#1e2535] max-h-[75vh] overflow-y-auto">
            {posts.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSelected(p.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === p.id ? 'bg-[#1e2535]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.title}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">/{p.slug} · {p.funnel_stage} · {p.target_keyword || 'no keyword'}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${p.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                      {p.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select a post to edit.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.title || ''} onChange={(e) => setDetail({ ...detail, title: e.target.value })} placeholder="Title" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <input value={detail.slug || ''} onChange={(e) => setDetail({ ...detail, slug: e.target.value })} placeholder="slug" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
              <textarea value={detail.excerpt || ''} onChange={(e) => setDetail({ ...detail, excerpt: e.target.value })} placeholder="Excerpt" rows={2} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              <textarea value={detail.body_md || ''} onChange={(e) => setDetail({ ...detail, body_md: e.target.value })} placeholder="Body (Markdown)" rows={14} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
              <div className="grid grid-cols-2 gap-3">
                <input value={detail.target_keyword || ''} onChange={(e) => setDetail({ ...detail, target_keyword: e.target.value })} placeholder="Target keyword" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                <select value={detail.funnel_stage} onChange={(e) => setDetail({ ...detail, funnel_stage: e.target.value })} className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                  <option value="top">Top of funnel</option><option value="mid">Mid funnel</option><option value="bottom">Bottom funnel</option>
                </select>
              </div>
              <input value={detail.meta_title || ''} onChange={(e) => setDetail({ ...detail, meta_title: e.target.value })} placeholder="SEO meta title" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              <textarea value={detail.meta_description || ''} onChange={(e) => setDetail({ ...detail, meta_description: e.target.value })} placeholder="SEO meta description" rows={2} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              <div className="flex items-center justify-between border-t border-[#1e2535] pt-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={Boolean(detail.is_published)} onChange={(e) => setDetail({ ...detail, is_published: e.target.checked ? 1 : 0 })} />
                  Published
                </label>
                <div className="text-xs text-slate-500">{detail.views ?? 0} views · {detail.conversions ?? 0} conversions</div>
                <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg disabled:bg-slate-700">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
