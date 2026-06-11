import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/',            label: 'Dashboard' },
  { to: '/contacts',    label: 'Contacts' },
  { to: '/pipeline',    label: 'Opportunities' },
  { to: '/calendar',    label: 'Calendar' },
  { to: '/email',       label: 'Email' },
  { to: '/sequences',   label: 'Sequences' },
  { to: '/templates',   label: 'Templates' },
  { to: '/automation',  label: 'Automation' },
  { to: '/funnels',     label: 'Funnels' },
  { to: '/products',    label: 'Products' },
  { to: '/pricing',     label: 'Pricing' },
  { to: '/case-studies',label: 'Case Studies' },
  { to: '/voicemail',   label: 'Voicemail' },
  { to: '/content',     label: 'Content' },
  { to: '/blog',        label: 'Blog' },
  { to: '/pixels',      label: 'Pixels' },
  { to: '/reports',     label: 'Reports' },
  { to: '/settings',    label: 'Settings' },
];

export default function Sidebar({ user }) {
  return (
    <header className="border-b border-slate-800/60 backdrop-blur sticky top-0 bg-slate-950/80 z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight whitespace-nowrap">CADsuite Marketing</span>
        </div>

        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-thin">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap
                 ${isActive
                   ? 'bg-orange-500/15 text-orange-300 font-medium'
                   : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                 }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0 text-sm">
          <span className="text-slate-400 hidden md:inline">{user?.name || user?.email}</span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-xs text-white font-bold shrink-0">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
