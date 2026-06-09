import { useEffect, useState } from 'react';

function fmtSecs(s) {
  s = Math.max(0, Number(s) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(String(iso).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const DIR_BADGE = {
  inbound:  'text-blue-300',
  outbound: 'text-emerald-300',
  missed:   'text-rose-300',
};

const DIR_ARROW = {
  inbound:  '↘',
  outbound: '↗',
  missed:   '✕',
};

export default function TodaysCallsCard() {
  const [stats, setStats] = useState({ today: { total: 0, inbound: 0, outbound: 0, missed: 0, total_seconds: 0 }, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/call_logs?stats=today', { credentials: 'include' });
        const json = await res.json();
        if (!cancelled && json?.data) setStats(json.data);
      } catch { /* leave defaults */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    // Refresh every 60s so the dashboard reflects calls that landed
    // while the tab was open.
    const t = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const t = stats.today;

  return (
    <div className="bg-[#141923] border border-[#1e2535] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Today's Calls</h2>
        <span className="text-slate-400 text-xs bg-[#1e2535] px-3 py-1 rounded-full">RingCentral</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <div className="bg-[#0f1117] border border-[#1e2535] rounded-lg p-3 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Total</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : t.total}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-center">
          <p className="text-emerald-400 text-[10px] uppercase tracking-wide mb-1">Outbound</p>
          <p className="text-emerald-300 text-2xl font-bold">{loading ? '—' : t.outbound}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center">
          <p className="text-blue-400 text-[10px] uppercase tracking-wide mb-1">Inbound</p>
          <p className="text-blue-300 text-2xl font-bold">{loading ? '—' : t.inbound}</p>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-center">
          <p className="text-rose-400 text-[10px] uppercase tracking-wide mb-1">Missed</p>
          <p className="text-rose-300 text-2xl font-bold">{loading ? '—' : t.missed}</p>
        </div>
      </div>

      <p className="text-slate-400 text-xs mb-2">
        Talk time today: <span className="text-slate-200 font-medium">{loading ? '—' : fmtSecs(t.total_seconds)}</span>
      </p>

      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Recent</p>
        {stats.recent.length === 0 ? (
          <p className="text-slate-600 text-xs italic">No calls yet.</p>
        ) : (
          <ul className="space-y-1">
            {stats.recent.map(c => (
              <li key={c.id} className="flex items-center gap-2 text-xs py-1 border-b border-[#1e2535] last:border-0">
                <span className={`${DIR_BADGE[c.direction] || 'text-slate-400'} w-3 inline-block text-center`}>{DIR_ARROW[c.direction] || '·'}</span>
                <span className="text-slate-300 truncate">
                  {c.contact_name || c.phone_number || 'Unknown'}
                </span>
                <span className="text-slate-500 ml-auto whitespace-nowrap">{fmtTime(c.started_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
