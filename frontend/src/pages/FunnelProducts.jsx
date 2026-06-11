import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function FunnelProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/funnel_products', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { setProducts(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  const openEdit = (p) => { setEditing(p.id); setDraft({ ...p }); };
  const openCreate = () => { setEditing('new'); setDraft({ slug: '', name: '', tagline: '', monthly_price: '', yearly_price: '', is_active: 1, sort_order: 0 }); };
  const close = () => { setEditing(null); setDraft(null); };
  const save = async () => {
    if (editing === 'new') {
      await fetch('/api/funnel_products', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    } else {
      await fetch(`/api/funnel_products/${editing}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    }
    close(); load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Products <InfoTag sectionKey="dashboard.kpis" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} SKUs in your CADsuite catalog.</p>
        </div>
        <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Product</button>
      </header>

      {loading && <div className="text-center text-slate-500 py-12">Loading…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <article key={p.id} className="bg-[#141923] border border-[#1e2535] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold">{p.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                {p.is_active ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-3">{p.tagline}</p>
            <p className="text-slate-300 text-sm">
              {p.monthly_price && <>${Number(p.monthly_price).toFixed(2)}/mo</>}
              {p.monthly_price && p.yearly_price && ' · '}
              {p.yearly_price && <>${Number(p.yearly_price).toFixed(2)}/yr</>}
            </p>
            <div className="flex justify-end mt-4">
              <button onClick={() => openEdit(p)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit →</button>
            </div>
          </article>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={close}>
          <div className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-lg mb-4">{editing === 'new' ? 'New Product' : 'Edit Product'}</h2>
            <div className="space-y-3">
              {['slug','name','tagline'].map((f) => (
                <div key={f}>
                  <label className="block text-slate-400 text-xs mb-1">{f}</label>
                  <input value={draft[f] ?? ''} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Monthly $</label>
                  <input type="number" value={draft.monthly_price ?? ''} onChange={(e) => setDraft({ ...draft, monthly_price: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Yearly $</label>
                  <input type="number" value={draft.yearly_price ?? ''} onChange={(e) => setDraft({ ...draft, yearly_price: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked ? 1 : 0 })} />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5 border-t border-[#1e2535] pt-4">
              <button onClick={close} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
