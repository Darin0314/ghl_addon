import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

const STATUSES = ['idea','outlined','drafting','review','published','archived'];
const STATUS_COLORS = { idea: 'bg-slate-600/30 text-slate-400', outlined: 'bg-blue-500/10 text-blue-400', drafting: 'bg-amber-500/10 text-amber-400', review: 'bg-purple-500/10 text-purple-400', published: 'bg-emerald-500/10 text-emerald-400', archived: 'bg-slate-700/30 text-slate-500' };

export default function ContentCalendar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/content_calendar?${params.toString()}`, { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setItems(j.data || []); setLoading(false); });
  };
  useEffect(load, [statusFilter]);

  const advance = async (item, newStatus) => {
    await fetch(`/api/content_calendar/${item.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  };

  // Group by month
  const byMonth = items.reduce((acc, it) => {
    const m = (it.scheduled_date || '').slice(0, 7);
    (acc[m] = acc[m] || []).push(it);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Content Calendar <InfoTag sectionKey="content.calendar" /></h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} content items planned.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#141923] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Item</button>
        </div>
      </header>

      {loading && <div className="text-center text-slate-500 py-12">Loading…</div>}

      <div className="space-y-6">
        {Object.entries(byMonth).sort().map(([month, list]) => (
          <section key={month}>
            <h2 className="text-white font-semibold mb-2">{month}</h2>
            <div className="bg-[#141923] border border-[#1e2535] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase border-b border-[#1e2535]">
                  <tr>{['Date','Type','Title','Stage','Keyword','Status','Action'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {list.map((it) => (
                    <tr key={it.id} className="border-b border-[#1e2535]/40 text-slate-300">
                      <td className="px-4 py-2">{it.scheduled_date}</td>
                      <td className="px-4 py-2 text-slate-500">{it.content_type}</td>
                      <td className="px-4 py-2 text-white">{it.title}</td>
                      <td className="px-4 py-2 text-slate-500">{it.funnel_stage}</td>
                      <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{it.target_keyword || '—'}</td>
                      <td className="px-4 py-2">
                        <select value={it.status} onChange={(e) => advance(it, e.target.value)} className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[it.status] || ''}`}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        {it.url && <a href={it.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs">View →</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
