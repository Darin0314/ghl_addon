import { useEffect, useState } from 'react';

function LinkedInCard() {
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ client_id: '', client_secret: '', organization_urn: '' });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [error, setError] = useState('');
  const [agentIds, setAgentIds] = useState([]);
  const [strategy, setStrategy] = useState('round_robin');

  const load = async () => {
    try {
      const [s, u] = await Promise.all([
        fetch('/api/linkedin/status', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/users',           { credentials: 'include' }).then(r => r.json()),
      ]);
      setStatus(s?.data || null);
      setAgents(u?.data || []);
      const dist = s?.data?.agent_distribution || {};
      if (Array.isArray(dist.agent_ids)) setAgentIds(dist.agent_ids);
      if (dist.strategy) setStrategy(dist.strategy);
    } catch (e) {
      setError(e?.message ?? 'Failed to load LinkedIn status');
    }
  };
  useEffect(() => { load(); }, []);

  // Listen for the OAuth popup signaling success
  useEffect(() => {
    const onMsg = (e) => {
      if (e?.data?.type !== 'linkedin-oauth') return;
      if (e.data.ok) { setSyncResult('Connected'); load(); }
      else setError(e.data.error || 'OAuth failed');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const saveCreds = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/linkedin/credentials', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Save failed');
      setStatus(j.data);
      setForm({ client_id: '', client_secret: '', organization_urn: '' });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const startOAuth = async () => {
    setError(''); setSyncResult('');
    try {
      const res = await fetch('/api/linkedin/auth-url', { credentials: 'include' });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Could not start OAuth');
      window.open(j.data.url, 'li_oauth', 'width=600,height=720');
    } catch (e) { setError(e.message); }
  };

  const disconnect = async () => {
    await fetch('/api/linkedin/disconnect', { method: 'POST', credentials: 'include' });
    load();
  };

  const sync = async () => {
    setSyncing(true); setSyncResult(''); setError('');
    try {
      const res = await fetch('/api/linkedin/sync', { method: 'POST', credentials: 'include' });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Sync failed');
      setSyncResult(`Imported ${j.data.imported} lead(s)`);
      load();
    } catch (e) { setError(e.message); }
    finally { setSyncing(false); }
  };

  const saveSettings = async () => {
    setSaving(true); setError('');
    try {
      await fetch('/api/linkedin/settings', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_distribution: { agent_ids: agentIds, strategy },
        }),
      });
      load();
    } finally { setSaving(false); }
  };

  if (!status) return <p className="text-slate-500 text-sm">Loading LinkedIn config…</p>;

  return (
    <div className="bg-[#141923] border border-[#1e2535] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">LinkedIn Lead Gen Ads</h3>
          <p className="text-slate-500 text-xs">Auto-import leads from your LinkedIn Lead Gen forms.</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.connected ? 'bg-emerald-500/15 text-emerald-300' : status.configured ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
          {status.connected ? 'Connected' : status.configured ? 'Configured — not connected' : 'Not configured'}
        </span>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded p-2">{error}</div>}
      {syncResult && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded p-2">{syncResult}</div>}

      {!status.configured ? (
        <div className="space-y-3">
          <p className="text-slate-400 text-xs">
            Paste credentials from your LinkedIn Marketing Developer app
            (<a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">linkedin.com/developers/apps</a>).
            App needs <code className="px-1 bg-[#0f1117] rounded">r_marketing_leadgen_automation</code> scope.
          </p>
          <input type="text" placeholder="Client ID" value={form.client_id}
            onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
            className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
          <input type="password" placeholder="Client Secret" value={form.client_secret}
            onChange={e => setForm(f => ({ ...f, client_secret: e.target.value }))}
            className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
          <input type="text" placeholder="Organization URN (e.g. urn:li:organization:1234567)"
            value={form.organization_urn}
            onChange={e => setForm(f => ({ ...f, organization_urn: e.target.value }))}
            className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded" />
          <button onClick={saveCreds} disabled={saving || !form.client_id || !form.client_secret}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white text-sm rounded-lg">
            Save credentials
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {status.connected ? (
              <>
                <button onClick={sync} disabled={syncing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white text-sm rounded-lg">
                  {syncing ? 'Syncing…' : 'Sync now'}
                </button>
                <button onClick={disconnect}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-sm rounded-lg border border-rose-500/30">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={startOAuth}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg">
                Connect to LinkedIn
              </button>
            )}
            <button onClick={() => { setForm({ client_id: '', client_secret: '', organization_urn: '' }); setStatus(s => ({ ...s, configured: false })); }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg">
              Re-enter credentials
            </button>
          </div>
          {status.last_sync_at && (
            <p className="text-slate-500 text-xs">
              Last sync: {new Date(status.last_sync_at.replace(' ', 'T')).toLocaleString()} ·
              imported {status.last_sync_count}
              {status.last_sync_error && <span className="text-rose-400"> · error: {status.last_sync_error}</span>}
            </p>
          )}
          <div className="border-t border-[#1e2535] pt-3 space-y-2">
            <p className="text-slate-300 text-xs font-medium">Auto-distribute LinkedIn leads to:</p>
            <div className="grid grid-cols-2 gap-2">
              {agents.map(a => (
                <label key={a.id} className="flex items-center gap-2 px-2 py-1 bg-[#0f1117] border border-[#1e2535] rounded text-xs cursor-pointer">
                  <input type="checkbox" checked={agentIds.includes(a.id)}
                    onChange={e => setAgentIds(ids => e.target.checked ? [...ids, a.id] : ids.filter(x => x !== a.id))}
                    className="accent-indigo-500" />
                  <span className="text-slate-200">{a.name}</span>
                </label>
              ))}
            </div>
            <select value={strategy} onChange={e => setStrategy(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-xs rounded">
              <option value="round_robin">Round-robin across selected agents</option>
              <option value="one">All to first selected agent</option>
            </select>
            <button onClick={saveSettings} disabled={saving}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 text-sm rounded-lg">
              Save distribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-white font-semibold text-xl">Settings</h2>
        <p className="text-slate-500 text-sm">Integrations + system preferences</p>
      </div>
      <LinkedInCard />
    </div>
  );
}
