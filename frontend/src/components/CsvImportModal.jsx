import { useEffect, useMemo, useState } from 'react';

// Minimal RFC 4180-ish CSV parser. Handles quoted fields with embedded commas
// + escaped double-quotes. Lighter than pulling in papaparse for one feature.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some(c => c !== '')) rows.push(row);
        row = [];
      } else { cell += ch; }
    }
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some(c => c !== '')) rows.push(row); }
  return rows;
}

const FIELD_OPTIONS = [
  { value: '',       label: '— Skip —' },
  { value: 'name',   label: 'Name' },
  { value: 'email',  label: 'Email' },
  { value: 'phone',  label: 'Phone' },
  { value: 'source', label: 'Source' },
  { value: 'notes',  label: 'Notes' },
  { value: 'tags',   label: 'Tags (semicolon-separated)' },
];

// Best-effort auto-map header names → field keys
function guessField(header) {
  const h = header.toLowerCase().trim();
  if (h === 'name' || h === 'full name' || h === 'customer' || h === 'contact')   return 'name';
  if (h === 'first name' || h === 'last name')                                    return 'name';
  if (h.includes('email'))                                                        return 'email';
  if (h.includes('phone') || h === 'mobile' || h === 'cell')                      return 'phone';
  if (h === 'source' || h === 'lead source' || h === 'origin')                    return 'source';
  if (h === 'notes' || h === 'note' || h === 'description' || h === 'comments')   return 'notes';
  if (h === 'tags' || h === 'tag' || h === 'labels')                              return 'tags';
  return '';
}

