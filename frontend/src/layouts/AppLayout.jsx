import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

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

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
