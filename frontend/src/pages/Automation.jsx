import { useEffect, useState } from 'react';

const TRIGGER_LABELS = {
  form_submit: 'Form submitted',
  tag_added: 'Tag added',
  appointment_booked: 'Appointment booked',
  email_opened: 'Email opened',
  email_clicked: 'Email link clicked',
  deal_stage_changed: 'Deal stage changed',
  contact_created: 'Contact created',
  schedule: 'Scheduled',
  webhook: 'Webhook received',
  manual: 'Manual trigger',
};

const NODE_TYPES = [
  { type: 'send_email', label: 'Send email', color: 'bg-indigo-500/15 text-indigo-200' },
  { type: 'send_sms', label: 'Send SMS', color: 'bg-emerald-500/15 text-emerald-200' },
  { type: 'voicemail_drop', label: 'Voicemail drop', color: 'bg-purple-500/15 text-purple-200' },
  { type: 'add_tag', label: 'Add tag', color: 'bg-amber-500/15 text-amber-200' },
  { type: 'remove_tag', label: 'Remove tag', color: 'bg-rose-500/15 text-rose-200' },
  { type: 'wait', label: 'Wait', color: 'bg-slate-500/15 text-slate-200' },
  { type: 'if_branch', label: 'If branch', color: 'bg-blue-500/15 text-blue-200' },
  { type: 'update_stage', label: 'Update deal stage', color: 'bg-cyan-500/15 text-cyan-200' },
  { type: 'create_task', label: 'Create task', color: 'bg-orange-500/15 text-orange-200' },
  { type: 'book_meeting', label: 'Book meeting', color: 'bg-pink-500/15 text-pink-200' },
  { type: 'webhook', label: 'Webhook', color: 'bg-teal-500/15 text-teal-200' },
];