export default function CsvImportModal({ open, onClose, onComplete }) {
  const [step, setStep]               = useState(1);
  const [rawRows, setRawRows]         = useState([]);    // [[header...], [r1...], ...]
  const [headerMap, setHeaderMap]     = useState({});    // { colIndex: 'phone' }
  const [agents, setAgents]           = useState([]);
  const [agentIds, setAgentIds]       = useState([]);
  const [strategy, setStrategy]       = useState('round_robin');
  const [skipDuplicates, setSkipDup]  = useState(true);
  const [importing, setImporting]     = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1); setRawRows([]); setHeaderMap({}); setAgentIds([]);
    setStrategy('round_robin'); setSkipDup(true); setImporting(false);
    setResult(null); setError('');
    fetch('/api/users', { credentials: 'include' })
      .then(r => r.json())
      .then(j => setAgents(Array.isArray(j?.data) ? j.data : []))
      .catch(() => setAgents([]));
  }, [open]);

  const headerRow = rawRows[0] || [];
  const bodyRows  = rawRows.slice(1);

  const fileChosen = async (file) => {
    setError('');
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) { setError('CSV needs at least a header row and one data row.'); return; }
      setRawRows(rows);
      const map = {};
      rows[0].forEach((h, i) => { const g = guessField(h); if (g) map[i] = g; });
      setHeaderMap(map);
      setStep(2);
    } catch (e) {
      setError('Could not read the file: ' + (e?.message ?? 'unknown'));
    }
  };

  const previewRows = useMemo(() => bodyRows.slice(0, 5), [bodyRows]);

  const mappedSample = useMemo(() => {
    return previewRows.map(r => {
      const obj = {};
      Object.entries(headerMap).forEach(([colIdx, field]) => { if (field) obj[field] = r[Number(colIdx)] ?? ''; });
      return obj;
    });
  }, [previewRows, headerMap]);

  const hasName  = Object.values(headerMap).includes('name');
  const hasPhone = Object.values(headerMap).includes('phone');

  const submit = async () => {
    setImporting(true);
    setError('');
    try {
      const rowsPayload = bodyRows.map(r => {
        const obj = {};
        Object.entries(headerMap).forEach(([colIdx, field]) => {
          if (field) obj[field] = (r[Number(colIdx)] ?? '').toString().trim();
        });
        return obj;
      }).filter(o => (o.name || '').trim() !== '');

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: rowsPayload,
          agent_ids: agentIds,
          strategy,
          skip_duplicates: skipDuplicates,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Import failed');
      setResult(json.data);
      setStep(4);
      onComplete?.();
    } catch (e) {
      setError(e?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Import contacts from CSV</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {['Upload','Map columns','Distribute','Done'].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${active ? 'bg-indigo-600 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-[#1e2535] text-slate-500'}`}>{done ? '✓' : n}</span>
                <span className={active ? 'text-white' : ''}>{label}</span>
                {i < 3 && <span className="text-slate-700">›</span>}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded p-3">{error}</div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">
              Drop in a CSV with a header row. Most fields auto-detect (Name, Email, Phone, Source, Notes, Tags).
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => fileChosen(e.target.files?.[0])}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:cursor-pointer hover:file:bg-indigo-700"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">{bodyRows.length.toLocaleString()} row{bodyRows.length === 1 ? '' : 's'} detected. Map each column to a contact field (skip what you don't want).</p>
            <div className="overflow-x-auto border border-[#1e2535] rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2535]">
                    {headerRow.map((h, i) => (
                      <th key={i} className="px-2 py-2 text-left">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Col {i + 1}: {h || '(blank)'}</div>
                        <select
                          value={headerMap[i] || ''}
                          onChange={(e) => setHeaderMap(m => ({ ...m, [i]: e.target.value }))}
                          className="w-full px-1.5 py-1 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-xs rounded"
                        >
                          {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i} className="border-b border-[#1e2535] last:border-0">
                      {r.map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 text-slate-300 text-xs truncate max-w-[160px]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!hasName && <p className="text-amber-400 text-xs">⚠ Map at least one column to Name — rows without a name will be skipped.</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setStep(1)} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm">Back</button>
              <button onClick={() => setStep(3)} disabled={!hasName} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg">Next: Distribute</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1.5">Assign to which agents?</p>
              <p className="text-slate-500 text-xs mb-2">Pick zero to leave unassigned, one for "all to one rep", or several to split.</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {agents.length === 0 ? (
                  <p className="text-slate-600 text-xs italic">No agents found in users table.</p>
                ) : agents.map(a => (
                  <label key={a.id} className="flex items-center gap-2 px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded cursor-pointer hover:border-indigo-500/40">
                    <input
                      type="checkbox"
                      checked={agentIds.includes(a.id)}
                      onChange={(e) => setAgentIds(ids => e.target.checked ? [...ids, a.id] : ids.filter(x => x !== a.id))}
                      className="accent-indigo-500"
                    />
                    <span className="text-slate-200 text-sm truncate">{a.name}</span>
                    {a.role && <span className="text-slate-600 text-xs ml-auto">{a.role}</span>}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">Strategy</p>
              <div className="space-y-1">
                {[
                  { v: 'round_robin', label: 'Round-robin (1 → agent 1, 2 → agent 2, …)' },
                  { v: 'equal',       label: 'Equal split (chunked, agent 1 gets the first block)' },
                  { v: 'one',         label: 'All to the first selected agent' },
                ].map(opt => (
                  <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="strategy" checked={strategy === opt.v} onChange={() => setStrategy(opt.v)} className="accent-indigo-500" />
                    <span className="text-slate-300 text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDup(e.target.checked)} className="accent-indigo-500" />
              <span className="text-slate-300 text-sm">Skip rows whose phone number is already in the system</span>
              {!hasPhone && <span className="text-slate-500 text-xs">(no phone column mapped — nothing to dedupe on)</span>}
            </label>

            <div className="bg-[#0f1117] border border-[#1e2535] rounded p-3 text-xs text-slate-400">
              <p>Will import <span className="text-white font-medium">{bodyRows.length.toLocaleString()}</span> rows{agentIds.length > 0 && <>, split across <span className="text-white font-medium">{agentIds.length}</span> agent{agentIds.length === 1 ? '' : 's'}</>}.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setStep(2)} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm">Back</button>
              <button
                onClick={submit}
                disabled={importing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white text-sm rounded-lg"
              >
                {importing ? 'Importing…' : 'Import Contacts'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-4">
              <p className="text-emerald-300 font-medium text-base">Imported {result.created.toLocaleString()} contact{result.created === 1 ? '' : 's'}.</p>
              {result.skipped > 0 && <p className="text-amber-300 text-sm mt-1">{result.skipped.toLocaleString()} skipped (missing name or duplicate phone).</p>}
            </div>
            {result.assigned && Object.keys(result.assigned).length > 0 && (
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">Distribution</p>
                <ul className="space-y-1 text-sm">
                  {Object.entries(result.assigned).map(([agentId, count]) => {
                    const a = agents.find(x => x.id === Number(agentId));
                    return (
                      <li key={agentId} className="flex items-center gap-2">
                        <span className="text-slate-300">{a?.name ?? `Agent #${agentId}`}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-white font-medium">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
