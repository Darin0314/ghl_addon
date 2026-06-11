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

---

## QUEUED — CADsuite Account: Full Software-Sales Funnels (2026-06-11)

User asked to set up the CADsuite.com account (account_id=4 in `cadsuite_marketing` prod) with a full marketing playbook. Goal: every funnel + channel that's been proven to sell B2B SaaS to contractors/adjusters/PAs/HVAC.

**Account already provisioned**: `CADsuite.com` (id=4), admins `orders@cadsuite.com` + `manojit.saha1987@gmail.com` (pw `Welcome2026!`, prompt reset).

### Scope (to build before "ready" sign-off)
1. **ICPs + segmentation** — 5 buyer personas (GC/restoration, public adjuster, independent appraiser, HVAC owner, insurance carrier ops). Tag schema in `contacts` per persona.
2. **Lead-magnet funnels** (one per product, ~13 products):
   - Top-of-funnel: free tool / checklist / calculator / cheat-sheet (e.g. "Free Hail Swath Lookup" → StormWatch, "Free Estimate Bundled-Item Audit" → Estimate Evaluator, "Free Permit Lookup" → Contractor permit module).
   - Landing page → email capture → 5-email nurture → trial CTA → demo booking.
3. **Cold outreach sequences** — 14-day multi-touch (Day 1/3/5/8/12 email + Day 4/9 LinkedIn + Day 7 phone) per ICP. Templates in `marketing.email_templates`.
4. **Demo-booked → trial → paid conversion**:
   - Booked-but-no-show recovery (3 emails over 5 days).
   - Trial Day 1/3/7/13 onboarding emails (per-product, value-loaded).
   - Trial Day 12 "convert" offer with founder Loom + Authorize.net link.
5. **Webinar funnel** — monthly "How [contractors|adjusters] save 8 hrs/week with CADsuite" → registration → live → replay → trial.
6. **Case-study funnel** — 3 written + 3 video, gated on landing page, used as social proof in cold sequences.
7. **Retargeting** — Meta/LinkedIn/Google pixel on every funnel page; 30/60/90-day audiences.
8. **Partner / referral program** — 20% recurring for 12 months on referred accounts; landing page + tracking link generator inside Marketing CRM.
9. **Review/UGC funnel** — post-conversion Day 30 ask for G2/Capterra review (auto-send via `marketing.email_automations`).
10. **Self-serve pricing page** — every product gets a transparent pricing block with "Start 14-day trial" CTA (Authorize.net CIM, never Stripe per `feedback_authorize_not_stripe`).
11. **Content engine** — weekly blog cadence map (3 SEO posts + 1 thought-leadership per week) targeting commercial-intent keywords: "best supplement software", "xactimate alternative for…", "roof estimating software".
12. **Email automation builder** — extend existing Marketing CRM pipelines to run these flows. Add 4 new pipeline templates: Lead → MQL → SQL → Trial → Paid.
13. **Reporting dashboard** — funnel-level CAC, conversion %, MRR per product, churn. Lives on CADsuite admin portal Reports tab.

### Build order (each is its own phase, /clear-able)
- **Phase M-1** — Persona + tag schema + import existing CADsuite contact list as account_id=4
- **Phase M-2** — 13 product landing pages + lead magnets (static, deployable to marketing.cadsuite.com)
- **Phase M-3** — Email sequences (Phases 1–4 above) — 80 emails minimum, all in DB
- **Phase M-4** — Webinar + case-study funnels
- **Phase M-5** — Pixel + retargeting wiring
- **Phase M-6** — Partner program + tracking link generator
- **Phase M-7** — Review/UGC + Day-30 auto-send
- **Phase M-8** — Pricing pages + Authorize.net checkout for each product
- **Phase M-9** — Content engine kickoff (calendar + first 8 SEO posts)
- **Phase M-10** — Funnel reporting dashboard

**Status**: in progress.

### Phase M-1 — DONE ✅ 2026-06-11

- `personas` table created in `cadsuite_marketing` with 5 rows (GC/Restoration, Public Adjuster, Independent Appraiser, HVAC Owner, Insurance Carrier Ops).
- `contacts` extended with nullable `account_id` + `persona_id` columns (+ indexes).
- 19 CADsuite-customer contacts imported under `account_id=4`:
  - 10 from Contractor CRM (`cadsuite_contractor.accounts`, persona 1)
  - 1 from Supplementer (`cadsuite_supplements_live.accounts`, persona 1)
  - 2 from Appraisers CRM (`cadsuite_appraisers.accounts`, persona 3)
  - 2 from Loss Appraisers legacy (`cadsuite_lossappr.accounts`, persona 3)
  - 4 from Canvasser (`cadsuite_canvasser.accounts`, persona 1)
- Migration saved at `database/m1_personas_and_account_scope.sql`.

### Discovered gap → recommended Phase M-1.5 (NOT YET BUILT)

**Multi-tenant scoping**: `contacts`, `deals`, `pipelines` have no `account_id` enforcement at the API layer. All accounts share one global pool today. M-1 added the column but did NOT wire query-level filtering. Before M-2 / M-3 ship, the API + UI need to filter by `users.account_id` so the CADsuite admins (`orders@cadsuite.com`, `manojit.saha1987@gmail.com`) only see their own data.

### Next Up
- **M-1.5** — wire account-scoped queries in `api/controllers/contacts.php`, `deals.php`, `pipelines.php` + middleware to derive `account_id` from `users.account_id`.
- **M-3** — 80+ email sequences (4 trial-conversion + 5 cold-outreach by persona) seeded into `email_templates`.
