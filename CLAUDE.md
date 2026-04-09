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
- [ ] Create GitHub repo `Darin0314/ghl_addon`
- [ ] Scaffold React 19 + Vite + Tailwind CSS (`frontend/`)
- [ ] Create PHP 8.3 API skeleton (`api/`) with `.htaccess` routing
- [ ] MariaDB database `ghl_addon` + user `ghl_user`
- [ ] Core schema: `users`, `contacts`, `pipelines`, `pipeline_stages`, `deals`
- [ ] nginx config `/etc/nginx/sites-available/ghl_addon.conf` → port 8099
- [ ] `.env` file with DB creds + base URL
- [ ] `composer.json` for PHP autoload
- [ ] README.md
**Status**: NOT STARTED

---

### Phase 2 — Dark Sidebar + Dashboard Layout
- [ ] React Router v6 navigation shell
- [ ] Dark navy sidebar: Dashboard, Contacts, Opportunities, Calendar, Email, Automation, Funnels, Settings
- [ ] Top navbar: search, notifications, user avatar
- [ ] Dashboard page: KPI cards (Total Contacts, Revenue, Open Deals, Appointments Today)
- [ ] Recent activity feed component
- [ ] Pipeline summary chart (Recharts)
- [ ] Mock data layer for dev (JSON fixtures)
- [ ] Shared context/state (React Context or Zustand)
**Status**: NOT STARTED

---

### Phase 3 — CRM Contacts Page
- [ ] MariaDB: `contacts` table (name, email, phone, source, tags, pipeline_stage_id, created_at)
- [ ] PHP API: GET/POST/PUT/DELETE `/api/contacts`
- [ ] Contacts table (searchable, filterable by tag/stage)
- [ ] Add Contact modal (name, email, phone, source, tags)
- [ ] Bulk actions: tag, delete, assign to pipeline
- [ ] Contact detail slide-in panel
- [ ] Tag filter chips at top
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
**Phase 1** — Project Setup & Foundation

## Completed
_(none yet)_
