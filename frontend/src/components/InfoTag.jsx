import { useEffect, useRef, useState } from 'react';

/**
 * Dismissable (i) help bubble. Reads /api/section_help/{key}, shows an
 * info icon next to a section heading; clicking opens a popover with the
 * content. Once the user clicks "Got it", we POST a dismissal and the
 * icon hides on future visits for that user.
 *
 * Usage:
 *   <h2 className="flex items-center gap-2">
 *     Sequences <InfoTag sectionKey="sequences.list" />
 *   </h2>
 */
export default function InfoTag({ sectionKey, className = '' }) {
  const [help, setHelp] = useState(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/section_help/${encodeURIComponent(sectionKey)}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.data) return;
        setHelp(j.data);
        setDismissed(Boolean(j.data.dismissed));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sectionKey]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleDismiss = async () => {
    try {
      await fetch('/api/section_help', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: sectionKey, version: help?.version ?? 1 }),
      });
      setDismissed(true);
      setOpen(false);
    } catch {
      setOpen(false);
    }
  };

  if (!help) return null;
  if (dismissed) return null;

  return (
    <span className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label={`Help: ${help.title}`}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-500 text-slate-400 hover:text-indigo-400 hover:border-indigo-400 transition-colors text-xs leading-none"
      >
        i
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-6 top-0 z-50 w-80 bg-[#141923] border border-[#1e2535] rounded-xl shadow-2xl p-4 text-sm text-slate-200"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-white">{help.title}</h4>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-white text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
            {help.body_md}
          </div>
          {help.cta_text && help.cta_url && (
            <a
              href={help.cta_url}
              className="inline-block mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              {help.cta_text} →
            </a>
          )}
          <div className="flex justify-end mt-4 border-t border-[#1e2535] pt-3">
            <button
              onClick={handleDismiss}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg"
            >
              Got it, hide
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
