import { useEffect, useState } from 'react';

export default function Calendar() {
  const [eventTypes, setEventTypes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/event_types', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/appointments', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([et, a]) => {
      setEventTypes(et.data || []);
      setAppointments(a.data || []);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const saveEventType = async () => {
    const url = editing.id ? `/api/event_types/${editing.id}` : '/api/event_types';
    const method = editing.id ? 'PUT' : 'POST';
    await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    setEditing(null); load();
  };

  const filtered = tab === 'upcoming'
    ? appointments.filter((a) => a.status === 'booked' && new Date(a.starts_at) >= new Date(Date.now() - 12*3600e3))
    : appointments;

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">Calendly-style booking pages for CADsuite demos.</p>
        </div>
        <button onClick={() => setEditing({ name: '', slug: '', duration_minutes: 30, location_type: 'zoom', is_active: 1, color: '#6366f1' })} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium">+ New Event Type</button>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider text-slate-500">Event types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map((et) => (
            <article key={et.id} className="bg-[#141923] border border-[#1e2535] rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: et.color }} />
                  <h3 className="text-white font-semibold">{et.name}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${et.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                  {et.is_active ? 'Live' : 'Off'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-3">{et.duration_minutes} min · {et.location_type} · {et.upcoming_count} upcoming</p>
              <p className="text-slate-500 text-xs mb-3">{et.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => setEditing(et)} className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg">Edit</button>
                <a href={`/book/${et.slug}`} target="_blank" rel="noreferrer" className="text-xs bg-indigo-600/20 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-600/30">Public link →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bookings</h2>
          <div className="flex gap-1 ml-auto">
            <button onClick={() => setTab('upcoming')} className={`text-xs px-3 py-1.5 rounded-lg ${tab === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-slate-700/30 text-slate-400'}`}>Upcoming</button>
            <button onClick={() => setTab('all')} className={`text-xs px-3 py-1.5 rounded-lg ${tab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-700/30 text-slate-400'}`}>All</button>
          </div>
        </div>
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl overflow-hidden">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          {!loading && filtered.length === 0 && <div className="p-12 text-center text-slate-500 text-sm">No bookings.</div>}
          <table className="w-full text-sm">
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-[#1e2535]/40 text-slate-300 hover:bg-[#1e2535]/50">
                  <td className="px-4 py-3">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: a.color || '#6366f1' }} />
                    {new Date(a.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{a.event_type_name}</td>
                  <td className="px-4 py-3">{a.invitee_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.invitee_email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${a.status === 'booked' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-lg mb-4">{editing.id ? 'Edit Event Type' : 'New Event Type'}</h2>
            <div className="space-y-3">
              {['name','slug','description'].map((f) => (
                <div key={f}>
                  <label className="block text-slate-400 text-xs mb-1">{f}</label>
                  <input value={editing[f] ?? ''} onChange={(e) => setEditing({ ...editing, [f]: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Duration (min)</label>
                  <input type="number" value={editing.duration_minutes ?? 30} onChange={(e) => setEditing({ ...editing, duration_minutes: parseInt(e.target.value) })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Location</label>
                  <select value={editing.location_type ?? 'zoom'} onChange={(e) => setEditing({ ...editing, location_type: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2">
                    {['zoom','google_meet','phone','in_person','custom'].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(editing.is_active)} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} />
                Active — accepts bookings
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5 border-t border-[#1e2535] pt-4">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={saveEventType} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
