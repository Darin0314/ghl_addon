import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Calendar from './pages/Calendar';
import Email from './pages/Email';
import Automation from './pages/Automation';
import Funnels from './pages/Funnels';
import Sequences from './pages/Sequences';
import Templates from './pages/Templates';
import Pricing from './pages/Pricing';
import FunnelProducts from './pages/FunnelProducts';
import Reports from './pages/Reports';
import CaseStudies from './pages/CaseStudies';
import ContentCalendar from './pages/ContentCalendar';
import Blog from './pages/Blog';
import Voicemail from './pages/Voicemail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route index             element={<Dashboard />} />
          <Route path="contacts"   element={<Contacts />} />
          <Route path="pipeline"   element={<Pipeline />} />
          <Route path="calendar"   element={<Calendar />} />
          <Route path="email"      element={<Email />} />
          <Route path="automation" element={<Automation />} />
          <Route path="funnels"    element={<Funnels />} />
          <Route path="sequences"  element={<Sequences />} />
          <Route path="templates"  element={<Templates />} />
          <Route path="pricing"    element={<Pricing />} />
          <Route path="products"   element={<FunnelProducts />} />
          <Route path="reports"    element={<Reports />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="content"    element={<ContentCalendar />} />
          <Route path="blog"       element={<Blog />} />
          <Route path="voicemail"  element={<Voicemail />} />
          <Route path="settings"   element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
