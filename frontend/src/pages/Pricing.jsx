import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlans = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (productFilter) params.set('product_id', productFilter);
    fetch(`/api/pricing_plans?${params.toString()}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { setPlans(j.data || []); setLoading(false); });
  };

  useEffect(fetchPlans, [productFilter]);

  useEffect(() => {
    fetch('/api/funnel_products', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setProducts(j.data || []))
      .catch(() => {});
  }, []);

  // Group plans by product for display
  const byProduct = plans.reduce((acc, p) => {
    const key = p.product_id || 0;
    (acc[key] = acc[key] || { name: p.product_name || 'Unassigned', items: [] }).items.push(p);
    return acc;
  }, {});

  const togglePlan = async (plan, field, value) => {
    await fetch(`/api/pricing_plans/${plan.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value ? 1 : 0 }),
    });
    fetchPlans();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Pricing Plans
            <InfoTag sectionKey="pricing.list" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">{plans.length} plans across {Object.keys(byProduct).length} products.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-[#141923] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2"
          >
            <option value="">All products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">
            + New Plan
          </button>
        </div>
      </header>

      {loading && <div className="text-center text-slate-500 py-12">Loading…</div>}

      <div className="space-y-8">
        {Object.entries(byProduct).map(([productId, group]) => (
          <section key={productId}>
            <h2 className="text-white font-semibold text-lg mb-3">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((plan) => (
                <article
                  key={plan.id}
                  className={`bg-[#141923] border rounded-xl p-5 relative ${plan.is_featured ? 'border-indigo-500' : 'border-[#1e2535]'}`}
                >
                  {plan.is_featured ? (
                    <span className="absolute -top-2 left-4 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded">Featured</span>
                  ) : null}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">{plan.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                      {plan.is_active ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  {plan.description && <p className="text-slate-400 text-xs mb-3">{plan.description}</p>}
                  <div className="mb-3">
                    {plan.monthly_price && (
                      <p className="text-3xl font-bold text-white">
                        ${Number(plan.monthly_price).toFixed(2)}
                        <span className="text-sm text-slate-500 font-normal">/mo</span>
                      </p>
                    )}
                    {plan.yearly_price && !plan.monthly_price && (
                      <p className="text-3xl font-bold text-white">
                        ${Number(plan.yearly_price).toFixed(2)}
                        <span className="text-sm text-slate-500 font-normal">/yr</span>
                      </p>
                    )}
                  </div>
                  {plan.trial_days > 0 && (
                    <p className="text-emerald-400 text-xs mb-3">{plan.trial_days}-day free trial</p>
                  )}
                  <ul className="space-y-1 mb-4 text-sm text-slate-300">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-emerald-400 mt-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between text-xs border-t border-[#1e2535] pt-3">
                    <label className="flex items-center gap-2 text-slate-400">
                      <input
                        type="checkbox"
                        checked={Boolean(plan.is_active)}
                        onChange={(e) => togglePlan(plan, 'is_active', e.target.checked)}
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-slate-400">
                      <input
                        type="checkbox"
                        checked={Boolean(plan.is_featured)}
                        onChange={(e) => togglePlan(plan, 'is_featured', e.target.checked)}
                      />
                      Featured
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
