# GHL Add-On — GoHighLevel-Style CRM

## Stack
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: PHP 8.3 (REST API)
- **Database**: MariaDB 10.11
- **Web Server**: nginx (port 8099)
- **GitHub**: Darin0314/ghl_addon

## Server Specs
- WSL2 Linux, PHP 8.3, nginx, php-fpm
- MariaDB 10.11 local
- Port: 8099 (frontend) → PHP API
- User: smokeshow

---

## Phases

### Phase 1 — Project Setup & Foundation
- [x] Create GitHub repo `Darin0314/ghl_addon`
- [x] Scaffold React 19 + Vite + Tailwind CSS (`frontend/`)
- [x] Create PHP 8.3 API skeleton (`api/`) with auto-dispatch routing
- [x] MariaDB database `ghl_addon` + user `ghl_user`
- [x] Core schema: `users`, `contacts`, `pipelines`, `pipeline_stages`, `deals` (with seed data)
- [x] nginx config `/etc/nginx/sites-available/ghl_addon.conf` → **port 8101**
- [x] `.env` file with DB creds + base URL
- [x] `composer.json` for PHP autoload
- [x] API health check verified: `http://localhost:8101/api/health`
**Status**: COMPLETE

---

### Phase 2 — Dark Sidebar + Dashboard Layout
- [x] React Router v6 navigation shell
- [x] Dark navy sidebar: Dashboard, Contacts, Opportunities, Calendar, Email, Automation, Funnels, Settings
- [x] Top navbar: search, notifications, user avatar
- [x] Dashboard page: KPI cards (Total Contacts, Revenue, Open Deals, Appointments Today)
- [x] Recent activity feed component
- [x] Pipeline summary chart (Recharts bar chart with stage legend)
- [x] Mock data layer (src/data/mockData.js)
- [x] Zustand store (src/store/useAppStore.js)
- [x] Placeholder pages for all 7 remaining routes
**Status**: COMPLETE

---

### Phase 3 — CRM Contacts Page
- [x] MariaDB: `contacts` table used (seeded from Phase 1 schema)
- [x] PHP API: GET/POST/PUT/DELETE `/api/contacts` + bulk actions (tag/stage/delete)
- [x] `pipeline_stages` API endpoint
- [x] Contacts table (searchable, filterable by tag + stage)
- [x] Add Contact modal (name, email, phone, source, tags, stage, notes)
- [x] Bulk actions bar: tag, assign stage, delete selected
- [x] Contact detail slide-in panel with quick Text + Email actions
- [x] Tag filter chips at top
**Status**: COMPLETE

### Phase 3.5 — SMS Integration (RingCentral + Twilio)
- [ ] MariaDB: `sms_settings` table (provider, account_sid, auth_token, from_number, per-account)
- [ ] PHP API: `/api/sms/send` endpoint (provider-agnostic)
- [ ] RingCentral adapter (OAuth2 + SMS API)
- [ ] Twilio adapter (REST API)
- [ ] Settings tab: SMS provider config (choose RingCentral or Twilio, enter creds)
- [ ] Contact detail panel: "Send SMS" button opens compose modal
- [ ] SMS history log per contact (`sms_log` table)
- [ ] Automation actions: "Send SMS" node uses this integration
**Status**: NOT STARTED

---

### Phase 4 — Kanban Pipeline Board (Opportunities)
- [ ] MariaDB: `pipelines`, `pipeline_stages`, `deals` tables
- [ ] PHP API: CRUD for pipelines, stages, deals
- [ ] Drag-and-drop Kanban board (react-beautiful-dnd or @dnd-kit)
- [ ] Columns: New Lead, Contacted, Qualified, Proposal Sent, Won, Lost
- [ ] Deal cards: contact name, deal value, stage age
- [ ] Add deal button per column
- [ ] Column totals (count + dollar amount)
- [ ] Color-coded cards by age/urgency
**Status**: NOT STARTED