export default function Automation() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/automations', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setList(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/automations/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => setDetail(j.data));
  }, [selected]);

  const createNew = async () => {
    const res = await fetch('/api/automations', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Untitled automation', slug: 'untitled-' + Math.random().toString(36).slice(2, 6), trigger_type: 'tag_added' }),
    });
    const j = await res.json();
    setSelected(j.data.id); load();
  };

  const addNode = (type) => {
    if (!detail) return;
    const nodes = [...(detail.nodes || [])];
    const key = `n_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    nodes.push({ node_key: key, node_type: type, position_x: 0, position_y: nodes.length * 80, config: {} });
    if (nodes.length > 1) {
      const prev = nodes[nodes.length - 2];
      const edges = [...(detail.edges || []), { from_node_key: prev.node_key, to_node_key: key, branch: 'default' }];
      setDetail({ ...detail, nodes, edges });
    } else {
      setDetail({ ...detail, nodes });
    }
  };

  const removeNode = (i) => {
    const nodes = [...(detail.nodes || [])];
    const removed = nodes[i];
    nodes.splice(i, 1);
    const edges = (detail.edges || []).filter((e) => e.from_node_key !== removed.node_key && e.to_node_key !== removed.node_key);
    setDetail({ ...detail, nodes, edges });
  };

  const updateNodeConfig = (i, key, val) => {
    const nodes = [...(detail.nodes || [])];
    nodes[i] = { ...nodes[i], config: { ...nodes[i].config, [key]: val } };
    setDetail({ ...detail, nodes });
  };

  const save = async () => {
    setSaving(true);
    await fetch(`/api/automations/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detail.name, description: detail.description, trigger_type: detail.trigger_type,
        trigger_config: detail.trigger_config, is_active: detail.is_active,
        nodes: detail.nodes, edges: detail.edges,
      }),
    });
    setSaving(false); load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Automations</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-step workflows triggered by events.</p>
        </div>
        <button onClick={createNew} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium">+ New Automation</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          {!loading && list.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-sm">No automations yet.</div>
          )}
          <ul className="divide-y divide-[#1e2535]">
            {list.map((a) => (
              <li key={a.id}>
                <button onClick={() => setSelected(a.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === a.id ? 'bg-[#1e2535]' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.name}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{TRIGGER_LABELS[a.trigger_type] || a.trigger_type} · {a.active_runs} active runs</p>
                    </div>
                    <span className={`shrink-0 w-2 h-2 rounded-full ${a.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select or create an automation.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.name || ''} onChange={(e) => setDetail({ ...detail, name: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <textarea value={detail.description || ''} onChange={(e) => setDetail({ ...detail, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-300 text-sm rounded-lg px-3 py-2" />

              <div>
                <label className="block text-slate-400 text-xs mb-1">Trigger</label>
                <select value={detail.trigger_type} onChange={(e) => setDetail({ ...detail, trigger_type: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div className="border-t border-[#1e2535] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Flow</h3>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {NODE_TYPES.slice(0, 6).map((n) => (
                      <button key={n.type} onClick={() => addNode(n.type)} className={`text-xs px-2 py-1 rounded ${n.color} hover:opacity-90`}>+ {n.label}</button>
                    ))}
                  </div>
                </div>

                <ol className="relative pl-6 border-l-2 border-[#1e2535]">
                  {(detail.nodes || []).map((n, i) => {
                    const def = NODE_TYPES.find((t) => t.type === n.node_type) || { label: n.node_type, color: 'bg-slate-500/15' };
                    return (
                      <li key={n.node_key} className="mb-3 -ml-[31px]">
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${def.color}`}>
                            <span className="text-xs font-semibold">{i + 1}</span>
                          </div>
                          <div className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{def.label}</span>
                              <button onClick={() => removeNode(i)} className="text-red-400 hover:text-red-300 text-xs">×</button>
                            </div>
                            {n.node_type === 'wait' && (
                              <div className="flex items-center gap-2">
                                <label className="text-slate-400 text-xs">Wait</label>
                                <input type="number" value={n.config?.days ?? 1} onChange={(e) => updateNodeConfig(i, 'days', parseInt(e.target.value))} className="w-16 bg-transparent text-slate-200 text-sm border-b border-slate-600 focus:outline-none" />
                                <span className="text-slate-400 text-xs">days</span>
                              </div>
                            )}
                            {(n.node_type === 'send_email' || n.node_type === 'send_sms') && (
                              <input value={n.config?.template_slug || ''} onChange={(e) => updateNodeConfig(i, 'template_slug', e.target.value)} placeholder="Template slug" className="w-full bg-transparent text-slate-200 text-sm border-b border-slate-600 focus:outline-none font-mono" />
                            )}
                            {n.node_type === 'add_tag' && (
                              <input value={n.config?.tag || ''} onChange={(e) => updateNodeConfig(i, 'tag', e.target.value)} placeholder="Tag to add" className="w-full bg-transparent text-slate-200 text-sm border-b border-slate-600 focus:outline-none" />
                            )}
                            {n.node_type === 'voicemail_drop' && (
                              <input value={n.config?.recording_slug || ''} onChange={(e) => updateNodeConfig(i, 'recording_slug', e.target.value)} placeholder="Recording slug" className="w-full bg-transparent text-slate-200 text-sm border-b border-slate-600 focus:outline-none font-mono" />
                            )}
                            {n.node_type === 'if_branch' && (
                              <input value={n.config?.condition || ''} onChange={(e) => updateNodeConfig(i, 'condition', e.target.value)} placeholder='e.g. tag == "trial"' className="w-full bg-transparent text-slate-200 text-sm border-b border-slate-600 focus:outline-none font-mono" />
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {(!detail.nodes || detail.nodes.length === 0) && (
                  <p className="text-slate-500 text-sm py-4 text-center">Add a step above to start building.</p>
                )}
              </div>

              <div className="border-t border-[#1e2535] pt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={Boolean(detail.is_active)} onChange={(e) => setDetail({ ...detail, is_active: e.target.checked ? 1 : 0 })} />
                  Active
                </label>
                <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
