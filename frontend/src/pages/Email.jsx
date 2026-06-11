import { useEffect, useState } from 'react';

const STATUS_BADGE = {
  draft:     'bg-slate-600/30 text-slate-400',
  scheduled: 'bg-blue-500/10 text-blue-400',
  sending:   'bg-amber-500/10 text-amber-400',
  sent:      'bg-emerald-500/10 text-emerald-400',
  paused:    'bg-purple-500/10 text-purple-400',
  failed:    'bg-red-500/10 text-red-400',
};

export default function Email() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/campaigns', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setCampaigns(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/campaigns/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => setDetail(j.data));
  }, [selected]);

  const createNew = async () => {
    const res = await fetch('/api/campaigns', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Untitled campaign',
        subject: '',
        from_email: 'orders@cadsuite.com',
        from_name: 'CADsuite',
        blocks: [
          { type: 'heading', size: 'h2', text: 'Your headline here' },
          { type: 'text', text: 'Hi {first_name},\n\nWrite your message body here.\n\nThanks,\nDarin' },
          { type: 'button', label: 'Start 14-day trial', url: 'https://marketing.cadsuite.com/checkout/contractor' },
        ],
      }),
    });
    const j = await res.json();
    setSelected(j.data.id);
    load();
  };

  const save = async () => {
    if (!detail) return;
    setSaving(true);
    await fetch(`/api/campaigns/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detail.name, subject: detail.subject, preview_text: detail.preview_text,
        from_name: detail.from_name, from_email: detail.from_email, reply_to: detail.reply_to,
        blocks: detail.blocks, recipient_filter: detail.recipient_filter,
        scheduled_at: detail.scheduled_at,
      }),
    });
    setSaving(false); load();
  };

  const sendTest = async () => {
    if (!testEmail) return;
    await save();
    const res = await fetch(`/api/campaigns/${detail.id}?action=send_test`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail }),
    });
    const j = await res.json();
    alert(j.data?.sent ? `Test sent to ${testEmail}` : `Send failed: ${JSON.stringify(j)}`);
  };

  const queueRecipients = async () => {
    await save();
    const res = await fetch(`/api/campaigns/${detail.id}?action=recipients`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_filter: detail.recipient_filter || {} }),
    });
    const j = await res.json();
    alert(`Queued ${j.data?.queued ?? 0} recipients.`);
    load();
  };

  const sendNow = async () => {
    if (!confirm(`Send this campaign to ${detail.recipient_count} recipients?`)) return;
    const res = await fetch(`/api/campaigns/${detail.id}?action=send`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const j = await res.json();
    alert(`Sent: ${j.data?.sent ?? 0} · Failed: ${j.data?.failed ?? 0} · Remaining: ${j.data?.remaining ?? 0}`);
    load();
  };

  const moveBlock = (idx, dir) => {
    const blocks = [...(detail.blocks || [])];
    const t = idx + dir;
    if (t < 0 || t >= blocks.length) return;
    [blocks[idx], blocks[t]] = [blocks[t], blocks[idx]];
    setDetail({ ...detail, blocks });
  };
  const updateBlock = (i, k, v) => {
    const blocks = [...(detail.blocks || [])];
    blocks[i] = { ...blocks[i], [k]: v };
    setDetail({ ...detail, blocks });
  };
  const removeBlock = (i) => {
    const blocks = [...(detail.blocks || [])];
    blocks.splice(i, 1);
    setDetail({ ...detail, blocks });
  };
  const addBlock = (type) => {
    const d = {
      heading: { type: 'heading', size: 'h2', text: 'Headline' },
      text:    { type: 'text', text: 'Body text' },
      image:   { type: 'image', url: '', alt: '' },
      button:  { type: 'button', label: 'Click me', url: 'https://' },
      divider: { type: 'divider' },
      spacer:  { type: 'spacer', height: 24 },
    };
    setDetail({ ...detail, blocks: [...(detail.blocks || []), d[type]] });
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-slate-400 text-sm mt-1">{campaigns.length} campaigns.</p>
        </div>
        <button onClick={createNew} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Campaign</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          {!loading && campaigns.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-sm">No campaigns yet. Click + New Campaign.</div>
          )}
          <ul className="divide-y divide-[#1e2535] max-h-[75vh] overflow-y-auto">
            {campaigns.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelected(c.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === c.id ? 'bg-[#1e2535]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.name}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{c.subject || '(no subject)'}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
                  </div>
                  {c.status !== 'draft' && (
                    <p className="text-slate-500 text-xs mt-2">
                      {c.sent_count}/{c.recipient_count} sent · {c.open_count} opens · {c.click_count} clicks
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select or create a campaign.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.name || ''} onChange={(e) => setDetail({ ...detail, name: e.target.value })} placeholder="Campaign name" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input value={detail.from_name || ''} onChange={(e) => setDetail({ ...detail, from_name: e.target.value })} placeholder="From name" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                <input value={detail.from_email || ''} onChange={(e) => setDetail({ ...detail, from_email: e.target.value })} placeholder="From email" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              </div>
              <input value={detail.subject || ''} onChange={(e) => setDetail({ ...detail, subject: e.target.value })} placeholder="Subject line" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              <input value={detail.preview_text || ''} onChange={(e) => setDetail({ ...detail, preview_text: e.target.value })} placeholder="Preview text (inbox preview)" className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />

              <div className="border-t border-[#1e2535] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Blocks</h3>
                  <div className="flex gap-1">
                    {['heading','text','image','button','divider','spacer'].map((t) => (
                      <button key={t} onClick={() => addBlock(t)} className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">+ {t}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {(detail.blocks || []).map((b, i) => (
                    <div key={i} className="bg-[#0f1117] border border-[#1e2535] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">{b.type}</span>
                        <div className="flex gap-1">
                          <button onClick={() => moveBlock(i, -1)} className="text-slate-500 hover:text-white text-xs px-1">↑</button>
                          <button onClick={() => moveBlock(i, 1)} className="text-slate-500 hover:text-white text-xs px-1">↓</button>
                          <button onClick={() => removeBlock(i)} className="text-red-400 hover:text-red-300 text-xs px-1">×</button>
                        </div>
                      </div>
                      {b.type === 'heading' && (
                        <input value={b.text || ''} onChange={(e) => updateBlock(i, 'text', e.target.value)} className="w-full bg-transparent text-white font-bold text-lg focus:outline-none" />
                      )}
                      {b.type === 'text' && (
                        <textarea value={b.text || ''} onChange={(e) => updateBlock(i, 'text', e.target.value)} rows={4} className="w-full bg-transparent text-slate-200 text-sm focus:outline-none resize-none" />
                      )}
                      {b.type === 'image' && (
                        <>
                          <input value={b.url || ''} onChange={(e) => updateBlock(i, 'url', e.target.value)} placeholder="Image URL" className="w-full bg-transparent text-slate-200 text-sm focus:outline-none mb-1 font-mono" />
                          <input value={b.alt || ''} onChange={(e) => updateBlock(i, 'alt', e.target.value)} placeholder="Alt text" className="w-full bg-transparent text-slate-500 text-xs focus:outline-none" />
                        </>
                      )}
                      {b.type === 'button' && (
                        <>
                          <input value={b.label || ''} onChange={(e) => updateBlock(i, 'label', e.target.value)} placeholder="Button label" className="w-full bg-transparent text-indigo-400 font-semibold focus:outline-none mb-1" />
                          <input value={b.url || ''} onChange={(e) => updateBlock(i, 'url', e.target.value)} placeholder="https://…" className="w-full bg-transparent text-slate-500 text-xs focus:outline-none font-mono" />
                        </>
                      )}
                      {b.type === 'divider' && <hr className="border-slate-600" />}
                      {b.type === 'spacer' && (
                        <input type="number" value={b.height || 24} onChange={(e) => updateBlock(i, 'height', parseInt(e.target.value))} className="w-24 bg-transparent text-slate-500 text-xs focus:outline-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#1e2535] pt-4 grid grid-cols-[1fr_auto] gap-3">
                <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Test email address" className="bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                <button onClick={sendTest} className="bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg px-3">Send Test</button>
              </div>

              <div className="border-t border-[#1e2535] pt-4 flex flex-wrap items-center gap-3">
                <button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg">{saving ? 'Saving…' : 'Save Draft'}</button>
                <button onClick={queueRecipients} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg">Queue Recipients ({detail.recipient_count ?? 0})</button>
                <button onClick={sendNow} disabled={!detail.recipient_count} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg">Send Now →</button>
              </div>

              {detail.status !== 'draft' && (
                <div className="border-t border-[#1e2535] pt-4 grid grid-cols-4 gap-3 text-center">
                  <div><p className="text-2xl font-bold text-white">{detail.recipient_count}</p><p className="text-xs text-slate-500">Recipients</p></div>
                  <div><p className="text-2xl font-bold text-emerald-400">{detail.sent_count}</p><p className="text-xs text-slate-500">Sent</p></div>
                  <div><p className="text-2xl font-bold text-blue-400">{detail.open_count}</p><p className="text-xs text-slate-500">Opens</p></div>
                  <div><p className="text-2xl font-bold text-amber-400">{detail.click_count}</p><p className="text-xs text-slate-500">Clicks</p></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
