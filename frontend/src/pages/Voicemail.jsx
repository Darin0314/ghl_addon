import { useEffect, useState } from 'react';
import InfoTag from '../components/InfoTag';

export default function Voicemail() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/voicemail_recordings', { credentials: 'include' }).then((r) => r.json())
      .then((j) => { setRecordings(j.data || []); setLoading(false); });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/voicemail_recordings/${selected}`, { credentials: 'include' })
      .then((r) => r.json()).then((j) => setDetail(j.data));
  }, [selected]);

  const save = async () => {
    await fetch(`/api/voicemail_recordings/${detail.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detail.name, twilio_recording_sid: detail.twilio_recording_sid,
        audio_url: detail.audio_url, transcript: detail.transcript, is_active: detail.is_active,
      }),
    });
    load();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Voicemail Drops <InfoTag sectionKey="voicemail.recordings" /></h1>
          <p className="text-slate-400 text-sm mt-1">{recordings.length} recordings ready for sequences. <InfoTag sectionKey="voicemail.compliance" className="ml-1" /></p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">+ New Recording</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {loading && <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>}
          <ul className="divide-y divide-[#1e2535]">
            {recordings.map((r) => (
              <li key={r.id}>
                <button onClick={() => setSelected(r.id)} className={`w-full text-left px-4 py-3 hover:bg-[#1e2535] ${selected === r.id ? 'bg-[#1e2535]' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.name}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{r.drops_count} drops · {r.duration_seconds ? `${r.duration_seconds}s` : 'no audio yet'}</p>
                    </div>
                    <span className={`shrink-0 w-2 h-2 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141923] border border-[#1e2535] rounded-xl">
          {!detail && <div className="p-12 text-center text-slate-500 text-sm">Select a recording.</div>}
          {detail && (
            <div className="p-6 space-y-4">
              <input value={detail.name || ''} onChange={(e) => setDetail({ ...detail, name: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-lg font-semibold rounded-lg px-3 py-2" />
              <div>
                <label className="block text-slate-400 text-xs mb-1">Audio URL (publicly fetchable mp3/wav)</label>
                <input value={detail.audio_url || ''} onChange={(e) => setDetail({ ...detail, audio_url: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
                {detail.audio_url && <audio controls src={detail.audio_url} className="mt-2 w-full" />}
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Twilio Recording SID (optional)</label>
                <input value={detail.twilio_recording_sid || ''} onChange={(e) => setDetail({ ...detail, twilio_recording_sid: e.target.value })} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Transcript (used for AI-tuning + accessibility)</label>
                <textarea value={detail.transcript || ''} onChange={(e) => setDetail({ ...detail, transcript: e.target.value })} rows={6} className="w-full bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg px-3 py-2" />
              </div>
              <div className="flex items-center justify-between border-t border-[#1e2535] pt-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={Boolean(detail.is_active)} onChange={(e) => setDetail({ ...detail, is_active: e.target.checked ? 1 : 0 })} />
                  Active
                </label>
                <button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
