import { useEffect, useMemo, useState } from 'react';
import InfoTag from '../components/InfoTag';

const CATEGORIES = [
  { value: '',                 label: 'All categories' },
  { value: 'cold_outreach',    label: 'Cold outreach' },
  { value: 'trial_onboarding', label: 'Trial onboarding' },
  { value: 'trial_conversion', label: 'Trial conversion' },
  { value: 'demo_recovery',    label: 'Demo no-show' },
  { value: 'review_request',   label: 'Review requests' },
  { value: 'webinar_followup', label: 'Webinar follow-up' },
];

export default function Templates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);

  const fetchList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    fetch(`/api/email_templates?${params.toString()}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { setList(j.data || []); setLoading(false); });
  };

  useEffect(fetchList, [category]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/email_templates/${selected}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setDetail(j.data));
  }, [selected]);

  const grouped = useMemo(() => {
    const g = {};
    for (const t of list) {
      const cat = t.category || 'uncategorized';
      (g[cat] = g[cat] || []).push(t);
    }
    return g;
  }, [list]);

  const filtered = (arr) => arr.filter((t) =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!detail) return;
    setSavingDetail(true);
    await fetch(`/api/email_templates/${detail.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detail.name,
        subject: detail.subject,
        preview_text: detail.preview_text,
        body_md: detail.body_md,
        category: detail.category,
        is_active: detail.is_active,
      }),
    });
    setSavingDetail(false);
    fetchList();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Email Templates
            <InfoTag sectionKey="templates.editor" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">{list.length} templates available.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">
          + New Template
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          <div className="p-3 border-b border-[#1e2535] space-y-2">
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          <div className="max-h-[70vh] overflow-y-auto">
            {Object.entries(grouped).map(([cat, items]) => {
              const visible = filtered(items);
              if (!visible.length) return null;
              return (
                <div key={cat}>
                  <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-[#1e2535]">
                    {cat.replace(/_/g, ' ')} <span className="text-slate-600">({visible.length})</span>
                  </div>
                  <ul className="divide-y divide-[#1e2535]">
                    {visible.map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => setSelected(t.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] transition-colors ${selected === t.id ? 'bg-[#1e2535]' : ''}`}
                        >
                          <p className="text-white text-sm font-medium truncate">{t.name}</p>
                          <p className="text-slate-500 text-xs truncate mt-0.5">{t.subject}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && (
            <div className="p-12 text-center text-slate-500 text-sm">Select a template to edit.</div>
          )}
          {detail && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Name</label>
                <input
                  value={detail.name || ''}
                  onChange={(e) => setDetail({ ...detail, name: e.target.value })}
                  className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Subject</label>
                <input
                  value={detail.subject || ''}
                  onChange={(e) => setDetail({ ...detail, subject: e.target.value })}
                  className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Preview text</label>
                <input
                  value={detail.preview_text || ''}
                  onChange={(e) => setDetail({ ...detail, preview_text: e.target.value })}
                  className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Body (Markdown)</label>
                <textarea
                  value={detail.body_md || ''}
                  onChange={(e) => setDetail({ ...detail, body_md: e.target.value })}
                  rows={14}
                  className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-slate-500 text-xs mt-1">
                  Available variables: {'{first_name}'}, {'{product_name}'}, {'{monthly_price}'}, {'{trial_url}'}, {'{calendar_url}'}, {'{loom_url}'}, {'{lead_magnet_url}'}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-[#1e2535] pt-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(detail.is_active)}
                    onChange={(e) => setDetail({ ...detail, is_active: e.target.checked ? 1 : 0 })}
                  />
                  Active
                </label>
                <button
                  onClick={handleSave}
                  disabled={savingDetail}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg"
                >
                  {savingDetail ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
