import { useEffect, useState } from 'react';

const PAGE_TYPES = ['landing','optin','sales','checkout','upsell','downsell','thankyou','webinar_register','calendar'];
const GOAL_LABELS = {
  lead_capture: 'Lead capture', demo_booking: 'Demo booking',
  trial_signup: 'Trial signup', sale: 'Sale', content_view: 'Content view',
};

export default function Funnels() {
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [activePage, setActivePage] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/funnels', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setFunnels(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/funnels/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => { setDetail(j.data); setActivePage(0); });
  }, [selected]);

  const createNew = async () => {
    const res = await fetch('/api/funnels', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Untitled funnel', slug: 'untitled-' + Math.random().toString(36).slice(2,6), goal: 'lead_capture' }),
    });
    const j = await res.json();
    setSelected(j.data.id); load();
  };

  const updateBlock = (idx, key, val) => {
    const page = detail.pages[activePage];
    const blocks = [...(page.blocks || [])];
    blocks[idx] = { ...blocks[idx], [key]: val };
    const pages = [...detail.pages];
    pages[activePage] = { ...page, blocks };
    setDetail({ ...detail, pages });
  };
  const moveBlock = (idx, dir) => {
    const page = detail.pages[activePage];
    const blocks = [...(page.blocks || [])];
    const t = idx + dir;
    if (t < 0 || t >= blocks.length) return;
    [blocks[idx], blocks[t]] = [blocks[t], blocks[idx]];
    const pages = [...detail.pages];
    pages[activePage] = { ...page, blocks };
    setDetail({ ...detail, pages });
  };
  const removeBlock = (idx) => {
    const page = detail.pages[activePage];
    const blocks = [...(page.blocks || [])];
    blocks.splice(idx, 1);
    const pages = [...detail.pages];
    pages[activePage] = { ...page, blocks };
    setDetail({ ...detail, pages });
  };
  const addBlock = (type) => {
    const defaults = {
      heading: { type: 'heading', size: 'h1', text: 'Your headline' },
      text:    { type: 'text', text: 'Body text' },
      image:   { type: 'image', url: '', alt: '' },
      button:  { type: 'button', label: 'Click me', url: 'https://' },
      form:    { type: 'form', fields: [{ name: 'email', label: 'Email', required: true }], submit_label: 'Submit' },
      calendar:{ type: 'calendar', event_type_slug: 'cadsuite-demo' },
      video:   { type: 'video', url: '' },
      divider: { type: 'divider' },
    };
    const page = detail.pages[activePage];
    const pages = [...detail.pages];
    pages[activePage] = { ...page, blocks: [...(page.blocks || []), defaults[type]] };
    setDetail({ ...detail, pages });
  };

  const save = async () => {
    setSaving(true);
    await fetch(`/api/funnels/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detail.name, description: detail.description, goal: detail.goal,
        is_published: detail.is_published,
        pages: detail.pages.map((p) => ({
          id: p.id, title: p.title, page_type: p.page_type, blocks: p.blocks,
          meta_title: p.meta_title, meta_description: p.meta_description,
        })),
      }),
    });
    setSaving(false); load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Funnels</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-step landing flows. Each page is a block-based editor.</p>
        </div>
        <button onClick={createNew} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium">+ New Funnel</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          {!loading && funnels.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-sm">No funnels yet. Click + New Funnel.</div>
          )}
          <ul className="divide-y divide-[#1e2535]">
            {funnels.map((f) => (
              <li key={f.id}>
                <button onClick={() => setSelected(f.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === f.id ? 'bg-[#1e2535]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{f.name}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{GOAL_LABELS[f.goal] || f.goal} · {f.page_count} pages · {f.views} views · {f.conversions} convs</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${f.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                      {f.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select or create a funnel.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.name} onChange={(e) => setDetail({ ...detail, name: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <select value={detail.goal} onChange={(e) => setDetail({ ...detail, goal: e.target.value })} className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                  {Object.entries(GOAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-300 px-3">
                  <input type="checkbox" checked={Boolean(detail.is_published)} onChange={(e) => setDetail({ ...detail, is_published: e.target.checked ? 1 : 0 })} />
                  Published
                </label>
              </div>

              <div className="border-t border-[#1e2535] pt-4">
                <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                  {(detail.pages || []).map((p, i) => (
                    <button key={p.id} onClick={() => setActivePage(i)} className={`shrink-0 text-xs px-3 py-1.5 rounded-lg ${activePage === i ? 'bg-indigo-600 text-white' : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`}>
                      {i + 1}. {p.title || p.page_type}
                    </button>
                  ))}
                </div>

                {detail.pages?.[activePage] && (() => {
                  const page = detail.pages[activePage];
                  return (
                    <div className="space-y-3">
                      <input value={page.title} onChange={(e) => {
                        const pages = [...detail.pages]; pages[activePage] = { ...page, title: e.target.value }; setDetail({ ...detail, pages });
                      }} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm font-medium rounded-lg px-3 py-2" placeholder="Page title" />
                      <select value={page.page_type} onChange={(e) => {
                        const pages = [...detail.pages]; pages[activePage] = { ...page, page_type: e.target.value }; setDetail({ ...detail, pages });
                      }} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                        {PAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>

                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-slate-500">Blocks</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {['heading','text','image','button','form','calendar','video','divider'].map((t) => (
                            <button key={t} onClick={() => addBlock(t)} className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">+ {t}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(page.blocks || []).map((b, i) => (
                          <div key={i} className="bg-[#0f1117] border border-[#1e2535] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-500 uppercase tracking-wider">{b.type}</span>
                              <div className="flex gap-1">
                                <button onClick={() => moveBlock(i, -1)} className="text-slate-500 hover:text-white text-xs px-1">↑</button>
                                <button onClick={() => moveBlock(i, 1)} className="text-slate-500 hover:text-white text-xs px-1">↓</button>
                                <button onClick={() => removeBlock(i)} className="text-red-400 hover:text-red-300 text-xs px-1">×</button>
                              </div>
                            </div>
                            {b.type === 'heading' && <input value={b.text || ''} onChange={(e) => updateBlock(i, 'text', e.target.value)} className="w-full bg-transparent text-white font-bold text-xl focus:outline-none" />}
                            {b.type === 'text' && <textarea value={b.text || ''} onChange={(e) => updateBlock(i, 'text', e.target.value)} rows={3} className="w-full bg-transparent text-slate-200 text-sm focus:outline-none resize-none" />}
                            {b.type === 'image' && <input value={b.url || ''} onChange={(e) => updateBlock(i, 'url', e.target.value)} placeholder="Image URL" className="w-full bg-transparent text-slate-200 text-sm focus:outline-none font-mono" />}
                            {b.type === 'video' && <input value={b.url || ''} onChange={(e) => updateBlock(i, 'url', e.target.value)} placeholder="YouTube / Loom / Vimeo URL" className="w-full bg-transparent text-slate-200 text-sm focus:outline-none font-mono" />}
                            {b.type === 'button' && (
                              <>
                                <input value={b.label || ''} onChange={(e) => updateBlock(i, 'label', e.target.value)} placeholder="Button label" className="w-full bg-transparent text-indigo-400 font-semibold focus:outline-none mb-1" />
                                <input value={b.url || ''} onChange={(e) => updateBlock(i, 'url', e.target.value)} placeholder="https://…" className="w-full bg-transparent text-slate-500 text-xs focus:outline-none font-mono" />
                              </>
                            )}
                            {b.type === 'form' && (
                              <>
                                <input value={b.submit_label || ''} onChange={(e) => updateBlock(i, 'submit_label', e.target.value)} placeholder="Submit button label" className="w-full bg-transparent text-indigo-400 font-semibold focus:outline-none mb-2" />
                                <p className="text-xs text-slate-500">{(b.fields || []).length} fields configured. Field editor coming next.</p>
                              </>
                            )}
                            {b.type === 'calendar' && (
                              <input value={b.event_type_slug || ''} onChange={(e) => updateBlock(i, 'event_type_slug', e.target.value)} placeholder="Event type slug (e.g. cadsuite-demo)" className="w-full bg-transparent text-slate-200 text-sm focus:outline-none font-mono" />
                            )}
                            {b.type === 'divider' && <hr className="border-slate-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-[#1e2535] pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Public preview: <a href={`/funnels/${detail.slug}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">/funnels/{detail.slug}</a></span>
                <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
