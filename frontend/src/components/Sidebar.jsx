import { NavLink } from 'react-router-dom';

const nav = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/contacts',
    label: 'Contacts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-1a8 8 0 0116 0v1" />
      </svg>
    ),
  },
  {
    to: '/pipeline',
    label: 'Opportunities',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 6h18M3 12h12M3 18h8" strokeLinecap="round" />
        <circle cx="19" cy="17" r="3" /><path d="M19 15v2l1 1" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/email',
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8l10 7 10-7" />
      </svg>
    ),
  },
  {
    to: '/automation',
    label: 'Automation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/funnels',
    label: 'Funnels',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 4h18l-7 9v7l-4-2v-5L3 4z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/sequences',
    label: 'Sequences',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
        <circle cx="20" cy="18" r="2" />
      </svg>
    ),
  },
  {
    to: '/templates',
    label: 'Templates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 14h6M9 17h4" />
      </svg>
    ),
  },
  {
    to: '/pricing',
    label: 'Pricing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M20 7l-9 5-9-5 9-5 9 5zM2 7v10l9 5 9-5V7" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/case-studies',
    label: 'Case Studies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/voicemail',
    label: 'Voicemail',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="6" cy="14" r="4" /><circle cx="18" cy="14" r="4" /><path d="M6 14h12" />
      </svg>
    ),
  },
  {
    to: '/content',
    label: 'Content',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/blog',
    label: 'Blog',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-16 lg:w-56 min-h-screen bg-[#0d1117] border-r border-[#1e2535] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e2535]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="hidden lg:block text-white font-semibold text-sm tracking-wide">GHL Add-On</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group
               ${isActive
                 ? 'bg-indigo-600 text-white'
                 : 'text-slate-400 hover:bg-[#1e2535] hover:text-white'
               }`
            }
          >
            {icon}
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user stub */}
      <div className="p-3 border-t border-[#1e2535]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1e2535] cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-medium shrink-0">D</div>
          <div className="hidden lg:block min-w-0">
            <p className="text-white text-xs font-medium truncate">Darin Robin</p>
            <p className="text-slate-500 text-xs truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
