import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';

export default function Navbar({ title = 'Dashboard', user }) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const initials = (user?.name || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-[#1e2535] shrink-0">
      {/* Page title */}
      <h1 className="text-white font-semibold text-lg">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#1e2535] text-sm text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-[#2a3347]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-[#1e2535] hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs text-white font-semibold"
            title={user?.name}
          >
            {initials}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-[#141923] border border-[#1e2535] rounded-lg shadow-xl z-40 p-2 text-sm">
                <div className="px-2 py-1.5 border-b border-[#1e2535] mb-1">
                  <p className="text-white font-medium truncate">{user?.name}</p>
                  <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                  {user?.role && <p className="text-indigo-400 text-xs mt-0.5 capitalize">{user.role}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-1.5 text-slate-300 hover:bg-[#1e2535] hover:text-white rounded"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