---

### Phase 5 — Email Campaign Builder
- [ ] MariaDB: `campaigns`, `campaign_recipients`, `email_blocks` tables
- [ ] PHP API: CRUD for campaigns
- [ ] Campaign list view (status: Draft, Scheduled, Sent) + open/click rates
- [ ] Create campaign flow: Name → Select Contacts → Email Editor → Schedule
- [ ] Block-based email editor: text, image, button, divider blocks
- [ ] Desktop/mobile preview toggle
- [ ] Send test email button (via SMTP from reference_smtp_ringcentral.md)
**Status**: NOT STARTED

---

### Phase 6 — Automation Workflow Builder
- [ ] MariaDB: `automations`, `automation_nodes`, `automation_edges` tables
- [ ] PHP API: CRUD for automations
- [ ] Visual canvas with drag-and-drop trigger + action nodes (React Flow)
- [ ] Triggers: Form Submit, Tag Added, Appointment Booked, Email Opened
- [ ] Actions: Send Email, Send SMS, Add Tag, Wait X Days, Move Pipeline Stage
- [ ] Node config panel on click
- [ ] Save / Activate toggle
**Status**: NOT STARTED

---

### Phase 7 — Calendar & Booking
- [ ] MariaDB: `appointments`, `availability_blocks` tables
- [ ] PHP API: CRUD for appointments + availability
- [ ] Monthly/weekly calendar view with appointment blocks
- [ ] Create appointment modal: contact, service type, date/time, notes
- [ ] Availability settings: working hours, blocked dates
- [ ] Public booking page preview (client-facing view)
- [ ] Upcoming appointments list sidebar
**Status**: NOT STARTED

---

### Phase 8 — Funnel / Page Builder
- [ ] MariaDB: `funnels`, `funnel_pages`, `funnel_elements` tables
- [ ] PHP API: CRUD for funnels and pages
- [ ] Left panel: element blocks (Headline, Text, Image, Button, Form, Video, Countdown)
- [ ] Center canvas: drag-and-drop page preview
- [ ] Right panel: element styling controls (font, color, spacing, border)
- [ ] Top bar: page name, desktop/mobile preview, save, publish
- [ ] Pre-built section templates library
**Status**: NOT STARTED

---

### Phase 9 — Settings & White Label
- [ ] MariaDB: `agency_settings`, `users`, `integrations` tables
- [ ] PHP API: settings CRUD, user management, integration toggles
- [ ] Settings tabs: General, White Label, Users, Integrations, Billing
- [ ] White label: upload logo, brand colors, custom domain
- [ ] User management table: name, email, role, status, invite
- [ ] Integration toggles: Stripe, Twilio, Mailgun, Google, Facebook
**Status**: NOT STARTED

---

### Phase 10 — Full Integration & Polish
- [ ] Wire all React Router routes
- [ ] Shared contacts/pipeline data across modules
- [ ] Auth: login/logout, JWT or session tokens
- [ ] Consistent design system finalized
- [ ] API error handling + loading states throughout
- [ ] End-to-end smoke test all modules
**Status**: NOT STARTED

---

### Phase 11 — Mobile App (Expo React Native)
- [ ] Expo project scaffold
- [ ] Auth screen + JWT login
- [ ] Dashboard with KPI cards
- [ ] Contacts list + detail view
- [ ] Pipeline board (simplified)
- [ ] Calendar + appointments
- [ ] Push notifications
**Status**: NOT STARTED

---

## Next Up
**Phase 3.5** — SMS Integration (RingCentral + Twilio)

## Completed
- Phase 1 — Project Setup & Foundation (port 8101, DB ghl_addon, API health verified)
- Phase 2 — Dark Sidebar + Dashboard Layout (React Router, KPI cards, Recharts, Zustand, mock data)
- Phase 3 — CRM Contacts (full table, add modal, bulk actions, slide-in detail panel, tag filters)
