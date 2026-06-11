import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RingCentralDialer from '../components/RingCentralDialer';
import { useCurrentUser } from '../lib/auth';

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  return (
    <div className="flex min-h-screen text-slate-200">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet context={{ user }} />
      </main>
      <RingCentralDialer />
    </div>
  );
}
