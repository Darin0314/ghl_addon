import { NavLink } from 'react-router-dom';

const sections = [
  {
    label: 'Workspace',
    items: [
      { to: '/',          label: 'Dashboard',     icon: 'home' },
      { to: '/contacts',  label: 'Contacts',      icon: 'users' },
      { to: '/pipeline',  label: 'Opportunities', icon: 'pipeline' },
      { to: '/calendar',  label: 'Calendar',      icon: 'calendar' },
    ],
  },
  {
    label: 'Outbound',
    items: [
      { to: '/email',      label: 'Email',      icon: 'mail' },
      { to: '/sequences',  label: 'Sequences',  icon: 'sequence' },
      { to: '/templates',  label: 'Templates',  icon: 'doc' },
      { to: '/voicemail',  label: 'Voicemail',  icon: 'phone' },
      { to: '/automation', label: 'Automation', icon: 'zap' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { to: '/funnels',      label: 'Funnels',     icon: 'funnel' },
      { to: '/products',     label: 'Products',    icon: 'box' },
      { to: '/pricing',      label: 'Pricing',     icon: 'dollar' },
      { to: '/case-studies', label: 'Case Studies',icon: 'book' },
      { to: '/content',      label: 'Content',     icon: 'calendar2' },
      { to: '/blog',         label: 'Blog',        icon: 'edit' },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/pixels',  label: 'Pixels',  icon: 'target' },
      { to: '/reports', label: 'Reports', icon: 'chart' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

function Icon({ name }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.25, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':     return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>;
    case 'users':    return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><circle cx="12" cy="7" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" /></svg>;
    case 'pipeline': return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M3 6h18M3 12h12M3 18h8" /><circle cx="19" cy="17" r="3" /></svg>;
    case 'calendar': return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case 'mail':     return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 7 10-7" /></svg>;
    case 'sequence': return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M4 6h16M4 12h16M4 18h10" /><circle cx="20" cy="18" r="2" /></svg>;
    case 'doc':      return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 14h6M9 17h4" /></svg>;
    case 'phone':    return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.94.34 1.85.65 2.73a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.35-1.35a2 2 0 012.11-.45c.88.31 1.79.52 2.73.65A2 2 0 0122 16.92z" /></svg>;
    case 'zap':      return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
    case 'funnel':   return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M3 4h18l-7 9v7l-4-2v-5L3 4z" /></svg>;
    case 'box':      return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M20 7l-9 5-9-5 9-5 9 5zM2 7v10l9 5 9-5V7" /></svg>;
    case 'dollar':   return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" /></svg>;
    case 'book':     return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>;
    case 'calendar2':return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case 'edit':     return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>;
    case 'target':   return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><circle cx="12" cy="12" r="4" /><path d="M21 12c0 5-9 9-9 9s-9-4-9-9 9-9 9-9 9 4 9 9z" /></svg>;
    case 'chart':    return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></svg>;
    case 'settings': return <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" {...stroke}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    default: return null;
  }
}

export default function Sidebar({ user }) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-slate-950/60 backdrop-blur border-r border-slate-800/50 shrink-0">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-800/50">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-white text-base font-bold leading-tight tracking-tight">CADsuite</div>
          <div className="text-slate-400 text-xs leading-tight font-medium">Marketing</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="px-4 mb-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold">{section.label}</div>
            <ul className="space-y-0.5 px-2">
              {section.items.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-[15px] font-semibold transition-colors
                       ${isActive
                         ? 'bg-orange-500/15 text-orange-300'
                         : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                       }`
                    }
                  >
                    <Icon name={icon} />
                    <span className="truncate">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/50 px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-sm text-white font-bold shrink-0">
          {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</div>
          <div className="text-slate-500 text-xs truncate">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
