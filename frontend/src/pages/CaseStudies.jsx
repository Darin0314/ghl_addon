import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function CaseStudies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/case_studies', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setItems(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/case_studies/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => setDetail(j.data));
  }, [selected]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/case_studies/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: detail.title, customer_name: detail.customer_name, industry: detail.industry,
        problem_md: detail.problem_md, solution_md: detail.solution_md, results_md: detail.results_md,
        quote: detail.quote, video_url: detail.video_url, format: detail.format, is_published: detail.is_published,
      }),
    });
    setSaving(false); load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Case Studies</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} customer stories.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Case Study</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          <ul className="divide-y divide-[#1e2535]">
            {items.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelected(c.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === c.id ? 'bg-[#1e2535]' : ''}`}>
                  <p className="text-white text-sm font-medium truncate">{c.title}</p>
                  <p className="text-slate-500 text-xs truncate mt-0.5">{c.customer_name} · {c.format}{c.is_published ? '' : ' · draft'}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select a case study.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.title || ''} onChange={(e) => setDetail({ ...detail, title: e.target.value })} placeholder="Title" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input value={detail.customer_name || ''} onChange={(e) => setDetail({ ...detail, customer_name: e.target.value })} placeholder="Customer name" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                <input value={detail.industry || ''} onChange={(e) => setDetail({ ...detail, industry: e.target.value })} placeholder="Industry" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              </div>
              {['problem_md','solution_md','results_md'].map((f) => (
                <div key={f}>
                  <label className="block text-slate-400 text-xs mb-1">{f.replace('_md','').replace(/^\w/,(c) => c.toUpperCase())} (Markdown)</label>
                  <textarea value={detail[f] || ''} onChange={(e) => setDetail({ ...detail, [f]: e.target.value })} rows={4} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
                </div>
              ))}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Pull quote</label>
                <textarea value={detail.quote || ''} onChange={(e) => setDetail({ ...detail, quote: e.target.value })} rows={2} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 italic" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={detail.video_url || ''} onChange={(e) => setDetail({ ...detail, video_url: e.target.value })} placeholder="Video URL (optional)" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                <select value={detail.format} onChange={(e) => setDetail({ ...detail, format: e.target.value })} className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                  <option value="written">Written</option><option value="video">Video</option><option value="both">Both</option>
                </select>
              </div>
              <div className="flex items-center justify-between border-t border-[#1e2535] pt-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={Boolean(detail.is_published)} onChange={(e) => setDetail({ ...detail, is_published: e.target.checked ? 1 : 0 })} />
                  Published
                </label>
                <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg disabled:bg-slate-700">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
