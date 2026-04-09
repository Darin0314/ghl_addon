import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Calendar from './pages/Calendar';
import Email from './pages/Email';
import Automation from './pages/Automation';
import Funnels from './pages/Funnels';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index             element={<Dashboard />} />
          <Route path="contacts"   element={<Contacts />} />
          <Route path="pipeline"   element={<Pipeline />} />
          <Route path="calendar"   element={<Calendar />} />
          <Route path="email"      element={<Email />} />
          <Route path="automation" element={<Automation />} />
          <Route path="funnels"    element={<Funnels />} />
          <Route path="settings"   element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
