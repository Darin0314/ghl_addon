import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function Sequences() {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/email_sequences', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { setSequences(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/email_sequences/${selected}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setDetail(j.data));
  }, [selected]);

  const filtered = sequences.filter((s) =>
    !filter ||
    s.name?.toLowerCase().includes(filter.toLowerCase()) ||
    s.slug?.toLowerCase().includes(filter.toLowerCase())
  );

  const triggerLabel = (t) => ({
    manual: 'Manual', tag_added: 'Tag added', form_submit: 'Form submit',
    deal_stage: 'Deal stage', schedule: 'Scheduled', behavior: 'Behavior',
  })[t] || t;

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Sequences
            <InfoTag sectionKey="sequences.list" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">Multi-step automated email + SMS + voicemail flows.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">
          + New Sequence
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          <div className="p-3 border-b border-[#1e2535]">
            <input
              type="text"
              placeholder="Filter…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">No sequences match.</div>
          )}
          <ul className="divide-y divide-[#1e2535] max-h-[70vh] overflow-y-auto">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] transition-colors ${selected === s.id ? 'bg-[#1e2535]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{s.name}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{triggerLabel(s.trigger_type)} · {s.step_count} steps · {s.active_enrollments} active</p>
                    </div>
                    <span className={`shrink-0 inline-block w-2 h-2 mt-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && (
            <div className="p-12 text-center text-slate-500 text-sm">
              Select a sequence to see steps.
            </div>
          )}
          {detail && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{detail.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">{detail.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${detail.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                  {detail.is_active ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-white font-semibold text-sm">Steps</h3>
                <InfoTag sectionKey="sequences.editor" />
              </div>

              <ol className="space-y-3">
                {(detail.steps || []).map((step) => (
                  <li key={step.id} className="border border-[#1e2535] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {step.step_order}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="uppercase tracking-wider">{step.step_type}</span>
                          <span>·</span>
                          <span>Day {step.delay_days}{step.delay_hours ? `+${step.delay_hours}h` : ''}</span>
                        </div>
                        <p className="text-white text-sm font-medium mt-0.5 truncate">
                          {step.template_subject || step.message_body?.slice(0, 80) || '(no subject)'}
                        </p>
                        {step.template_name && (
                          <p className="text-slate-500 text-xs mt-0.5 truncate">via template: {step.template_name}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {(!detail.steps || detail.steps.length === 0) && (
                  <li className="text-slate-500 text-sm text-center py-6">No steps yet.</li>
                )}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
