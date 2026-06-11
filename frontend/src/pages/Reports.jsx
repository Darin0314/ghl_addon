import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    const from = new Date(Date.now() - days * 86400e3).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    fetch(`/api/funnel_metrics_daily?from=${from}&to=${to}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { setData(j.data); setLoading(false); });
  }, [days]);

  const fmt = (n, prefix = '') => n == null ? '—' : prefix + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const t = data?.totals || {};

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Funnel Reports <InfoTag sectionKey="reports.funnel" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">{loading ? 'Loading…' : `${days}-day window — ${data?.from} → ${data?.to}`}</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="bg-[#141923] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 12 months</option>
        </select>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Visitors', val: fmt(t.visitors) },
          { label: 'Leads', val: fmt(t.leads), sub: `${t.visit_to_lead_pct ?? 0}% conv` },
          { label: 'Trials', val: fmt(t.trials), sub: `${t.lead_to_trial_pct ?? 0}% conv` },
          { label: 'Paid', val: fmt(t.paid_conversions), sub: `${t.trial_to_paid_pct ?? 0}% conv` },
          { label: 'MRR Added', val: fmt(t.mrr_added, '$') },
          { label: 'Churned', val: fmt(t.churned), sub: `-${fmt(t.churned_mrr, '$')} MRR` },
          { label: 'Ad Spend', val: fmt(t.ad_spend, '$') },
          { label: 'CAC', val: fmt(t.cac, '$') },
        ].map((s) => (
          <div key={s.label} className="bg-[#141923] border border-[#1e2535] rounded-xl p-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-white text-2xl font-bold">{s.val}</p>
            {s.sub && <p className="text-slate-500 text-xs mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-[#141923] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2535]">
          <h2 className="text-white font-semibold">Daily breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase border-b border-[#1e2535]">
              <tr>
                {['Date','Visitors','Leads','MQL','SQL','Trials','Paid','MRR +','Churn','Ad $'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.series || []).map((r) => (
                <tr key={r.metric_date} className="border-b border-[#1e2535]/40 text-slate-300">
                  <td className="px-4 py-2">{r.metric_date}</td>
                  <td className="px-4 py-2">{fmt(r.visitors)}</td>
                  <td className="px-4 py-2">{fmt(r.leads)}</td>
                  <td className="px-4 py-2">{fmt(r.mqls)}</td>
                  <td className="px-4 py-2">{fmt(r.sqls)}</td>
                  <td className="px-4 py-2">{fmt(r.trials)}</td>
                  <td className="px-4 py-2 text-emerald-400">{fmt(r.paid_conversions)}</td>
                  <td className="px-4 py-2 text-emerald-400">{fmt(r.mrr_added, '$')}</td>
                  <td className="px-4 py-2 text-red-400">{fmt(r.churned)}</td>
                  <td className="px-4 py-2">{fmt(r.ad_spend, '$')}</td>
                </tr>
              ))}
              {(!data?.series || data.series.length === 0) && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">No funnel events recorded yet — install pixels on your landing pages or wait for the daily rollup.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
