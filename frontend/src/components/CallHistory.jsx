import { useEffect, useState, useCallback } from 'react';

const DirectionIcon = ({ direction }) => {
  if (direction === 'inbound') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <polyline points="3 9 9 9 9 3" />
      </svg>
    );
  }
  if (direction === 'missed') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <line x1="22" y1="2" x2="16" y2="8" /><line x1="16" y1="2" x2="22" y2="8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      <polyline points="15 3 21 3 21 9" />
    </svg>
  );
};

const DIRECTION_STYLE = {
  inbound:  { color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Inbound' },
  outbound: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Outbound' },
  missed:   { color: 'text-rose-400',    bg: 'bg-rose-500/10',    label: 'Missed' },
};

function fmtDuration(secs) {
  const s = Math.max(0, Number(secs) || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function CallHistory({ contactId, phoneNumber }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [manualDir, setManualDir] = useState('outbound');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/call_logs?contact_id=${contactId}`, { credentials: 'include' });
      const data = await res.json();
      setLogs(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  const saveNote = async (id, notes) => {
    setSavingNoteId(id);
    try {
      await fetch(`/api/call_logs/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } finally {
      setSavingNoteId(null);
    }
  };

  const addManual = async () => {
    if (!phoneNumber && !contactId) return;
    const minutes = parseFloat(manualMinutes) || 0;
    const payload = {
      contact_id: contactId,
      direction: manualDir,
      phone_number: phoneNumber || '',
      duration_sec: Math.round(minutes * 60),
      result: 'manual',
      notes: manualNotes,
      started_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      ended_at:   new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    await fetch('/api/call_logs', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setAddOpen(false);
    setManualDir('outbound'); setManualMinutes(''); setManualNotes('');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-500 text-xs">Call History {logs.length > 0 && <span className="text-slate-600">({logs.length})</span>}</p>
        <button
          type="button"
          onClick={() => setAddOpen(o => !o)}
          className="text-xs text-slate-400 hover:text-emerald-400"
        >
          {addOpen ? 'Cancel' : '+ Log Call'}
        </button>
      </div>

      {addOpen && (
        <div className="mb-3 p-3 bg-[#0f1117] border border-[#1e2535] rounded-lg space-y-2">
          <div className="flex gap-2">
            <select
              value={manualDir}
              onChange={e => setManualDir(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-[#161b27] border border-[#1e2535] rounded text-slate-200 text-xs"
            >
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
              <option value="missed">Missed</option>
            </select>
            <input
              type="number"
              step="0.5"
              min="0"
              value={manualMinutes}
              onChange={e => setManualMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-24 px-2 py-1.5 bg-[#161b27] border border-[#1e2535] rounded text-slate-200 text-xs"
            />
          </div>
          <textarea
            rows={2}
            value={manualNotes}
            onChange={e => setManualNotes(e.target.value)}
            placeholder="Notes…"
            className="w-full px-2 py-1.5 bg-[#161b27] border border-[#1e2535] rounded text-slate-200 text-xs resize-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addManual}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded"
            >
              Save Call
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-xs italic">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-500 text-xs italic">No calls logged yet. The dialer auto-logs when you hang up.</p>
      ) : (
        <ul className="space-y-1.5">
          {logs.map(call => {
            const style = DIRECTION_STYLE[call.direction] || DIRECTION_STYLE.outbound;
            return (
              <li key={call.id} className={`p-2 rounded border border-[#1e2535] ${style.bg}`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={style.color}><DirectionIcon direction={call.direction} /></span>
                  <span className={`${style.color} font-medium`}>{style.label}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{fmtTime(call.started_at)}</span>
                  {call.direction !== 'missed' && Number(call.duration_sec) > 0 && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300">{fmtDuration(call.duration_sec)}</span>
                    </>
                  )}
                  {call.recording_url && (
                    <a
                      href={call.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                    >
                      Recording
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  defaultValue={call.notes || ''}
                  onBlur={(e) => {
                    if ((e.target.value || '') !== (call.notes || '')) saveNote(call.id, e.target.value);
                  }}
                  placeholder="Add a note…"
                  disabled={savingNoteId === call.id}
                  className="w-full mt-1.5 px-2 py-1 bg-transparent border-0 text-slate-300 text-xs focus:outline-none focus:bg-[#161b27] rounded"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
