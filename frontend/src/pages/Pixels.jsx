import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

const PLATFORM_META = {
  meta:     { label: 'Meta (Facebook + Instagram)', color: 'bg-blue-600/20 text-blue-300', help: 'Business Manager → Events Manager → Data Sources → your Pixel. Copy the 16-digit Pixel ID. For Conversions API, generate an access token in the same panel.', idField: 'Pixel ID' },
  google:   { label: 'Google Ads + GA4 + YouTube',  color: 'bg-amber-500/20 text-amber-300', help: 'Use your GA4 Measurement ID (G-XXXXXXX) OR your Google Ads conversion ID (AW-XXXXXXX). YouTube Ads conversions roll up via the same tag — no separate setup.', idField: 'Tag ID (G- or AW-)' },
  linkedin: { label: 'LinkedIn Insight Tag',         color: 'bg-sky-600/20 text-sky-300',     help: 'Campaign Manager → Account Assets → Insight Tag → Partner ID (6-7 digits).', idField: 'Partner ID' },
  tiktok:   { label: 'TikTok Pixel',                 color: 'bg-pink-600/20 text-pink-300',   help: 'TikTok Ads Manager → Assets → Events → Web Events → Pixel ID (CXXXXXXX). Events API token from the same page.', idField: 'Pixel ID' },
  x:        { label: 'X (Twitter) Pixel',            color: 'bg-slate-500/20 text-slate-300', help: 'X Ads → Tools → Events Manager → Add Event Source → Pixel ID.', idField: 'Pixel ID' },
  reddit:   { label: 'Reddit Pixel',                 color: 'bg-orange-600/20 text-orange-300', help: 'Reddit Ads → Conversions → Pixel → Pixel ID (a2_…).', idField: 'Pixel ID' },
};

export default function Pixels() {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/ad_pixels', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setPixels(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  const save = async (p) => {
    await fetch('/api/ad_pixels', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: p.platform,
        pixel_id: p.pixel_id || null,
        dataset_id: p.dataset_id || null,
        conversion_api_token: p.conversion_api_token_new || null,
        test_event_code: p.test_event_code || null,
        is_active: p.is_active ? 1 : 0,
        config: p.config || null,
        notes: p.notes || null,
      }),
    });
    setEditing(null);
    load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Tracking Pixels <InfoTag sectionKey="pixels.list" /></h1>
          <p className="text-slate-400 text-sm mt-1">Browser + server-side conversion tracking for every ad platform.</p>
        </div>
        <div className="text-xs text-slate-500">Snippet URL: <code className="text-indigo-400">/api/pixel-snippets?account_id=4</code></div>
      </header>

      {loading && <div className="text-center text-slate-500 py-12">Loading…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pixels.map((p) => {
          const meta = PLATFORM_META[p.platform] || { label: p.platform, color: '', help: '', idField: 'Pixel ID' };
          const isEdit = editing && editing.id === p.id;
          const draft = isEdit ? editing : p;
          return (
            <article key={p.id} className="bg-[#141923] border border-[#1e2535] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{meta.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.events_30d} events in last 30d</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                  {p.is_active ? 'Active' : 'Off'}
                </span>
              </div>
              <p className="text-slate-500 text-xs mb-3">{meta.help}</p>

              {!isEdit && (
                <>
                  <div className="text-sm text-slate-300 mb-3">
                    <strong className="text-slate-500 text-xs uppercase tracking-wider block mb-1">{meta.idField}</strong>
                    <code className="text-emerald-400">{p.pixel_id || '— not configured —'}</code>
                  </div>
                  {p.conversion_api_token_masked && (
                    <div className="text-sm mb-3">
                      <strong className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Conversions API token</strong>
                      <code className="text-slate-300">{p.conversion_api_token_masked}</code>
                    </div>
                  )}
                  <button onClick={() => setEditing({ ...p, conversion_api_token_new: '' })} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg">Configure →</button>
                </>
              )}

              {isEdit && (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">{meta.idField}</label>
                    <input value={draft.pixel_id || ''} onChange={(e) => setEditing({ ...draft, pixel_id: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Conversions API token (leave blank to keep)</label>
                    <input type="password" value={draft.conversion_api_token_new || ''} onChange={(e) => setEditing({ ...draft, conversion_api_token_new: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Test event code (optional)</label>
                    <input value={draft.test_event_code || ''} onChange={(e) => setEditing({ ...draft, test_event_code: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(e) => setEditing({ ...draft, is_active: e.target.checked ? 1 : 0 })} />
                    Active — fires on every landing page
                  </label>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2535]">
                    <button onClick={() => setEditing(null)} className="text-xs text-slate-400 hover:text-white px-3 py-1.5">Cancel</button>
                    <button onClick={() => save(draft)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-8 bg-[#141923] border border-[#1e2535] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-2 flex items-center gap-2">How to install on a landing page <InfoTag sectionKey="audiences.list" /></h2>
        <p className="text-slate-400 text-sm mb-3">Paste this one line into the <code>&lt;head&gt;</code> of any landing page or marketing site. It auto-loads every active pixel for this account.</p>
        <pre className="bg-[#0f1117] border border-[#1e2535] rounded-lg p-3 text-emerald-400 text-xs overflow-x-auto"><code>{`<script src="https://marketing.cadsuite.com/api/pixel-snippets?account_id=4" async></script>`}</code></pre>
        <p className="text-slate-500 text-xs mt-3">For conversion events, call <code className="text-indigo-400">window.cadsuiteTrack('lead_submitted', 50)</code> on form submit / button click.</p>
      </section>
    </div>
  );
}
