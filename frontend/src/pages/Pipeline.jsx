import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, DragOverlay,
} from '@dnd-kit/core';
import CallHistory from '../components/CallHistory';

// Re-use dialer hook from Contacts pattern — dispatch the same event the
// floating RingCentralDialer listens for.
function dialPhone(phoneNumber) {
  if (!phoneNumber) return;
  document.dispatchEvent(new CustomEvent('rc-adapter-new-call', {
    detail: { phoneNumber: String(phoneNumber), toCall: true },
  }));
}

// Same "Last called" tone logic as Contacts so the kanban + table stay in sync.
function lastCalledLabel(iso) {
  if (!iso) return null;
  const d = new Date(String(iso).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1)  return { text: 'just now',  tone: 'fresh' };
  if (min < 60) return { text: `${min}m`,   tone: 'fresh' };
  const hr = Math.floor(min / 60);
  if (hr < 24)  return { text: `${hr}h`,    tone: 'fresh' };
  const days = Math.floor(hr / 24);
  if (days < 14) return { text: `${days}d`, tone: 'fresh' };
  if (days < 30) return { text: `${days}d`, tone: 'stale' };
  return                  { text: `${days}d`, tone: 'cold'  };
}
const LAST_CALL_TONES = {
  fresh: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  stale: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  cold:  'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

function fmtMoney(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `$${v.toFixed(0)}`;
}

function DealCard({ deal, dragging, onOpen }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `deal-${deal.id}` });
  const lc = lastCalledLabel(deal.last_call_at);
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={(e) => { e.stopPropagation(); onOpen?.(deal); }}
      className={`bg-[#141923] border border-[#1e2535] hover:border-indigo-500/40 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-colors ${isDragging || dragging ? 'opacity-50 ring-2 ring-indigo-500/40' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-white text-sm font-medium truncate flex-1">{deal.title}</p>
        <span className="text-emerald-300 text-xs font-semibold shrink-0">{fmtMoney(deal.value)}</span>
      </div>
      <p className="text-slate-400 text-xs truncate mb-2">{deal.contact_name || '—'}</p>
      <div className="flex items-center gap-2 text-xs">
        {lc ? (
          <span className={`px-1.5 py-0.5 rounded-full border ${LAST_CALL_TONES[lc.tone]}`} title={`Last called ${deal.last_call_at}`}>
            ☎ {lc.text}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full border border-slate-700 text-slate-500">☎ never</span>
        )}
        {deal.contact_phone && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); dialPhone(deal.contact_phone); }}
            className="ml-auto px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs"
            title={`Dial ${deal.contact_phone}`}
          >
            Call
          </button>
        )}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onOpen?.(deal); }}
          className="px-2 py-0.5 rounded bg-slate-700/40 hover:bg-slate-600/50 text-slate-300 text-xs"
          title="Open detail"
        >
          Open
        </button>
      </div>
    </div>
  );
}

function DealDetailPanel({ deal, stages, onClose, onChange, onDeleted }) {
  const [form, setForm] = useState({ title: deal.title, value: deal.value, stage_id: deal.stage_id, status: deal.status, expected_close: deal.expected_close || '', notes: deal.notes || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          value: parseFloat(form.value) || 0,
          stage_id: Number(form.stage_id),
          status: form.status,
          expected_close: form.expected_close || null,
          notes: form.notes || null,
        }),
      });
      onChange?.();
      onClose();
    } finally { setSaving(false); }
  };
  const del = async () => {
    if (!window.confirm('Delete this deal?')) return;
    await fetch(`/api/deals/${deal.id}`, { method: 'DELETE', credentials: 'include' });
    onDeleted?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#141923] border-l border-[#1e2535] z-50 overflow-y-auto p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs">Deal · #{deal.id}</p>
            <h3 className="text-white text-lg font-semibold">{deal.contact_name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-slate-500 text-xs mb-1">Title</p>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-500 text-xs mb-1">Value</p>
              <input type="number" step="0.01" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Stage</p>
              <select value={form.stage_id} onChange={(e) => setForm(f => ({ ...f, stage_id: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded">
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-500 text-xs mb-1">Status</p>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded">
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Expected close</p>
              <input type="date" value={form.expected_close} onChange={(e) => setForm(f => ({ ...f, expected_close: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Notes</p>
            <textarea rows={4} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded resize-none" />
          </div>
          {deal.contact_phone && (
            <div className="flex gap-2">
              <button type="button" onClick={() => dialPhone(deal.contact_phone)} className="flex-1 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm rounded hover:bg-emerald-600/30">
                Call {deal.contact_phone}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#1e2535] pt-3">
          <CallHistory contactId={deal.contact_id} phoneNumber={deal.contact_phone} />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1e2535]">
          <button onClick={del} className="text-rose-400 hover:text-rose-300 text-sm">Delete deal</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function StageColumn({ stage, deals, totalValue, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage.id}` });
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: stage.color || '#6b7280' }} />
          <h3 className="text-slate-200 text-sm font-medium">{stage.name}</h3>
          <span className="text-slate-500 text-xs">{deals.length}</span>
        </div>
        <span className="text-slate-400 text-xs">{fmtMoney(totalValue)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`bg-[#0f1117] border border-[#1e2535] rounded-xl p-2 min-h-[400px] space-y-2 transition-colors ${isOver ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}
      >
        {deals.length === 0 ? (
          <p className="text-slate-600 text-xs italic text-center py-6">Drop deals here</p>
        ) : (
          deals.map(d => <DealCard key={d.id} deal={d} onOpen={onOpen} />)
        )}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [openDeal, setOpenDeal] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newDealForm, setNewDealForm] = useState({ contact_id: '', title: '', value: '', stage_id: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stagesRes, dealsRes] = await Promise.all([
        fetch('/api/pipeline_stages', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/deals', { credentials: 'include' }).then(r => r.json()),
      ]);
      setStages(Array.isArray(stagesRes?.data) ? stagesRes.data : []);
      setDeals(Array.isArray(dealsRes?.data) ? dealsRes.data : []);
    } catch {
      setStages([]); setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Lightweight contact list for the New Deal picker (lazy-load when modal opens)
  useEffect(() => {
    if (!showNewDeal || contacts.length > 0) return;
    fetch('/api/contacts', { credentials: 'include' })
      .then(r => r.json())
      .then(j => setContacts(Array.isArray(j?.data) ? j.data : []))
      .catch(() => setContacts([]));
  }, [showNewDeal, contacts.length]);

  const dealsByStage = useMemo(() => {
    const m = {};
    for (const s of stages) m[s.id] = [];
    for (const d of deals) {
      if (m[d.stage_id]) m[d.stage_id].push(d);
    }
    return m;
  }, [stages, deals]);

  const activeDeal = useMemo(() =>
    activeId ? deals.find(d => `deal-${d.id}` === activeId) : null,
  [activeId, deals]);

  const onDragStart = (e) => setActiveId(e.active.id);
  const onDragEnd = async (e) => {
    setActiveId(null);
    const dealId = Number(String(e.active.id).replace('deal-', ''));
    const targetStageId = Number(String(e.over?.id || '').replace('stage-', ''));
    if (!dealId || !targetStageId) return;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage_id === targetStageId) return;
    // Optimistic update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage_id: targetStageId } : d));
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: targetStageId }),
      });
    } catch {
      // Revert on failure
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage_id: deal.stage_id } : d));
    }
  };

  const createDeal = async () => {
    if (!newDealForm.contact_id || !newDealForm.title.trim()) return;
    await fetch('/api/deals', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: Number(newDealForm.contact_id),
        title: newDealForm.title.trim(),
        value: parseFloat(newDealForm.value) || 0,
        stage_id: newDealForm.stage_id ? Number(newDealForm.stage_id) : undefined,
      }),
    });
    setShowNewDeal(false);
    setNewDealForm({ contact_id: '', title: '', value: '', stage_id: '' });
    load();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading pipeline…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {deals.length} deal{deals.length === 1 ? '' : 's'} ·{' '}
          {fmtMoney(deals.reduce((s, d) => s + Number(d.value || 0), 0))} total
        </p>
        <button
          type="button"
          onClick={() => setShowNewDeal(true)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
        >
          + New Deal
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(s => (
            <StageColumn
              key={s.id}
              stage={s}
              deals={dealsByStage[s.id] || []}
              totalValue={(dealsByStage[s.id] || []).reduce((sum, d) => sum + Number(d.value || 0), 0)}
              onOpen={(d) => setOpenDeal(d)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {openDeal && (
        <DealDetailPanel
          deal={openDeal}
          stages={stages}
          onClose={() => setOpenDeal(null)}
          onChange={load}
          onDeleted={load}
        />
      )}

      {showNewDeal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowNewDeal(false)}>
          <div className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-md p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold">New Deal</h3>
            <select
              value={newDealForm.contact_id}
              onChange={e => setNewDealForm(f => ({ ...f, contact_id: e.target.value }))}
              className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg"
            >
              <option value="">Pick a contact…</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
            </select>
            <input
              type="text"
              placeholder="Deal title (e.g. Front porch reroof)"
              value={newDealForm.title}
              onChange={e => setNewDealForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="$ value"
                value={newDealForm.value}
                onChange={e => setNewDealForm(f => ({ ...f, value: e.target.value }))}
                className="flex-1 px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg"
              />
              <select
                value={newDealForm.stage_id}
                onChange={e => setNewDealForm(f => ({ ...f, stage_id: e.target.value }))}
                className="flex-1 px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg"
              >
                <option value="">First stage</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewDeal(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              <button
                type="button"
                onClick={createDeal}
                disabled={!newDealForm.contact_id || !newDealForm.title.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
