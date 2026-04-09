import { useState, useEffect, useRef } from 'react';

const SOURCES = ['Website', 'Referral', 'Google', 'Facebook', 'Cold Call', 'Trade Show', 'Other'];

const STAGE_COLORS = {
  'New Lead':       'bg-blue-500/20 text-blue-300',
  'Contacted':      'bg-purple-500/20 text-purple-300',
  'Qualified':      'bg-amber-500/20 text-amber-300',
  'Proposal Sent':  'bg-pink-500/20 text-pink-300',
  'Won':            'bg-emerald-500/20 text-emerald-300',
  'Lost':           'bg-red-500/20 text-red-300',
};

function TagChip({ tag, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white leading-none">×</button>
      )}
    </span>
  );
}

function AddContactModal({ stages, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', notes: '', pipeline_stage_id: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pipeline_stage_id: form.pipeline_stage_id || null }),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2535]">
          <h2 className="text-white font-semibold">Add Contact</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Source</label>
              <select value={form.source} onChange={e => set('source', e.target.value)}
                className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="">— Select —</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Pipeline Stage</label>
            <select value={form.pipeline_stage_id} onChange={e => set('pipeline_stage_id', e.target.value)}
              className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">— None —</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Type tag + Enter"
                className="flex-1 bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button type="button" onClick={addTag}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(t => <TagChip key={t} tag={t} onRemove={() => set('tags', form.tags.filter(x => x !== t))} />)}
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Contact'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-[#2a3347] text-slate-400 text-sm rounded-lg hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailPanel({ contact, stages, onClose, onDeleted }) {
  const stageName = stages.find(s => s.id == contact.pipeline_stage_id)?.name ?? '—';
  const stageClass = STAGE_COLORS[stageName] ?? 'bg-slate-500/20 text-slate-300';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[#141923] border-l border-[#1e2535] shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2535]">
        <h2 className="text-white font-semibold">Contact Detail</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl text-white font-bold">
            {contact.name[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{contact.name}</p>
            {stageName !== '—' && <span className={`text-xs px-2 py-0.5 rounded-full ${stageClass}`}>{stageName}</span>}
          </div>
        </div>

        {[
          { label: 'Email',  value: contact.email },
          { label: 'Phone',  value: contact.phone },
          { label: 'Source', value: contact.source },
        ].map(({ label, value }) => value ? (
          <div key={label}>
            <p className="text-slate-500 text-xs mb-1">{label}</p>
            <p className="text-slate-200 text-sm">{value}</p>
          </div>
        ) : null)}

        {contact.tags?.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map(t => <TagChip key={t} tag={t} />)}
            </div>
          </div>
        )}

        {contact.notes && (
          <div>
            <p className="text-slate-500 text-xs mb-1">Notes</p>
            <p className="text-slate-200 text-sm whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}

        <div>
          <p className="text-slate-500 text-xs mb-1">Added</p>
          <p className="text-slate-400 text-sm">{new Date(contact.created_at).toLocaleDateString()}</p>
        </div>

        {/* Quick Actions — SMS + Email */}
        <div className="border-t border-[#1e2535] pt-4">
          <p className="text-slate-500 text-xs mb-2">Quick Actions</p>
          <div className="flex gap-2">
            {contact.phone && (
              <a href={`sms:${contact.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg hover:bg-emerald-600/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Text
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 7 10-7" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[#1e2535]">
        <button onClick={() => onDeleted(contact.id)}
          className="w-full py-2 border border-red-500/40 text-red-400 text-sm rounded-lg hover:bg-red-500/10">
          Delete Contact
        </button>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts]       = useState([]);
  const [stages, setStages]           = useState([]);
  const [search, setSearch]           = useState('');
  const [filterTag, setFilterTag]     = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selected, setSelected]       = useState(new Set());
  const [showAdd, setShowAdd]         = useState(false);
  const [detail, setDetail]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [bulkTag, setBulkTag]         = useState('');
  const debounceRef = useRef(null);

  const fetchContacts = async () => {
    const params = new URLSearchParams();
    if (search)      params.set('search', search);
    if (filterTag)   params.set('tag', filterTag);
    if (filterStage) params.set('stage', filterStage);
    const res = await fetch('/api/contacts?' + params);
    const { data } = await res.json();
    setContacts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/pipeline_stages').then(r => r.json()).then(({ data }) => setStages(data ?? []));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchContacts, 250);
  }, [search, filterTag, filterStage]);

  const allTags = [...new Set(contacts.flatMap(c => c.tags ?? []))];

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === contacts.length ? new Set() : new Set(contacts.map(c => c.id)));
  };

  const bulkAction = async (action, extra = {}) => {
    await fetch(`/api/contacts/bulk/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], ...extra }),
    });
    setSelected(new Set());
    fetchContacts();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    setDetail(null);
    fetchContacts();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-xl">Contacts</h2>
          <p className="text-slate-500 text-sm">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          <span className="text-lg leading-none">+</span> Add Contact
        </button>
      </div>

      {/* Search + stage filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            className="w-full bg-[#141923] border border-[#1e2535] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
          className="bg-[#141923] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="">All Stages</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 text-xs">Filter by tag:</span>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filterTag === tag ? 'bg-indigo-600 text-white' : 'bg-[#1e2535] text-slate-400 hover:text-white'}`}>
              {tag}
            </button>
          ))}
          {filterTag && (
            <button onClick={() => setFilterTag('')} className="text-xs text-slate-500 hover:text-white underline">Clear</button>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-lg">
          <span className="text-indigo-300 text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <input value={bulkTag} onChange={e => setBulkTag(e.target.value)} placeholder="Tag name…"
              className="bg-[#1e2535] border border-[#2a3347] rounded px-2 py-1 text-xs text-white w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={() => { if (bulkTag) { bulkAction('tag', { tag: bulkTag }); setBulkTag(''); } }}
              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Tag</button>
          </div>
          <select onChange={e => { if (e.target.value) { bulkAction('stage', { pipeline_stage_id: e.target.value }); e.target.value = ''; } }}
            className="bg-[#1e2535] border border-[#2a3347] rounded px-2 py-1 text-xs text-slate-300 focus:outline-none">
            <option value="">Assign Stage…</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => bulkAction('delete')}
            className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 text-xs rounded hover:bg-red-600/30 ml-auto">
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#141923] border border-[#1e2535] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2535]">
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox"
                  checked={contacts.length > 0 && selected.size === contacts.length}
                  onChange={toggleAll}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer" />
              </th>
              {['Name','Email','Phone','Source','Stage','Tags',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading…</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">No contacts found</td></tr>
            ) : contacts.map(c => {
              const stageName = stages.find(s => s.id == c.pipeline_stage_id)?.name ?? '';
              const stageClass = STAGE_COLORS[stageName] ?? '';
              return (
                <tr key={c.id} onClick={() => setDetail(c)}
                  className="border-b border-[#1e2535] last:border-0 hover:bg-[#1a2030] cursor-pointer transition-colors">
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/70 flex items-center justify-center text-xs text-white font-medium shrink-0">
                        {c.name[0]}
                      </div>
                      <span className="text-white font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{c.source ?? '—'}</td>
                  <td className="px-4 py-3">
                    {stageName
                      ? <span className={`text-xs px-2 py-0.5 rounded-full ${stageClass}`}>{stageName}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).map(t => <TagChip key={t} tag={t} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={e => { e.stopPropagation(); setDetail(c); }}
                      className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-[#1e2535]">
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddContactModal
          stages={stages}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchContacts(); }}
        />
      )}

      {detail && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setDetail(null)} />
          <DetailPanel
            contact={detail}
            stages={stages}
            onClose={() => setDetail(null)}
            onDeleted={handleDelete}
          />
        </>
      )}
    </div>
  );
}
