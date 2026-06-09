import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import RingCentralDialer from '../components/RingCentralDialer';
import { useCurrentUser } from '../lib/auth';

const titles = {
  '/':           'Dashboard',
  '/contacts':   'Contacts',
  '/pipeline':   'Opportunities',
  '/calendar':   'Calendar',
  '/email':      'Email Marketing',
  '/automation': 'Automation',
  '/funnels':    'Funnels',
  '/settings':   'Settings',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'GHL Add-On';
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1117]">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar title={title} user={user} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
      <RingCentralDialer />
    </div>
  );
}
