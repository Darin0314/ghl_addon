import { useEffect, useRef, useState } from 'react';

// Inline SVGs — this project doesn't bundle lucide-react.
const PhoneIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MinimizeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const MaximizeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

/**
 * RingCentral Embeddable widget. Loads the official adapter script (the same
 * one that powers RC's Salesforce / HubSpot / Pipedrive integrations) and
 * renders a floating dial button bottom-right. Click expands the panel.
 *
 * Click-to-call from anywhere in the app:
 *   document.dispatchEvent(new CustomEvent('rc-adapter-new-call', {
 *     detail: { phoneNumber: '7203039999', toCall: true }
 *   }))
 *
 * Incoming/outgoing call lifecycle events (used in Phase 3 to log calls):
 *   window.addEventListener('message', (e) => {
 *     if (e.data?.type === 'rc-call-end-notify') { … }
 *   })
 */
export default function RingCentralDialer() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const scriptLoadedRef = useRef(false);

  // Inject RC Embeddable adapter once. The adapter creates its own iframe at
  // bottom-right; we only control whether to mount/unmount the script.
  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const s = document.createElement('script');
    s.src = 'https://apps.ringcentral.com/integration/ringcentral-embeddable/adapter.js';
    s.async = true;
    document.body.appendChild(s);
    return () => {
      // Don't tear down — the user might re-open and we want the auth/state
      // preserved across navigations. The widget itself stays mounted.
    };
  }, []);

  // Toggle widget visibility. RC's adapter exposes `RCAdapter` on the global
  // scope with .renderAdapter(visible) — falls back to postMessage if not
  // ready yet.
  useEffect(() => {
    const targetVisible = open && !minimised;
    if (window.RCAdapter && typeof window.RCAdapter.setMinimized === 'function') {
      try { window.RCAdapter.setMinimized(!targetVisible); } catch {}
    } else {
      try {
        document
          .querySelector('#rc-widget-adapter-frame, iframe[name="rc-widget-adapter-frame"]')
          ?.contentWindow?.postMessage({ type: 'rc-adapter-syncMinimized', minimized: !targetVisible }, '*');
      } catch {}
    }
  }, [open, minimised]);

  // Click-to-call: phone numbers anywhere in the CRM can fire a custom event
  // (Phase 2 wires this up on contact cards). We catch it here and forward
  // to the RC adapter using its documented event API.
  useEffect(() => {
    const onCall = (e) => {
      const phoneNumber = e?.detail?.phoneNumber;
      if (!phoneNumber) return;
      setOpen(true);
      setMinimised(false);
      // RC adapter listens for postMessage events on its iframe
      const frame = document.querySelector('iframe[name="rc-widget-adapter-frame"]');
      try {
        frame?.contentWindow?.postMessage(
          { type: 'rc-adapter-new-call', phoneNumber, toCall: true },
          '*',
        );
      } catch {}
    };
    document.addEventListener('rc-adapter-new-call', onCall);
    return () => document.removeEventListener('rc-adapter-new-call', onCall);
  }, []);

  return (
    <>
      {/* Floating dial button — always present */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setMinimised(false); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        title={open ? 'Hide dialer' : 'Open RingCentral dialer'}
        aria-label="RingCentral dialer"
      >
        <PhoneIcon className="w-6 h-6" />
      </button>

      {/* Hide/minimize header so user can collapse the iframe without losing
          their RC session. The actual phone UI lives inside RC's own iframe
          which the adapter script injects bottom-right of the body. */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900 text-white rounded-lg shadow-2xl px-3 py-1.5 flex items-center gap-2 text-xs border border-slate-700">
          <span className="font-medium">RingCentral</span>
          <button
            type="button"
            onClick={() => setMinimised(m => !m)}
            className="text-slate-400 hover:text-white p-1"
            title={minimised ? 'Show' : 'Minimize'}
          >
            {minimised ? <MaximizeIcon className="w-3.5 h-3.5" /> : <MinimizeIcon className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1"
            title="Hide"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
