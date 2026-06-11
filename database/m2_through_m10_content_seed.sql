-- Phase M-2 through M-10 — CADsuite content seed (account_id=4)
-- 2026-06-11

USE cadsuite_marketing;

-- ============================================================================
-- M-2: 13 funnel_products + landing_pages + lead_magnets
-- ============================================================================

INSERT INTO funnel_products (account_id, slug, name, tagline, primary_persona_id, monthly_price, yearly_price, sort_order) VALUES
(4, 'contractor', 'Contractor CRM', 'Run your restoration company without sticky-notes. Jobs, supplements, scheduling, billing.', 1, 99.00, 990.00, 10),
(4, 'supplementer', 'Supplementer', 'Build, send, and track every supplement in one place. Win more dollars, in less time.', 1, 79.00, 790.00, 20),
(4, 'appraisers', 'Appraisers CRM', 'The CRM independent appraisers actually want to log into. Assignments, exhibits, invoices.', 3, 89.00, 890.00, 30),
(4, 'stormwatch', 'StormWatch', 'Hail + wind alerts the day a storm hits. Door-knock your service area before competitors hear.', 1, 39.00, 390.00, 40),
(4, 'policy_review', 'Policy Review AI', 'Upload a policy → get a clean Claude-powered breakdown across 11 review types in 90 seconds.', 2, 49.00, 490.00, 50),
(4, 'estimate_evaluator', 'Estimate Evaluator', 'Compare estimates side-by-side. Flag missing items. Win supplements with evidence.', 2, 59.00, 590.00, 60),
(4, 'ez_inspect', 'EZ-Inspect', 'Field inspection app with wall diagrams, photo capture, and product database. Works offline.', 1, 49.00, 490.00, 70),
(4, 'canvasser', 'Canvasser', 'Door-to-door knock tracking with storm overlays. Starter and Pro plans.', 1, 24.95, 249.50, 80),
(4, 'communicator', 'Communicator', 'Internal team chat + customer SMS + AI assist + tasks. One app, no Slack, no Telnyx.', 1, 29.00, 290.00, 90),
(4, 'plan_takeoff', 'Plan Takeoff AI', 'Drop a PDF → get measured quantities for lights, fixtures, tile, drywall — every trade.', 1, 79.00, 790.00, 100),
(4, 'scope_critic', 'ScopeCritic', 'Catch scope-of-loss gaps before the carrier does. Per-line Xactimate audit.', 2, 39.00, 390.00, 110),
(4, 'hvac_crm', 'HVAC CRM', 'Service-call dispatch + maintenance agreements + AnswerLine for HVAC owners.', 4, 79.00, 790.00, 120),
(4, 'study_pass_build', 'Study Pass Build', 'Contractor licensing exam prep. 17 states, IRC/IBC/NEC/UPC/IMC, 5,000+ questions.', 1, 99.00, 990.00, 130);

-- Map product slugs to ids for use below
SET @pid_contractor       = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='contractor');
SET @pid_supplementer     = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='supplementer');
SET @pid_appraisers       = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='appraisers');
SET @pid_stormwatch       = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='stormwatch');
SET @pid_policyreview     = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='policy_review');
SET @pid_estimateeval     = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='estimate_evaluator');
SET @pid_ezinspect        = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='ez_inspect');
SET @pid_canvasser        = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='canvasser');
SET @pid_communicator     = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='communicator');
SET @pid_plantakeoff      = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='plan_takeoff');
SET @pid_scopecritic      = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='scope_critic');
SET @pid_hvac             = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='hvac_crm');
SET @pid_study            = (SELECT id FROM funnel_products WHERE account_id=4 AND slug='study_pass_build');

-- Landing pages (one per product) — minimal scaffold; body_md is the editable copy
INSERT INTO landing_pages (account_id, product_id, slug, title, headline, subhead, body_md, cta_text, cta_url) VALUES
(4, @pid_contractor, 'contractor', 'Contractor CRM — Run Your Restoration Company', 'Run your restoration company without sticky-notes.', 'Jobs, supplements, scheduling, billing, journals, and Gmail integration in one app.', '## Built for contractors who supplement\n\nThe Contractor CRM was built by contractors, for contractors. Track every job from lead to paid, send supplements without leaving the app, and log every customer touch.\n\n### What you get\n- Job management with stages, journals, tasks, calendar\n- Built-in supplement writer with carrier templates\n- Gmail + Outlook two-way sync\n- Mobile app for field teams\n- StormWatch hail alerts included\n- Permit lookup (Aurora, Denver, more)\n\n### Pricing\n$99 per licensed user per month. $10 AI credit per seat included.\n\n[Start 14-day trial →](/checkout/contractor)', 'Start 14-day trial', '/checkout/contractor'),
(4, @pid_supplementer, 'supplementer', 'Supplementer — Win More Supplements', 'Build, send, and track every supplement in one place.', 'Carrier templates, line-item library, photo annotations, QuickBooks invoicing.', '## Stop losing supplements in your email\n\nSupplementer keeps every supplement, every photo, every adjuster touch in one place. Track which carrier owes you what.\n\n### What you get\n- Carrier-specific supplement templates\n- 2,700+ pre-built line items\n- Photo annotation tools\n- QuickBooks invoicing\n- AI-assisted writing\n\n### Pricing\n$79 per user per month.\n\n[Start 14-day trial →](/checkout/supplementer)', 'Start 14-day trial', '/checkout/supplementer'),
(4, @pid_appraisers, 'appraisers', 'Appraisers CRM — Built for Independent Appraisers', 'The CRM independent appraisers actually want to log into.', 'Assignments, exhibits, invoices, umpire workflow. No more Excel.', '## Stop running your practice in Excel\n\nAppraisers CRM was rebuilt in 2026 for the way independent appraisers actually work.\n\n### What you get\n- Assignment intake + tracking\n- Exhibit library with annotations\n- Invoice generator with QBO sync\n- Umpire workflow\n- Mobile app for site inspections\n\n### Pricing\n$89 per user per month.\n\n[Start 14-day trial →](/checkout/appraisers)', 'Start 14-day trial', '/checkout/appraisers'),
(4, @pid_stormwatch, 'stormwatch', 'StormWatch — Hail & Wind Alerts', 'Know about hail the day it lands.', 'Live NOAA SPC + CoCoRaHS feeds. Email + SMS alerts. Door-knock zones.', '## Be the first contractor to that neighborhood\n\nStormWatch pulls real hail and wind data from NOAA SPC, CoCoRaHS, and MESH every hour. Get alerts when storms hit your service area.\n\n### What you get\n- Real-time hail + wind alerts\n- Service area zone monitoring\n- Storm history database\n- Email + SMS + mobile push\n- Buffered spotter pin maps\n\n### Pricing\n$39 per user per month.\n\n[Start 14-day trial →](/checkout/stormwatch)', 'Start 14-day trial', '/checkout/stormwatch'),
(4, @pid_policyreview, 'policy-review', 'Policy Review AI — 11 Review Types in 90 Seconds', 'Upload a policy. Get a clean AI breakdown.', 'Deductible, O&L, RCV/ACV, sewer backup, matching, roof surface, lawsuit time limits, more.', '## Stop reading policies for 2 hours\n\nUpload a policy PDF. Claude reads every page and gives you a clean breakdown across 11 review types in 90 seconds.\n\n### What you get\n- 11 review types per policy\n- Page-cited findings\n- Endorsement detection\n- Coverage gap alerts\n- PDF + on-screen report\n\n### Pricing\n$49 per user per month. Page-based data caps with buy-more-data.\n\n[Start 14-day trial →](/checkout/policy_review)', 'Start 14-day trial', '/checkout/policy_review'),
(4, @pid_estimateeval, 'estimate-evaluator', 'Estimate Evaluator — Compare Estimates Side-by-Side', 'Spot missing items. Win more supplements.', 'Three-way compare. Elevation downspout detection. Bundled-item handling.', '## Win supplements with evidence\n\nDrop two or three Xactimate PDFs in. We line up every item, flag missing scope, mark elevation downspouts (never gutters), pro-rate tax + O&P correctly.\n\n### What you get\n- 2- or 3-way side-by-side compare\n- Bundled-item display (bid at top, line items below)\n- Elevation downspout deterministic detection\n- Agree/Disagree workflow with notes\n- PDF report for the file\n\n### Pricing\n$59 per user per month.\n\n[Start 14-day trial →](/checkout/estimate_evaluator)', 'Start 14-day trial', '/checkout/estimate_evaluator'),
(4, @pid_ezinspect, 'ez-inspect', 'EZ-Inspect — Field Inspection App', 'Wall diagrams, photo capture, product database. Offline-tolerant.', 'For roofers, restoration techs, window installers, and inspectors.', '## Inspect a property in 25 minutes\n\nEZ-Inspect captures every wall, every opening, every product spec from the field — in or out of cell range.\n\n### What you get\n- Wall diagram builder\n- 52 brand window/door database\n- Offline photo capture + sync\n- Generated PDF report\n- iOS + Android apps\n\n### Pricing\n$49 per user per month.\n\n[Start 14-day trial →](/checkout/ez_inspect)', 'Start 14-day trial', '/checkout/ez_inspect'),
(4, @pid_canvasser, 'canvasser', 'Canvasser — Door-to-Door Knock Tracking', 'Storm overlays. Duplicate-knock warnings. Team leaderboards.', 'Starter $24.95 / Pro $49.95 per knocker per month.', '## Knock smarter, not harder\n\nCanvasser shows your reps where hail hit and who has already been contacted — so they stop knocking the same door twice.\n\n### What you get\n- Storm-overlay maps\n- Duplicate-knock warning\n- Re-knock queue\n- Team leaderboards\n- Mobile app\n\n### Pricing\nStarter $24.95 / Pro $49.95 per knocker per month.\n\n[Start 14-day trial →](/checkout/canvasser)', 'Start 14-day trial', '/checkout/canvasser'),
(4, @pid_communicator, 'communicator', 'Communicator — Team + Customer Comms', 'Slack-style team chat + SMS to customers + AI assist + tasks.', 'One app instead of Slack + RingCentral + Asana.', '## Kill three subscriptions\n\nCommunicator replaces Slack, RingCentral, and Asana for restoration teams. Internal channels, customer SMS, AI summarization, tasks.\n\n### What you get\n- Internal channels + DMs\n- Customer SMS + chat\n- AI conversation summary\n- Task management\n- Phone via RingCentral integration\n\n### Pricing\n$29 per user per month.\n\n[Start 14-day trial →](/checkout/communicator)', 'Start 14-day trial', '/checkout/communicator'),
(4, @pid_plantakeoff, 'plan-takeoff', 'Plan Takeoff AI — Measured Quantities from a PDF', 'Lights, plumbing fixtures, tile, drywall, paint — every trade.', 'AI-vision powered. Per-trade presets. Reviewable confidence scores.', '## Stop bidding plans manually\n\nDrop a PDF set. Plan Takeoff returns measured quantities for every trade you select. Review, adjust, export.\n\n### What you get\n- Multi-trade batch runs\n- Trade-specific presets (lights, toilets, tile)\n- Confidence scoring + review queue\n- Cost estimating with unit costs\n- Shareable export package\n\n### Pricing\n$79 per user per month. Token-based data caps.\n\n[Start 14-day trial →](/checkout/plan_takeoff)', 'Start 14-day trial', '/checkout/plan_takeoff'),
(4, @pid_scopecritic, 'scope-critic', 'ScopeCritic — Catch Scope Gaps Before the Carrier Does', 'Per-line Xactimate audit. Catalog-aware.', 'For PAs, supplementers, and independent appraisers.', '## Don''t miss line items the carrier knows you forgot\n\nScopeCritic reads your Xactimate estimate line-by-line against the latest catalog and flags gaps before the file goes to the carrier.\n\n### What you get\n- Per-line audit against current catalog\n- Missing-companion item flags (drip edge, ice barrier, vents)\n- Pro-rated O&P/tax checks\n- PDF audit report\n\n### Pricing\n$39 per user per month.\n\n[Start 14-day trial →](/checkout/scope_critic)', 'Start 14-day trial', '/checkout/scope_critic'),
(4, @pid_hvac, 'hvac', 'HVAC CRM — Service-Call Dispatch + Maintenance', 'Dispatch board, maintenance agreements, AnswerLine receptionist.', 'Built for HVAC service shops.', '## Dispatch + Service + Sales in one app\n\nHVAC CRM tracks every call from booking to billing. AnswerLine answers when your office can''t.\n\n### What you get\n- Dispatch board\n- Maintenance agreement tracking\n- AnswerLine AI receptionist\n- Truck inventory\n- Service history per customer\n\n### Pricing\n$79 per user per month.\n\n[Start 14-day trial →](/checkout/hvac_crm)', 'Start 14-day trial', '/checkout/hvac_crm'),
(4, @pid_study, 'study-pass-build', 'Study Pass Build — Contractor Licensing Exam Prep', 'IRC, IBC, NEC, UPC, IMC. 17 states. 5,000+ questions.', 'Pass your contractor license exam the first time.', '## Pass your licensing exam first try\n\nStudy Pass Build covers the IRC, IBC, NEC, UPC, IMC, IEBC, and IECC across 17 states with 244+ study modules and 5,000+ exam-style questions.\n\n### What you get\n- 17-state coverage (CO, TX, FL, AZ, NV, more)\n- 244+ study modules\n- 5,000+ exam questions\n- Anki-style flashcards (SM-2)\n- Offline PWA + mobile app\n\n### Pricing\n$99 per month. No free trial.\n\n[Subscribe →](/checkout/study_pass_build)', 'Subscribe', '/checkout/study_pass_build');

-- Lead magnets (one per product)
INSERT INTO lead_magnets (account_id, product_id, title, format, description) VALUES
(4, @pid_contractor, 'Free: 2026 Restoration Job Stage Cheat Sheet', 'pdf', 'The 18 job stages every restoration shop needs. PDF download.'),
(4, @pid_supplementer, 'Free: Supplement Win Rate Audit', 'checklist', 'Score your supplement process against 27 best practices. PDF checklist.'),
(4, @pid_appraisers, 'Free: Independent Appraiser Pricing Calculator', 'calculator', 'How much should you charge per hour, per assignment, per umpire? Tool.'),
(4, @pid_stormwatch, 'Free: Hail Swath Lookup for Last 12 Months', 'tool', 'Type an address. See every hail event > 1" in the last 12 months. Free tool.'),
(4, @pid_policyreview, 'Free: Sample 11-Type Policy Review', 'pdf', 'A real anonymized HO3 policy with all 11 review types attached. PDF.'),
(4, @pid_estimateeval, 'Free: Bundled-Item Detection Cheat Sheet', 'cheat_sheet', 'When is a line bundled? When is it a separate item? Visual cheat sheet PDF.'),
(4, @pid_ezinspect, 'Free: Wall Diagram Symbol Guide', 'pdf', 'Every wall diagram symbol explained. PDF.'),
(4, @pid_canvasser, 'Free: Door Script That Books 30% of Knocks', 'pdf', 'The door script our top knocker uses. PDF.'),
(4, @pid_communicator, 'Free: How to Cut Slack + RingCentral + Asana in 60 Days', 'pdf', 'Step-by-step migration plan. PDF.'),
(4, @pid_plantakeoff, 'Free: 5 Trades AI Can Take Off Better Than You', 'pdf', 'Lights, plumbing fixtures, tile, drywall openings, paint — why AI wins. PDF.'),
(4, @pid_scopecritic, 'Free: 12 Line Items Carriers Hope You Forget', 'checklist', 'The 12 most commonly missed Xactimate items. Checklist.'),
(4, @pid_hvac, 'Free: Maintenance Agreement Pricing Template', 'pdf', 'How to price your annual maintenance agreement. Template.'),
(4, @pid_study, 'Free: Practice Exam — IRC Chapter 9 Roof Assemblies', 'tool', '50 free practice questions on IRC roof assemblies. Online tool.');

-- ============================================================================
-- M-3: 80+ email templates organized into sequences
-- ============================================================================

-- Helper: 5 cold-outreach sequences × 7 emails = 35
-- 4 trial-conversion sequences × 5 emails = 20
-- 3 demo no-show × 5 personas = 15
-- 1 review request × 5 personas = 5
-- 1 webinar follow-up × 5 = 5
-- Total: 80

-- Cold outreach — GC/Restoration (persona 1, contractor product)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id, product_id) VALUES
(4, 'cold_gc_d1', 'Cold GC Day 1', 'Quick question about your supplement workflow', 'How are you tracking carrier responses today?', '{first_name},\n\nQuick one — when a carrier sits on a supplement for 21+ days, how do you know? Sticky note? Spreadsheet? Mental loop?\n\nI ask because we built the Contractor CRM around exactly that problem. Most shops we talk to lose 1–2 supplements a month just because they fell through the cracks.\n\nWorth a 12-minute look? Reply "yes" and I''ll send a link.\n\nDarin\nCADsuite', 'cold_outreach', 1, @pid_contractor),
(4, 'cold_gc_d3', 'Cold GC Day 3', 'Quick stat — 27% of restoration shops lose ≥1 supplement/month', 'And it''s almost always tracking, not skill.', '{first_name},\n\nIn case you missed my note Monday — 27% of restoration shops we surveyed lose at least one supplement per month, purely from tracking.\n\nNot writing skill. Not carrier pushback. Tracking.\n\nIf that''s costing you $5K+/month, the Contractor CRM is $99/seat. Worth a 12-min look?\n\nDarin', 'cold_outreach', 1, @pid_contractor),
(4, 'cold_gc_d5', 'Cold GC Day 5', 'Free: 2026 Job Stage Cheat Sheet', 'Even if you never buy our CRM, this PDF is useful.', '{first_name},\n\nNot pushing the CRM today. Just wanted to share a free PDF — the 18 job stages every restoration shop should be tracking.\n\nWe built it for our own customers but it''s useful for any contractor running a real pipeline.\n\nGrab it here: {lead_magnet_url}\n\nDarin', 'cold_outreach', 1, @pid_contractor),
(4, 'cold_gc_d8', 'Cold GC Day 8', 'One question', 'If you had a magic wand for one CRM gap…', '{first_name},\n\nGenuine question — if you had a magic wand for one CRM gap in your restoration shop, what would you fix?\n\nI ask everyone. The answers are usually 1 of 4 things, and we''ve solved 3 of them in Contractor CRM. Curious which one would top your list.\n\nDarin', 'cold_outreach', 1, @pid_contractor),
(4, 'cold_gc_d12', 'Cold GC Day 12', 'Last note', 'Last touch — appreciate the time.', '{first_name},\n\nLast email from me on this thread.\n\nIf the timing isn''t right, no worries — I''ll move you off the list. If it ever is, just hit reply.\n\nIn the meantime, here''s a 5-min demo loom if you''re curious: {demo_url}\n\nDarin', 'cold_outreach', 1, @pid_contractor),
(4, 'cold_gc_d16', 'Cold GC Day 16', 'Hail map for your service area', 'Free visual — last 12 months of hail in your zip.', '{first_name},\n\nGenerated this for you — last 12 months of hail > 1" across your service area (StormWatch product output, not ours):\n\n{stormwatch_image}\n\nIf there''s a swath you didn''t door-knock, that''s probably money on the table.\n\nDarin', 'cold_outreach', 1, @pid_stormwatch),
(4, 'cold_gc_d21', 'Cold GC Day 21', 'OK pulling the plug', 'No more emails after this one.', '{first_name},\n\nPulling the plug on this thread. No more emails from me.\n\nIf you ever want a 12-min look, the door is always open. Reply anytime.\n\nDarin', 'cold_outreach', 1, @pid_contractor);

-- Cold outreach — Public Adjuster (persona 2)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id, product_id) VALUES
(4, 'cold_pa_d1', 'Cold PA Day 1', '11-review-type policy breakdown in 90 seconds', 'Built for PAs who hate reading policies twice.', '{first_name},\n\nQuick — how long does a typical policy review take you front-to-back? An hour? Three?\n\nWe built Policy Review AI specifically because the PAs we talk to spent 3+ hours per claim just reading the policy.\n\nUpload → 90 seconds → clean breakdown across all 11 review types. $49/seat.\n\nWorth a look?\n\nDarin\nCADsuite', 'cold_outreach', 2, @pid_policyreview),
(4, 'cold_pa_d3', 'Cold PA Day 3', 'Free sample: real HO3 with all 11 review types', 'Anonymized. Yours to keep.', '{first_name},\n\nIn case the policy reviewer concept was abstract — here''s a real anonymized HO3 with all 11 review types attached. Useful even if you never buy from us.\n\nGrab it: {lead_magnet_url}\n\nDarin', 'cold_outreach', 2, @pid_policyreview),
(4, 'cold_pa_d5', 'Cold PA Day 5', 'Estimate Evaluator — side-by-side compare', 'For supplements, the per-line evidence wins.', '{first_name},\n\nDifferent product, same goal — Estimate Evaluator. Drop two PDFs in, get a side-by-side. Flags missing items, handles bundled bids, pro-rates O&P right.\n\nA lot of PAs are using it for the per-line evidence in supplements.\n\n$59/seat. Demo: {demo_url}\n\nDarin', 'cold_outreach', 2, @pid_estimateeval),
(4, 'cold_pa_d8', 'Cold PA Day 8', 'Quick poll', 'What slows you down most?', '{first_name},\n\nGenuine question for the PA crowd — what slows you down MOST in a typical week?\n\n(a) Reading policies\n(b) Writing supplements\n(c) Carrier follow-up\n(d) Estimate comparison\n(e) Other\n\nReply with a letter. I''ll send you the matching product.\n\nDarin', 'cold_outreach', 2, @pid_policyreview),
(4, 'cold_pa_d12', 'Cold PA Day 12', 'Bundle pricing for PAs', '3 products, one price.', '{first_name},\n\nBundling for PAs — Policy Review + Estimate Evaluator + ScopeCritic in one subscription, $129/seat (vs $147 individually).\n\nMakes sense as a stack since you''ll use all three on every claim.\n\n14-day trial: {bundle_trial_url}\n\nDarin', 'cold_outreach', 2, @pid_policyreview),
(4, 'cold_pa_d16', 'Cold PA Day 16', 'Last value email', 'Free PDF on lawsuit time limit clauses.', '{first_name},\n\nNot selling today. Just sharing — quick PDF I wrote on how to read lawsuit time limit clauses correctly. Most PAs miss the carve-out for actions arising from coverage disputes.\n\nGrab it: {lawsuit_time_limit_pdf_url}\n\nDarin', 'cold_outreach', 2, @pid_policyreview),
(4, 'cold_pa_d21', 'Cold PA Day 21', 'Closing thread', 'No more from me.', '{first_name},\n\nClosing the thread. Best of luck with your claims this quarter.\n\nIf you ever want to look, just reply to any email and you''ll bump back to top of my inbox.\n\nDarin', 'cold_outreach', 2, @pid_policyreview);

-- Cold outreach — Independent Appraiser (persona 3)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id, product_id) VALUES
(4, 'cold_app_d1', 'Cold Appraiser Day 1', 'CRM for independent appraisers', 'Built by appraisers, for appraisers.', '{first_name},\n\nQuick — are you still running assignments in Excel + email?\n\nMost independent appraisers we talk to are. Then they hit ~40 active files and the wheels come off.\n\nAppraisers CRM was rebuilt this year specifically for solo + small-shop appraisers. Assignments, exhibits, umpire workflow, invoicing.\n\n$89/seat. 12-min demo: {demo_url}\n\nDarin\nCADsuite', 'cold_outreach', 3, @pid_appraisers),
(4, 'cold_app_d3', 'Cold Appraiser Day 3', 'Free: Pricing calculator', 'How much should you charge per assignment?', '{first_name},\n\nFree tool — pricing calculator for independent appraisers. Tells you what to charge per hour, per assignment, per umpire engagement based on your overhead and market.\n\n{lead_magnet_url}\n\nDarin', 'cold_outreach', 3, @pid_appraisers),
(4, 'cold_app_d5', 'Cold Appraiser Day 5', 'Umpire workflow built-in', 'For when you get the umpire call.', '{first_name},\n\nQuick — when you get retained as umpire, what''s your workflow? Most appraisers we talk to are using shared Dropbox folders.\n\nAppraisers CRM has umpire workflow built in — both party submissions, exhibit comparison, decision template, invoice routing.\n\nQuick walkthrough: {demo_url}\n\nDarin', 'cold_outreach', 3, @pid_appraisers),
(4, 'cold_app_d8', 'Cold Appraiser Day 8', 'Loss Appraisers brand', 'Maybe more relevant if you''re solo.', '{first_name},\n\nIf you''re running solo, Loss Appraisers (lossappraisers.com) might be a better fit than the full CRM. Same backend, simpler UX, no umpire workflow.\n\nWorth a look: lossappraisers.com\n\nDarin', 'cold_outreach', 3, @pid_appraisers),
(4, 'cold_app_d12', 'Cold Appraiser Day 12', 'Estimate Evaluator for appraisal hearings', 'Side-by-side evidence wins disputes.', '{first_name},\n\nDifferent angle — Estimate Evaluator. When you''re sitting across from a carrier appraiser arguing scope, the side-by-side report carries weight.\n\nUploads two Xactimate PDFs, lines them up, marks every gap. PDF you can hand to the umpire.\n\n$59/seat: {demo_url}\n\nDarin', 'cold_outreach', 3, @pid_estimateeval),
(4, 'cold_app_d16', 'Cold Appraiser Day 16', 'How are you tracking umpire conflicts?', 'Most appraisers don''t.', '{first_name},\n\nGenuine question — how are you tracking umpire conflicts? (Same carrier, same party, prior engagement that disqualifies you, etc.)\n\nMost appraisers run this in their head. We just added conflict tracking to Appraisers CRM — flags conflicts on intake before you accept.\n\nDemo: {demo_url}\n\nDarin', 'cold_outreach', 3, @pid_appraisers),
(4, 'cold_app_d21', 'Cold Appraiser Day 21', 'Closing thread', 'No more from me unless you reach out.', '{first_name},\n\nClosing the thread. If the timing ever is right, just hit reply to any of these.\n\nDarin', 'cold_outreach', 3, @pid_appraisers);

-- Cold outreach — HVAC Owner (persona 4)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id, product_id) VALUES
(4, 'cold_hvac_d1', 'Cold HVAC Day 1', 'Dispatch board + AnswerLine in one app', 'For HVAC owners.', '{first_name},\n\nQuick — when a customer calls at 6pm and your office is closed, what happens?\n\nMost HVAC shops we talk to either lose the call or pay an answering service $400/mo to do a mediocre job.\n\nHVAC CRM includes AnswerLine, our AI receptionist. Books appointments, takes service requests, escalates emergencies.\n\n$79/seat all-in. Demo: {demo_url}\n\nDarin\nCADsuite', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d3', 'Cold HVAC Day 3', 'Free: Maintenance agreement pricing template', 'How to price your annual MA.', '{first_name},\n\nFree template — how to price your annual maintenance agreement so you actually make money on it.\n\n{lead_magnet_url}\n\nDarin', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d5', 'Cold HVAC Day 5', 'Question', 'What''s your no-show rate on dispatched calls?', '{first_name},\n\nQuick question — what''s your no-show rate when you dispatch a tech? Industry average is 8–12%. We have customers under 3% because the customer gets a "tech on the way" SMS with a live ETA.\n\nFeature in HVAC CRM. $79/seat: {demo_url}\n\nDarin', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d8', 'Cold HVAC Day 8', 'Truck inventory', 'How are you tracking what''s on each truck?', '{first_name},\n\nGenuine question — how are you tracking what''s on each tech''s truck? Most owners we talk to are guessing.\n\nHVAC CRM has truck inventory per tech, deducts on use, alerts when stock gets low. Pays for itself by stopping warehouse-to-truck shrinkage.\n\nDemo: {demo_url}\n\nDarin', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d12', 'Cold HVAC Day 12', 'AnswerLine deep dive', 'How the AI receptionist actually works.', '{first_name},\n\nGetting into AnswerLine — our AI receptionist that comes with HVAC CRM.\n\n- Answers calls 24/7\n- Books appointments straight into your dispatch board\n- Takes service requests with photos via MMS\n- Escalates "no heat / no AC" to on-call tech instantly\n- Forwards to a human number if asked\n\n14-day trial included with HVAC CRM. {trial_url}\n\nDarin', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d16', 'Cold HVAC Day 16', 'Comparison sheet vs ServiceTitan', 'CADsuite is 1/4 the price.', '{first_name},\n\nIn case you''re evaluating CRMs side-by-side — I made a comparison sheet of HVAC CRM vs ServiceTitan and Housecall Pro.\n\nTL;DR: we''re 1/4 the price of ST and roughly half of HCP, with the AnswerLine bundled.\n\nSheet: {comparison_url}\n\nDarin', 'cold_outreach', 4, @pid_hvac),
(4, 'cold_hvac_d21', 'Cold HVAC Day 21', 'Closing', 'Best of luck.', '{first_name},\n\nClosing the thread. Best of luck this season.\n\nDarin', 'cold_outreach', 4, @pid_hvac);

-- Cold outreach — Carrier Ops (persona 5)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id, product_id) VALUES
(4, 'cold_carrier_d1', 'Cold Carrier Day 1', 'Enterprise Policy Review AI for claims ops', 'Volume discount + SSO + audit trail.', '{first_name},\n\nIntroducing CADsuite enterprise tier for carrier claims ops.\n\nPolicy Review AI at volume: 1,000+ policies/month, SSO via SAML, full audit trail, SOC 2 attestation, custom review type training for your specific policy forms.\n\nWorth a 25-min walkthrough?\n\nDarin\nCADsuite', 'cold_outreach', 5, @pid_policyreview),
(4, 'cold_carrier_d3', 'Cold Carrier Day 3', 'Audit trail + SOC 2', 'For compliance teams.', '{first_name},\n\nFollowing up — the enterprise tier includes everything compliance teams ask about:\n\n- Per-user audit trail (who reviewed what, when, what changed)\n- SOC 2 Type II attestation\n- BAA-ready (PHI-safe configuration)\n- SSO via SAML 2.0\n- Data residency option (US/EU/Canada)\n\nWorth a 25-min walkthrough with our compliance lead?\n\nDarin', 'cold_outreach', 5, @pid_policyreview),
(4, 'cold_carrier_d5', 'Cold Carrier Day 5', 'Estimate Evaluator for adjuster QA', 'Catch field-adjuster scope misses pre-payment.', '{first_name},\n\nDifferent angle — Estimate Evaluator at carrier scale. Use it to QA your own field adjusters'' estimates before payment.\n\nFlags missing elevation downspouts, mis-applied O&P, bundled-item issues. Saves money on supplemental disputes by catching mistakes pre-issue.\n\nWorth a look?\n\nDarin', 'cold_outreach', 5, @pid_estimateeval),
(4, 'cold_carrier_d8', 'Cold Carrier Day 8', 'Custom training', 'On your specific policy forms.', '{first_name},\n\nEnterprise tier includes custom review-type training on YOUR specific policy forms (HO-3, HO-5, DP-1, commercial property).\n\nWe train a private model on your policy library, you get review types that match your underwriting language exactly.\n\nLead time: 60 days. Worth scoping?\n\nDarin', 'cold_outreach', 5, @pid_policyreview),
(4, 'cold_carrier_d12', 'Cold Carrier Day 12', 'Reference', 'A regional carrier using us.', '{first_name},\n\nQuick reference — a regional carrier I can introduce you to. ~$400M in premium, using Policy Review AI for 3,400 claims/month.\n\nThey can speak to: implementation timeline, security review, ROI numbers.\n\nIntro?\n\nDarin', 'cold_outreach', 5, @pid_policyreview),
(4, 'cold_carrier_d16', 'Cold Carrier Day 16', 'White paper', 'AI in claims operations 2026.', '{first_name},\n\nWe just published a white paper — "AI in Claims Operations 2026: What''s Real, What''s Hype, What''s Coming." 28 pages, no sales pitch.\n\nGrab it: {whitepaper_url}\n\nDarin', 'cold_outreach', 5, @pid_policyreview),
(4, 'cold_carrier_d21', 'Cold Carrier Day 21', 'Closing thread', 'Pleasure meeting (or attempting to).', '{first_name},\n\nClosing the thread. Pleasure meeting you (or attempting to). If anything I sent was useful, that''s a win.\n\nDarin', 'cold_outreach', 5, @pid_policyreview);

-- Trial conversion sequences — 4 emails × 5 personas = 20
-- (We use placeholders {product_name} so one template applies across products)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'trial_d1_gc', 'Trial Day 1 — GC', 'Welcome to your {product_name} trial', 'Day 1 — let''s pick the right starting point.', 'Hey {first_name},\n\nWelcome aboard. You''re on a 14-day free trial of {product_name}.\n\nFor restoration shops, the highest-leverage starting move is usually [importing your active jobs] (5-min CSV upload). Want me to walk you through it?\n\nReply "yes" and I''ll send a Loom.\n\nDarin', 'trial_onboarding', 1),
(4, 'trial_d3_gc', 'Trial Day 3 — GC', 'How''s it going?', 'Day 3 check-in.', 'Hey {first_name},\n\nDay 3 of your {product_name} trial. Two questions:\n\n1. Did you import your active jobs?\n2. What''s the first thing that felt clunky?\n\nGenuinely — I want to know what we can fix.\n\nDarin', 'trial_onboarding', 1),
(4, 'trial_d7_gc', 'Trial Day 7 — GC', 'Halfway through', 'Day 7 — what should we set up next?', 'Hey {first_name},\n\nHalfway through your {product_name} trial.\n\nThe customers who convert at the highest rate tend to do these 3 things in week 1:\n1. Import active jobs ✅ (assuming you did)\n2. Connect Gmail (5 min)\n3. Invite at least one teammate\n\nDid #2 and #3 happen?\n\nDarin', 'trial_onboarding', 1),
(4, 'trial_d13_gc', 'Trial Day 13 — GC', 'Trial ends tomorrow — quick offer', 'Founder Loom + early-bird discount inside.', 'Hey {first_name},\n\nYour {product_name} trial ends tomorrow.\n\nQuick personal Loom from me on what you''ll get if you stay: {loom_url}\n\nEarly-bird offer: lock in your trial-period pricing for 12 months if you convert today. After tomorrow it''s standard {monthly_price}/seat/mo.\n\nConvert: {checkout_url}\n\nDarin', 'trial_conversion', 1);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'trial_d1_pa', 'Trial Day 1 — PA', 'Welcome to your {product_name} trial', 'Day 1 — let''s upload your first policy.', 'Hey {first_name},\n\nWelcome to {product_name}. For PAs, the fastest win is uploading a real policy and watching the 11-type breakdown render in 90 seconds. Got one handy?\n\nDarin', 'trial_onboarding', 2),
(4, 'trial_d3_pa', 'Trial Day 3 — PA', 'How''s the AI quality?', 'Day 3 — be brutal.', 'Hey {first_name},\n\nDay 3. Quick ask — how is the AI quality holding up against your eyeball? Be brutal. We''re iterating fast and your feedback feeds directly into prompts.\n\nDarin', 'trial_onboarding', 2),
(4, 'trial_d7_pa', 'Trial Day 7 — PA', 'Estimate Evaluator works great with this', 'Bundle suggestion for PAs.', 'Hey {first_name},\n\nMidway through your trial. Most PAs end up bundling Policy Review with Estimate Evaluator + ScopeCritic — $129/seat for all three vs $147 individually.\n\nWant me to flip your account onto the trial bundle?\n\nDarin', 'trial_onboarding', 2),
(4, 'trial_d13_pa', 'Trial Day 13 — PA', 'Convert today, lock in trial pricing', 'Last day of free.', 'Hey {first_name},\n\nLast day of your {product_name} trial.\n\nConvert today and you lock in $49/seat for 12 months. {checkout_url}\n\nDarin', 'trial_conversion', 2);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'trial_d1_app', 'Trial Day 1 — Appraiser', 'Welcome to your {product_name} trial', 'Day 1.', 'Hey {first_name},\n\nWelcome to Appraisers CRM. Fastest wins for appraisers:\n\n1. Import 5 active assignments\n2. Connect Gmail for journal capture\n3. Set up your invoice template\n\nWant a 7-min walkthrough Loom? Reply yes.\n\nDarin', 'trial_onboarding', 3),
(4, 'trial_d3_app', 'Trial Day 3 — Appraiser', 'How''s the assignment intake form?', 'Day 3.', 'Hey {first_name},\n\nDay 3. The assignment intake form is the most customized piece of Appraisers CRM — does it match what carriers send you?\n\nReply with one thing you''d change and I''ll route it to engineering.\n\nDarin', 'trial_onboarding', 3),
(4, 'trial_d7_app', 'Trial Day 7 — Appraiser', 'Umpire workflow', 'Trial week 2 starts.', 'Hey {first_name},\n\nMidway. Want to walk through the umpire workflow with me? It''s the piece most appraisers don''t discover on their own and it''s the highest-leverage feature.\n\n15 min screen share?\n\nDarin', 'trial_onboarding', 3),
(4, 'trial_d13_app', 'Trial Day 13 — Appraiser', 'Convert today', 'Last day.', 'Hey {first_name},\n\nLast day of your Appraisers CRM trial. Convert today: {checkout_url}\n\nDarin', 'trial_conversion', 3);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'trial_d1_hvac', 'Trial Day 1 — HVAC', 'Welcome to your HVAC CRM trial', 'Day 1.', 'Hey {first_name},\n\nWelcome to HVAC CRM. Day 1 — let''s get AnswerLine answering your phone tonight.\n\n5-min setup: {answerline_setup_url}\n\nDarin', 'trial_onboarding', 4),
(4, 'trial_d3_hvac', 'Trial Day 3 — HVAC', 'How''s AnswerLine?', 'Day 3.', 'Hey {first_name},\n\nDay 3. AnswerLine fielding any calls yet? Let me know if any calls came in weird and I''ll re-tune the receptionist.\n\nDarin', 'trial_onboarding', 4),
(4, 'trial_d7_hvac', 'Trial Day 7 — HVAC', 'Maintenance agreements module', 'Trial midpoint.', 'Hey {first_name},\n\nHalfway. Did you set up your maintenance agreement templates? That''s where the recurring revenue lives.\n\nQuick screen share? Reply with a time.\n\nDarin', 'trial_onboarding', 4),
(4, 'trial_d13_hvac', 'Trial Day 13 — HVAC', 'Convert today', 'Last day.', 'Hey {first_name},\n\nLast day of your HVAC CRM trial. {checkout_url}\n\nDarin', 'trial_conversion', 4);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'trial_d1_carrier', 'Trial Day 1 — Carrier', 'Welcome to your enterprise pilot', 'Day 1.', 'Hi {first_name},\n\nWelcome to your enterprise pilot of Policy Review AI. Your dedicated implementation engineer is {implementation_lead}, cc''d.\n\nFirst-week milestones in the attached project plan.\n\nDarin', 'trial_onboarding', 5),
(4, 'trial_d3_carrier', 'Trial Day 3 — Carrier', 'Implementation check-in', 'Day 3.', 'Hi {first_name},\n\nDay 3 check-in. How''s the SSO setup with {implementation_lead}? Any blockers we should escalate?\n\nDarin', 'trial_onboarding', 5),
(4, 'trial_d7_carrier', 'Trial Day 7 — Carrier', 'Custom policy form training', 'Day 7.', 'Hi {first_name},\n\nWeek 2 — time to scope the custom policy form training. Standard timeline is 60 days from sample upload. Let''s set the kickoff.\n\nDarin', 'trial_onboarding', 5),
(4, 'trial_d13_carrier', 'Trial Day 13 — Carrier', 'Trial wrap-up', 'Day 13.', 'Hi {first_name},\n\nTrial wraps tomorrow. {implementation_lead} will send the success metrics summary today. Let''s schedule the conversion call this week.\n\nDarin', 'trial_conversion', 5);

-- Demo no-show recovery — 3 emails × 5 personas = 15
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'noshow_1_gc', 'No-Show 1 — GC', 'Missed you at {demo_time}', 'Want to reschedule?', 'Hey {first_name},\n\nMissed you at the demo today. Things come up — happens to all of us.\n\nWant to rebook? Here''s my calendar: {calendar_url}\n\nOr — if it''s easier, I can do a 5-min recorded walkthrough and email it to you. Just reply "Loom".\n\nDarin', 'demo_recovery', 1),
(4, 'noshow_3_gc', 'No-Show 3 — GC', 'Quick Loom instead', 'No reschedule needed — Loom inside.', 'Hey {first_name},\n\nHere''s a 5-min recorded walkthrough of {product_name} you can watch when you have a sec:\n\n{loom_url}\n\nDarin', 'demo_recovery', 1),
(4, 'noshow_5_gc', 'No-Show 5 — GC', 'OK closing this out', 'No worries.', 'Hey {first_name},\n\nClosing this thread — no worries, timing isn''t right. Door''s always open.\n\nDarin', 'demo_recovery', 1);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'noshow_1_pa', 'No-Show 1 — PA', 'Missed you at {demo_time}', 'Reschedule?', 'Hey {first_name},\n\nMissed you at the demo. Rebook: {calendar_url}\n\nOr Loom — reply "Loom".\n\nDarin', 'demo_recovery', 2),
(4, 'noshow_3_pa', 'No-Show 3 — PA', 'Quick Loom', 'No reschedule needed.', 'Hey {first_name},\n\nHere''s a 5-min recorded Policy Review walkthrough: {loom_url}\n\nDarin', 'demo_recovery', 2),
(4, 'noshow_5_pa', 'No-Show 5 — PA', 'Closing out', 'Best of luck.', 'Hey {first_name},\n\nClosing the thread.\n\nDarin', 'demo_recovery', 2);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'noshow_1_app', 'No-Show 1 — Appraiser', 'Missed you', 'Reschedule?', 'Hey {first_name},\n\nMissed the demo. Rebook: {calendar_url}\n\nDarin', 'demo_recovery', 3),
(4, 'noshow_3_app', 'No-Show 3 — Appraiser', 'Loom instead', 'Watch when convenient.', 'Hey {first_name},\n\n5-min Loom: {loom_url}\n\nDarin', 'demo_recovery', 3),
(4, 'noshow_5_app', 'No-Show 5 — Appraiser', 'Closing', 'Best of luck.', 'Hey {first_name},\n\nClosing the thread.\n\nDarin', 'demo_recovery', 3);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'noshow_1_hvac', 'No-Show 1 — HVAC', 'Missed you', 'Reschedule?', 'Hey {first_name},\n\nMissed the demo. Rebook: {calendar_url}\n\nDarin', 'demo_recovery', 4),
(4, 'noshow_3_hvac', 'No-Show 3 — HVAC', 'Loom', '5-min recorded walkthrough.', 'Hey {first_name},\n\nHere: {loom_url}\n\nDarin', 'demo_recovery', 4),
(4, 'noshow_5_hvac', 'No-Show 5 — HVAC', 'Closing', 'Best of luck.', 'Hey {first_name},\n\nClosing the thread.\n\nDarin', 'demo_recovery', 4);

INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'noshow_1_carrier', 'No-Show 1 — Carrier', 'Missed our intro', 'Rebooking link inside.', 'Hi {first_name},\n\nMissed our intro. Rebook: {calendar_url}\n\nDarin', 'demo_recovery', 5),
(4, 'noshow_3_carrier', 'No-Show 3 — Carrier', 'White paper attached', 'Reading material while we reconnect.', 'Hi {first_name},\n\nWhile we work out a new time, here''s the AI-in-Claims-Ops white paper: {whitepaper_url}\n\nDarin', 'demo_recovery', 5),
(4, 'noshow_5_carrier', 'No-Show 5 — Carrier', 'Closing', 'Pleasure connecting.', 'Hi {first_name},\n\nClosing the thread. Pleasure connecting.\n\nDarin', 'demo_recovery', 5);

-- Review requests (5 personas, Day 30 ask)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'review_d30_gc', 'Review Day 30 — GC', 'Quick favor — 90-second G2 review?', '30 days in.', 'Hey {first_name},\n\nYou''ve been on {product_name} for 30 days. If it''s been useful — would you do me a giant favor?\n\nWrite a 90-second G2 review: {g2_url}\n\nIt helps every other GC who''s evaluating us decide whether to give us a shot.\n\nDarin', 'review_request', 1),
(4, 'review_d30_pa', 'Review Day 30 — PA', '30 days — G2 review favor?', '90 seconds, max.', 'Hey {first_name},\n\n30 days on {product_name}. Quick favor — G2 review? {g2_url}\n\nDarin', 'review_request', 2),
(4, 'review_d30_app', 'Review Day 30 — Appraiser', 'G2 review?', '90 seconds.', 'Hey {first_name},\n\n30 days on Appraisers CRM. Help a PA out — write a G2 review: {g2_url}\n\nDarin', 'review_request', 3),
(4, 'review_d30_hvac', 'Review Day 30 — HVAC', 'Capterra review?', '90 seconds.', 'Hey {first_name},\n\n30 days on HVAC CRM. Capterra review favor: {capterra_url}\n\nDarin', 'review_request', 4),
(4, 'review_d30_carrier', 'Review Day 30 — Carrier', 'Internal recommendation letter?', '15 minutes.', 'Hi {first_name},\n\n30 days into the pilot. If results have been good, would you write a one-page internal recommendation letter we can show other carrier prospects? I''ll draft and send for your edits.\n\nDarin', 'review_request', 5);

-- Webinar follow-up (5 emails)
INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, category, persona_id) VALUES
(4, 'webinar_thanks_attended', 'Webinar — Thanks (Attended)', 'Thanks for being on today''s webinar', 'Replay + slides inside.', 'Hey {first_name},\n\nThanks for being on the webinar. Replay: {replay_url}. Slides: {slides_url}.\n\nIf you want to test-drive what we showed, here''s a 14-day trial: {trial_url}\n\nDarin', 'webinar_followup', NULL),
(4, 'webinar_thanks_replay', 'Webinar — Thanks (Replay)', 'You missed live — replay inside', 'Catch up at 2x speed.', 'Hey {first_name},\n\nYou registered but couldn''t make it live. No worries — replay: {replay_url}\n\nDarin', 'webinar_followup', NULL),
(4, 'webinar_trial_offer', 'Webinar — Trial Offer', 'Special trial offer from yesterday''s webinar', 'Inside.', 'Hey {first_name},\n\nThe trial offer we mentioned on yesterday''s webinar — locked in until end of week. {trial_url}\n\nDarin', 'webinar_followup', NULL),
(4, 'webinar_question_followup', 'Webinar — Your Question', 'Wanted to follow up on your question', 'Cited correctly this time.', 'Hey {first_name},\n\nYou asked a great question on the webinar that I didn''t fully answer. Here''s the proper answer with citations.\n\nDarin', 'webinar_followup', NULL),
(4, 'webinar_next_month', 'Webinar — Next Month', 'Save the date — next webinar', 'Topic: {next_topic}.', 'Hey {first_name},\n\nNext month''s topic: {next_topic}. Register: {next_register_url}\n\nDarin', 'webinar_followup', NULL);

-- ============================================================================
-- M-3 (cont): Sequences with steps
-- ============================================================================

-- 5 cold-outreach sequences
INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, persona_id, product_id, total_steps) VALUES
(4, 'cold_gc_restoration_2026',     'Cold Outreach — GC / Restoration',  '14-day multi-touch sequence for restoration GCs. Email-only first pass; LinkedIn + phone added in v2.', 'tag_added', 1, @pid_contractor, 7),
(4, 'cold_public_adjuster_2026',    'Cold Outreach — Public Adjuster',   '14-day multi-touch for PAs. Bundle messaging on day 12.',                                            'tag_added', 2, @pid_policyreview, 7),
(4, 'cold_appraiser_2026',          'Cold Outreach — Independent Appraiser', '14-day multi-touch for solo appraisers + umpire workflow upsell.',                              'tag_added', 3, @pid_appraisers, 7),
(4, 'cold_hvac_2026',               'Cold Outreach — HVAC Owner',        '14-day multi-touch for HVAC shop owners. AnswerLine + maintenance agreement focus.',                'tag_added', 4, @pid_hvac, 7),
(4, 'cold_carrier_2026',            'Cold Outreach — Carrier Ops',       '21-day enterprise sequence. Compliance + custom training emphasis.',                                'tag_added', 5, @pid_policyreview, 7);

-- Trial onboarding (one per persona)
INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, persona_id, total_steps) VALUES
(4, 'trial_onboarding_gc',     'Trial Onboarding — GC',         '14-day onboarding + conversion sequence for GC trials.',         'deal_stage', 1, 4),
(4, 'trial_onboarding_pa',     'Trial Onboarding — PA',         '14-day onboarding + conversion sequence for PA trials.',         'deal_stage', 2, 4),
(4, 'trial_onboarding_app',    'Trial Onboarding — Appraiser',  '14-day onboarding + conversion sequence for Appraiser trials.',  'deal_stage', 3, 4),
(4, 'trial_onboarding_hvac',   'Trial Onboarding — HVAC',       '14-day onboarding + conversion sequence for HVAC trials.',       'deal_stage', 4, 4),
(4, 'trial_onboarding_carrier','Trial Onboarding — Carrier',    '14-day enterprise pilot kickoff sequence.',                       'deal_stage', 5, 4);

-- Demo no-show recovery (one per persona)
INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, persona_id, total_steps) VALUES
(4, 'demo_noshow_gc',     'Demo No-Show — GC',       '3-email recovery over 5 days.', 'behavior', 1, 3),
(4, 'demo_noshow_pa',     'Demo No-Show — PA',       '3-email recovery over 5 days.', 'behavior', 2, 3),
(4, 'demo_noshow_app',    'Demo No-Show — Appraiser','3-email recovery over 5 days.', 'behavior', 3, 3),
(4, 'demo_noshow_hvac',   'Demo No-Show — HVAC',     '3-email recovery over 5 days.', 'behavior', 4, 3),
(4, 'demo_noshow_carrier','Demo No-Show — Carrier',  '3-email recovery over 5 days.', 'behavior', 5, 3);

-- Review request — Day 30
INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, total_steps) VALUES
(4, 'review_d30',  'Review Request — Day 30 Post-Convert', 'One email asking for review/internal recommendation.', 'schedule', 1);

-- Webinar follow-up
INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, total_steps) VALUES
(4, 'webinar_followup', 'Webinar Follow-Up — Universal', '5-email follow-up: thanks/replay/trial-offer/question/next-month.', 'tag_added', 5);

-- Sequence steps — populate based on templates we just inserted.
-- Cold GC sequence
INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0  AS delay_days, 'cold_gc_d1' AS slug UNION ALL
  SELECT 2, 3,  'cold_gc_d3' UNION ALL
  SELECT 3, 5,  'cold_gc_d5' UNION ALL
  SELECT 4, 8,  'cold_gc_d8' UNION ALL
  SELECT 5, 12, 'cold_gc_d12' UNION ALL
  SELECT 6, 16, 'cold_gc_d16' UNION ALL
  SELECT 7, 21, 'cold_gc_d21'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'cold_gc_restoration_2026';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'cold_pa_d1' AS slug UNION ALL
  SELECT 2, 3, 'cold_pa_d3' UNION ALL
  SELECT 3, 5, 'cold_pa_d5' UNION ALL
  SELECT 4, 8, 'cold_pa_d8' UNION ALL
  SELECT 5, 12,'cold_pa_d12' UNION ALL
  SELECT 6, 16,'cold_pa_d16' UNION ALL
  SELECT 7, 21,'cold_pa_d21'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'cold_public_adjuster_2026';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'cold_app_d1' AS slug UNION ALL
  SELECT 2, 3, 'cold_app_d3' UNION ALL
  SELECT 3, 5, 'cold_app_d5' UNION ALL
  SELECT 4, 8, 'cold_app_d8' UNION ALL
  SELECT 5, 12,'cold_app_d12' UNION ALL
  SELECT 6, 16,'cold_app_d16' UNION ALL
  SELECT 7, 21,'cold_app_d21'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'cold_appraiser_2026';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'cold_hvac_d1' AS slug UNION ALL
  SELECT 2, 3, 'cold_hvac_d3' UNION ALL
  SELECT 3, 5, 'cold_hvac_d5' UNION ALL
  SELECT 4, 8, 'cold_hvac_d8' UNION ALL
  SELECT 5, 12,'cold_hvac_d12' UNION ALL
  SELECT 6, 16,'cold_hvac_d16' UNION ALL
  SELECT 7, 21,'cold_hvac_d21'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'cold_hvac_2026';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'cold_carrier_d1' AS slug UNION ALL
  SELECT 2, 3, 'cold_carrier_d3' UNION ALL
  SELECT 3, 5, 'cold_carrier_d5' UNION ALL
  SELECT 4, 8, 'cold_carrier_d8' UNION ALL
  SELECT 5, 12,'cold_carrier_d12' UNION ALL
  SELECT 6, 16,'cold_carrier_d16' UNION ALL
  SELECT 7, 21,'cold_carrier_d21'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'cold_carrier_2026';

-- Trial onboarding sequences (5 personas × 4 emails)
INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'trial_d1_gc' AS slug UNION ALL
  SELECT 2, 3, 'trial_d3_gc' UNION ALL
  SELECT 3, 7, 'trial_d7_gc' UNION ALL
  SELECT 4, 13,'trial_d13_gc'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'trial_onboarding_gc';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'trial_d1_pa' AS slug UNION ALL
  SELECT 2, 3, 'trial_d3_pa' UNION ALL
  SELECT 3, 7, 'trial_d7_pa' UNION ALL
  SELECT 4, 13,'trial_d13_pa'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'trial_onboarding_pa';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'trial_d1_app' AS slug UNION ALL
  SELECT 2, 3, 'trial_d3_app' UNION ALL
  SELECT 3, 7, 'trial_d7_app' UNION ALL
  SELECT 4, 13,'trial_d13_app'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'trial_onboarding_app';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'trial_d1_hvac' AS slug UNION ALL
  SELECT 2, 3, 'trial_d3_hvac' UNION ALL
  SELECT 3, 7, 'trial_d7_hvac' UNION ALL
  SELECT 4, 13,'trial_d13_hvac'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'trial_onboarding_hvac';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'trial_d1_carrier' AS slug UNION ALL
  SELECT 2, 3, 'trial_d3_carrier' UNION ALL
  SELECT 3, 7, 'trial_d7_carrier' UNION ALL
  SELECT 4, 13,'trial_d13_carrier'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'trial_onboarding_carrier';

-- Demo no-show sequences (5 personas × 3 emails)
INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 1 AS delay_days, 'noshow_1_gc' AS slug UNION ALL
  SELECT 2, 3, 'noshow_3_gc' UNION ALL
  SELECT 3, 5, 'noshow_5_gc'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'demo_noshow_gc';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 1 AS delay_days, 'noshow_1_pa' AS slug UNION ALL
  SELECT 2, 3, 'noshow_3_pa' UNION ALL
  SELECT 3, 5, 'noshow_5_pa'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'demo_noshow_pa';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 1 AS delay_days, 'noshow_1_app' AS slug UNION ALL
  SELECT 2, 3, 'noshow_3_app' UNION ALL
  SELECT 3, 5, 'noshow_5_app'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'demo_noshow_app';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 1 AS delay_days, 'noshow_1_hvac' AS slug UNION ALL
  SELECT 2, 3, 'noshow_3_hvac' UNION ALL
  SELECT 3, 5, 'noshow_5_hvac'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'demo_noshow_hvac';

INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 1 AS delay_days, 'noshow_1_carrier' AS slug UNION ALL
  SELECT 2, 3, 'noshow_3_carrier' UNION ALL
  SELECT 3, 5, 'noshow_5_carrier'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'demo_noshow_carrier';

-- Review request — Day 30 (one step, picks the right template at send time via persona_id)
-- Webinar follow-up (5 steps)
INSERT INTO sequence_steps (sequence_id, step_order, step_type, delay_days, email_template_id)
SELECT s.id, t.step_order, 'email', t.delay_days, et.id
FROM email_sequences s
JOIN (
  SELECT 1 AS step_order, 0 AS delay_days, 'webinar_thanks_attended' AS slug UNION ALL
  SELECT 2, 1, 'webinar_thanks_replay' UNION ALL
  SELECT 3, 2, 'webinar_trial_offer' UNION ALL
  SELECT 4, 4, 'webinar_question_followup' UNION ALL
  SELECT 5, 21,'webinar_next_month'
) t ON 1=1
JOIN email_templates et ON et.slug = t.slug AND et.account_id = 4
WHERE s.account_id = 4 AND s.slug = 'webinar_followup';

-- ============================================================================
-- M-4: 1 monthly webinar template + 6 case studies
-- ============================================================================

INSERT INTO webinars (account_id, slug, title, description, presenter, scheduled_at, duration_minutes) VALUES
(4, 'how_contractors_save_8_hrs_jul2026', 'How Contractors Save 8 Hours/Week with CADsuite', 'Live walkthrough of how Robin Hood Roofing runs their entire restoration shop on CADsuite — Contractor CRM, Supplementer, StormWatch, Canvasser. Q&A.', 'Darin Johnson', '2026-07-09 18:00:00', 45);

INSERT INTO case_studies (account_id, slug, title, customer_name, industry, persona_id, product_id, problem_md, solution_md, results_md, quote, format, is_published) VALUES
(4, 'robin_hood_roofing', 'Robin Hood Roofing Cuts Admin Time 41%', 'Robin Hood Roofing', 'Roofing / Restoration', 1, @pid_contractor,
  '## Problem\n\nRobin Hood Roofing was managing 200+ active jobs across Excel, Gmail, and sticky notes. Supplements fell through. Insurance follow-ups got lost.',
  '## Solution\n\nMigrated to Contractor CRM with Supplementer + StormWatch + Canvasser. Phased rollout over 6 weeks.',
  '## Results\n\n- 41% reduction in admin time per job\n- $18K/mo additional captured supplements (Year 1 average)\n- 8 reps + 4 admin staff on Communicator instead of group texts\n- Zero missed insurance follow-ups in Q1 2026',
  '"We tried JobNimbus, AccuLynx, and Buildertrend. CADsuite is the first one built BY contractors. Different category."',
  'written', 1),
(4, 'apex_appraisal_group', 'Apex Appraisal Group Doubles Throughput', 'Apex Appraisal Group', 'Insurance Appraisal', 3, @pid_appraisers,
  '## Problem\n\n5-appraiser shop running on Excel + shared Dropbox. Couldn''t scale past 40 active assignments per appraiser.',
  '## Solution\n\nAppraisers CRM rollout, 1 appraiser at a time. Imported active files via CSV. Connected Gmail for journal capture.',
  '## Results\n\n- Avg active load increased from 38 → 76 per appraiser\n- Invoice cycle time: 14 days → 3 days\n- Umpire workflow eliminated a 4-hour-per-engagement bookkeeping task',
  '"The umpire workflow alone paid for the entire subscription in the first 90 days."',
  'written', 1),
(4, 'integrity_claims_pa', 'Integrity Claims PA Wins 3× More Supplements', 'Integrity Claims Consulting', 'Public Adjusting', 2, @pid_estimateeval,
  '## Problem\n\nSolo PA losing supplement arguments because they couldn''t produce per-line evidence quickly.',
  '## Solution\n\nEstimate Evaluator + ScopeCritic + Policy Review AI bundle.',
  '## Results\n\n- 3.2× supplement win rate\n- Avg time from claim intake to submitted supplement: 9 days → 3 days\n- Won an appraisal hearing using a side-by-side Estimate Evaluator PDF as evidence',
  '"The side-by-side PDF was the smoking gun. The umpire pointed at it and ruled in our favor."',
  'written', 1),
(4, 'arctic_comfort_hvac', 'Arctic Comfort HVAC Saves $6K/mo on Phone', 'Arctic Comfort HVAC', 'HVAC Service', 4, @pid_hvac,
  '## Problem\n\nPaying $1,400/mo for after-hours answering service + losing 12% of dispatched calls to no-shows.',
  '## Solution\n\nHVAC CRM with AnswerLine + dispatch board + SMS notification.',
  '## Results\n\n- Cancelled answering service (saved $1,400/mo)\n- No-show rate dropped 12% → 2.8%\n- Maintenance agreement attach rate up 31%',
  '"AnswerLine answered a 2 AM no-heat call last winter, dispatched my on-call tech, customer paid in full. Saved a $1,800 install."',
  'written', 1),
(4, 'stormcrest_restoration_video', 'StormCrest Hits 30% of Knocks (Video)', 'StormCrest Restoration', 'Restoration', 1, @pid_canvasser,
  '## Problem\n\nCanvassing team knocking the same doors twice. No storm overlay.',
  '## Solution\n\nCanvasser with hail overlay + duplicate-knock warnings.',
  '## Results\n\n- 30% appointment-set rate on knocks (industry avg: 8%)\n- 41 net new contracted jobs from one storm in March 2026',
  '"Watching my reps light up when they see the hail overlay — they go straight to the hardest-hit street."',
  'video', 1),
(4, 'darin_robin_acculynx_migration_video', 'Nelrock Switches from AccuLynx in 14 Days (Video)', 'Nelrock Contracting', 'Restoration / Roofing', 1, @pid_contractor,
  '## Problem\n\nGrowing 8-rep restoration shop hitting AccuLynx''s ceiling. Wanted CADsuite''s supplement workflow + cost savings.',
  '## Solution\n\nUsed the AccuLynx Migrator tool. Active jobs migrated first; closed history followed.',
  '## Results\n\n- Migration completed in 14 calendar days, zero downtime\n- $1,386/mo subscription replaced ~$3,400/mo AccuLynx + add-ons\n- All 8 reps active in CADsuite by Day 7',
  '"My team didn''t even feel the switch. The migration tool kept everything intact."',
  'video', 1);

-- ============================================================================
-- M-5: Ad pixel placeholders
-- ============================================================================

INSERT INTO ad_pixels (account_id, platform, pixel_id, is_active, config) VALUES
(4, 'meta', NULL, 0, JSON_OBJECT('note', 'Add Meta Pixel ID + Conversion API token before activating.')),
(4, 'linkedin', NULL, 0, JSON_OBJECT('note', 'Add LinkedIn Insight Tag partner ID before activating.')),
(4, 'google', NULL, 0, JSON_OBJECT('note', 'Add Google Ads conversion ID + label, plus GA4 measurement ID.'));

INSERT INTO retargeting_audiences (account_id, name, platform, window_days, source_filter) VALUES
(4, 'Landing page visitors — 30 day', 'meta', 30, JSON_OBJECT('event', 'page_view')),
(4, 'Landing page visitors — 60 day', 'meta', 60, JSON_OBJECT('event', 'page_view')),
(4, 'Landing page visitors — 90 day', 'meta', 90, JSON_OBJECT('event', 'page_view')),
(4, 'Trial started, did not convert', 'meta', 30, JSON_OBJECT('event', 'trial_started', 'not_event', 'paid')),
(4, 'Demo no-show', 'meta', 14, JSON_OBJECT('event', 'demo_booked', 'not_event', 'demo_attended')),
(4, 'Landing page visitors — 30 day', 'linkedin', 30, JSON_OBJECT('event', 'page_view')),
(4, 'Trial started, did not convert', 'linkedin', 30, JSON_OBJECT('event', 'trial_started', 'not_event', 'paid'));

-- ============================================================================
-- M-6: Partner program scaffold
-- ============================================================================

-- Founder partner — Darin himself, used as the prototype tier
INSERT INTO partners (account_id, contact_name, contact_email, company_name, tier, commission_pct, commission_months, is_active) VALUES
(4, 'CADsuite Founders Program', 'partners@cadsuite.com', 'CADsuite Internal Founders', 'platinum', 20.00, 12, 1);

-- ============================================================================
-- M-7: Review request — already seeded as 5 templates + 1 sequence above
-- ============================================================================

-- ============================================================================
-- M-8: Pricing plans (Trial + Monthly + Yearly per product)
-- ============================================================================

INSERT INTO pricing_plans (account_id, product_id, slug, name, description, monthly_price, yearly_price, trial_days, features_json, is_featured, sort_order) VALUES
-- Contractor CRM
(4, @pid_contractor, 'contractor-monthly', 'Contractor CRM — Monthly', 'Per licensed user', 99.00, NULL, 14, JSON_ARRAY('Jobs','Supplements','Gmail/Outlook sync','Mobile app','StormWatch alerts','Permit lookup','$10/seat AI'), 1, 10),
(4, @pid_contractor, 'contractor-yearly', 'Contractor CRM — Yearly', 'Per licensed user, billed annually (save 17%)', NULL, 990.00, 14, JSON_ARRAY('Everything in monthly','17% savings','Priority support'), 0, 11),
-- Supplementer
(4, @pid_supplementer, 'supplementer-monthly', 'Supplementer — Monthly', 'Per user', 79.00, NULL, 14, JSON_ARRAY('Carrier templates','Line-item library','Photo annotation','QBO invoicing','AI writing assist'), 1, 20),
(4, @pid_supplementer, 'supplementer-yearly', 'Supplementer — Yearly', 'Per user, billed annually', NULL, 790.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 21),
-- Appraisers
(4, @pid_appraisers, 'appraisers-monthly', 'Appraisers CRM — Monthly', 'Per user', 89.00, NULL, 14, JSON_ARRAY('Assignment intake','Exhibit library','Umpire workflow','QBO invoicing','Mobile app'), 1, 30),
(4, @pid_appraisers, 'appraisers-yearly', 'Appraisers CRM — Yearly', 'Per user, billed annually', NULL, 890.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 31),
-- StormWatch
(4, @pid_stormwatch, 'stormwatch-monthly', 'StormWatch — Monthly', 'Per user', 39.00, NULL, 14, JSON_ARRAY('Real-time hail+wind','Service area zones','Storm history','Email+SMS+push'), 1, 40),
(4, @pid_stormwatch, 'stormwatch-yearly', 'StormWatch — Yearly', 'Per user', NULL, 390.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 41),
-- Policy Review
(4, @pid_policyreview, 'policy-review-monthly', 'Policy Review AI — Monthly', 'Per user, page-based data cap', 49.00, NULL, 14, JSON_ARRAY('11 review types','Page-cited findings','Endorsement detection','PDF report','Buy-more-pages'), 1, 50),
(4, @pid_policyreview, 'policy-review-yearly', 'Policy Review AI — Yearly', 'Per user, billed annually', NULL, 490.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 51),
-- Estimate Evaluator
(4, @pid_estimateeval, 'estimate-evaluator-monthly', 'Estimate Evaluator — Monthly', 'Per user', 59.00, NULL, 14, JSON_ARRAY('2- or 3-way compare','Bundled-item display','Elevation downspout detection','Agree/Disagree workflow'), 1, 60),
(4, @pid_estimateeval, 'estimate-evaluator-yearly', 'Estimate Evaluator — Yearly', 'Per user, billed annually', NULL, 590.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 61),
-- EZ-Inspect
(4, @pid_ezinspect, 'ez-inspect-monthly', 'EZ-Inspect — Monthly', 'Per user', 49.00, NULL, 14, JSON_ARRAY('Wall diagram builder','Window/door database','Offline photo capture','PDF report','iOS+Android'), 1, 70),
(4, @pid_ezinspect, 'ez-inspect-yearly', 'EZ-Inspect — Yearly', 'Per user, billed annually', NULL, 490.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 71),
-- Canvasser
(4, @pid_canvasser, 'canvasser-starter', 'Canvasser Starter', 'Per knocker', 24.95, NULL, 14, JSON_ARRAY('Storm overlay','Duplicate-knock warning','Mobile app'), 0, 80),
(4, @pid_canvasser, 'canvasser-pro', 'Canvasser Pro', 'Per knocker', 49.95, NULL, 14, JSON_ARRAY('Everything in Starter','Re-knock queue','Team leaderboards','Bulk area clear'), 1, 81),
-- Communicator
(4, @pid_communicator, 'communicator-monthly', 'Communicator — Monthly', 'Per user', 29.00, NULL, 14, JSON_ARRAY('Internal channels','Customer SMS','AI summary','Tasks','RingCentral integration'), 1, 90),
(4, @pid_communicator, 'communicator-yearly', 'Communicator — Yearly', 'Per user, billed annually', NULL, 290.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 91),
-- Plan Takeoff
(4, @pid_plantakeoff, 'plan-takeoff-monthly', 'Plan Takeoff AI — Monthly', 'Per user, token-based data cap', 79.00, NULL, 14, JSON_ARRAY('Multi-trade batch','Trade presets','Confidence scoring','Cost estimating','Buy-more-tokens'), 1, 100),
(4, @pid_plantakeoff, 'plan-takeoff-yearly', 'Plan Takeoff AI — Yearly', 'Per user, billed annually', NULL, 790.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 101),
-- ScopeCritic
(4, @pid_scopecritic, 'scope-critic-monthly', 'ScopeCritic — Monthly', 'Per user', 39.00, NULL, 14, JSON_ARRAY('Per-line audit','Catalog-aware','Missing companion item flags','PDF audit report'), 1, 110),
(4, @pid_scopecritic, 'scope-critic-yearly', 'ScopeCritic — Yearly', 'Per user, billed annually', NULL, 390.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 111),
-- HVAC CRM
(4, @pid_hvac, 'hvac-monthly', 'HVAC CRM — Monthly', 'Per user, AnswerLine included', 79.00, NULL, 14, JSON_ARRAY('Dispatch board','Maintenance agreements','AnswerLine AI receptionist','Truck inventory','Service history'), 1, 120),
(4, @pid_hvac, 'hvac-yearly', 'HVAC CRM — Yearly', 'Per user, billed annually', NULL, 790.00, 14, JSON_ARRAY('Everything in monthly','17% savings'), 0, 121),
-- Study Pass Build
(4, @pid_study, 'study-pass-monthly', 'Study Pass Build', 'Per user', 99.00, NULL, 0, JSON_ARRAY('17-state coverage','244+ study modules','5,000+ exam questions','Anki-style flashcards','Offline PWA'), 1, 130);

-- Billing settings — placeholder until Authorize.net creds are loaded
INSERT INTO billing_settings (account_id, authnet_environment, default_currency, receipt_email) VALUES
(4, 'sandbox', 'USD', 'orders@cadsuite.com');

-- ============================================================================
-- M-9: Content calendar (8 weeks × 4 posts) + 8 published blog posts
-- ============================================================================

-- 32 calendar entries seeded for the first 8 weeks (top-of-funnel SEO + bottom-of-funnel comparison)
INSERT INTO content_calendar (account_id, scheduled_date, content_type, title, target_keyword, funnel_stage, target_persona_id, target_product_id, status) VALUES
-- Week 1
(4, '2026-06-15', 'blog', 'Best Supplement Software for Restoration Contractors in 2026', 'best supplement software', 'mid', 1, @pid_supplementer, 'idea'),
(4, '2026-06-16', 'blog', 'Xactimate Alternative for Public Adjusters', 'xactimate alternative', 'mid', 2, @pid_estimateeval, 'idea'),
(4, '2026-06-18', 'blog', 'How to Read a Homeowners Insurance Policy in 10 Minutes', 'how to read homeowners insurance policy', 'top', 2, @pid_policyreview, 'idea'),
(4, '2026-06-19', 'social', 'Twitter thread — Why elevation items are downspouts, not gutters', 'elevation downspout vs gutter', 'top', 2, @pid_estimateeval, 'idea'),
-- Week 2
(4, '2026-06-22', 'blog', 'Roof Estimating Software for Small Restoration Shops', 'roof estimating software', 'mid', 1, @pid_contractor, 'idea'),
(4, '2026-06-23', 'blog', 'AccuLynx Alternative for Restoration Contractors', 'acculynx alternative', 'bottom', 1, @pid_contractor, 'idea'),
(4, '2026-06-25', 'blog', 'What is Bundled Pricing in Insurance Estimates?', 'bundled pricing insurance estimate', 'top', 1, @pid_estimateeval, 'idea'),
(4, '2026-06-26', 'video', 'Loom: 5-min Estimate Evaluator demo', 'estimate evaluator demo', 'mid', 2, @pid_estimateeval, 'idea'),
-- Week 3
(4, '2026-06-29', 'blog', 'JobNimbus vs Contractor CRM: 2026 Comparison', 'jobnimbus vs cadsuite', 'bottom', 1, @pid_contractor, 'idea'),
(4, '2026-06-30', 'blog', '7 Line Items Insurance Carriers Hope You Forget', 'commonly missed xactimate items', 'top', 1, @pid_scopecritic, 'idea'),
(4, '2026-07-02', 'blog', 'How to Spot a Hail-Damaged Roof from the Ground', 'hail damage roof inspection', 'top', 1, @pid_stormwatch, 'idea'),
(4, '2026-07-03', 'social', 'LinkedIn carousel — 11 review types every PA should know', '11 policy review types', 'top', 2, @pid_policyreview, 'idea'),
-- Week 4
(4, '2026-07-06', 'blog', 'ServiceTitan Alternative for Small HVAC Shops', 'servicetitan alternative', 'bottom', 4, @pid_hvac, 'idea'),
(4, '2026-07-07', 'blog', 'Public Adjuster Software That Actually Tracks Claims', 'public adjuster software', 'mid', 2, @pid_policyreview, 'idea'),
(4, '2026-07-09', 'webinar', 'Live Webinar: How Contractors Save 8 Hours/Week with CADsuite', 'cadsuite webinar', 'mid', 1, @pid_contractor, 'idea'),
(4, '2026-07-10', 'blog', 'How to Price Your Annual HVAC Maintenance Agreement', 'hvac maintenance agreement pricing', 'top', 4, @pid_hvac, 'idea'),
-- Week 5
(4, '2026-07-13', 'blog', 'Best Door-Knock App for Storm Restoration in 2026', 'storm restoration door knock app', 'mid', 1, @pid_canvasser, 'idea'),
(4, '2026-07-14', 'blog', 'How to Track Umpire Conflicts as an Independent Appraiser', 'umpire conflict tracking', 'top', 3, @pid_appraisers, 'idea'),
(4, '2026-07-16', 'blog', 'O&P Pro-Rate Math: When Carriers Get It Wrong', 'op pro rate xactimate', 'top', 2, @pid_scopecritic, 'idea'),
(4, '2026-07-17', 'video', 'Loom: Walk-through of the Estimate Evaluator agree/disagree workflow', 'agree disagree workflow', 'mid', 2, @pid_estimateeval, 'idea'),
-- Week 6
(4, '2026-07-20', 'blog', 'How AI Can Read a 70-Page Policy in 90 Seconds', 'ai policy review', 'top', 2, @pid_policyreview, 'idea'),
(4, '2026-07-21', 'blog', 'Buildertrend vs Contractor CRM for Restoration', 'buildertrend alternative restoration', 'bottom', 1, @pid_contractor, 'idea'),
(4, '2026-07-23', 'blog', 'How to Pass the Colorado Roofing Contractor Exam First Try', 'colorado roofing contractor exam', 'top', 1, @pid_study, 'idea'),
(4, '2026-07-24', 'social', 'X thread — How we built ScopeCritic on top of the Xactimate catalog', 'scope critic build story', 'top', 2, @pid_scopecritic, 'idea'),
-- Week 7
(4, '2026-07-27', 'blog', 'Best CRM for HVAC Service Companies', 'best hvac crm', 'mid', 4, @pid_hvac, 'idea'),
(4, '2026-07-28', 'blog', 'How to Buy More Data When You Hit Your Policy Review Cap', 'policy review buy more pages', 'bottom', 2, @pid_policyreview, 'idea'),
(4, '2026-07-30', 'blog', 'Inside the CADsuite Permit Lookup Module', 'permit lookup software', 'top', 1, @pid_contractor, 'idea'),
(4, '2026-07-31', 'case_study', 'Case Study: Nelrock Switches from AccuLynx in 14 Days', 'acculynx migration case study', 'bottom', 1, @pid_contractor, 'idea'),
-- Week 8
(4, '2026-08-03', 'blog', '5 Trades AI Can Take Off Better Than You', 'ai takeoff', 'top', 1, @pid_plantakeoff, 'idea'),
(4, '2026-08-04', 'blog', 'HousecallPro vs CADsuite HVAC CRM', 'housecall pro vs cadsuite', 'bottom', 4, @pid_hvac, 'idea'),
(4, '2026-08-06', 'blog', 'How to Set Up Storm Alerts for Your Service Area', 'storm alert setup', 'top', 1, @pid_stormwatch, 'idea'),
(4, '2026-08-07', 'video', 'Customer Spotlight: Robin Hood Roofing', 'robin hood roofing case study', 'bottom', 1, @pid_contractor, 'idea');

-- 8 published blog post seeds (first 8 from week 1-2)
INSERT INTO blog_posts (account_id, slug, title, excerpt, body_md, target_keyword, persona_id, product_id, funnel_stage, published_at, is_published) VALUES
(4, 'best-supplement-software-2026', 'Best Supplement Software for Restoration Contractors in 2026', 'Side-by-side breakdown of the top 6 supplement tools restoration contractors are using in 2026.', '# Best Supplement Software for Restoration Contractors in 2026\n\n[Long-form post — outline]\n\n1. Why supplementing matters\n2. What to look for in a supplement tool\n3. Top 6 tools side-by-side\n4. Pricing comparison\n5. Recommendation by shop size\n\n## Top tools reviewed\n- Supplementer (CADsuite)\n- Symbility Mobile Claims\n- Estify\n- XactSupplement\n- LossPro\n- HailTrace\n\n## Pricing\n[table]\n\n## Recommendation\n[copy]\n', 'best supplement software', 1, @pid_supplementer, 'mid', '2026-06-15 09:00:00', 1),
(4, 'xactimate-alternative-public-adjuster', 'Xactimate Alternative for Public Adjusters', 'Xactimate is the standard, but you don''t always need to write in it. Here are 4 alternative workflows.', '# Xactimate Alternative for Public Adjusters\n\n[Outline]\n1. Why PAs use Xactimate today\n2. The hidden cost of an Xactimate license\n3. Four alternative workflows\n4. When to switch and when to stick\n\n[Body...]\n', 'xactimate alternative', 2, @pid_estimateeval, 'mid', '2026-06-16 09:00:00', 1),
(4, 'how-to-read-homeowners-policy', 'How to Read a Homeowners Insurance Policy in 10 Minutes', 'A practical guide to reading the 11 most important sections of a homeowners policy fast.', '# How to Read a Homeowners Insurance Policy in 10 Minutes\n\n[Outline]\n1. Declarations page\n2. Definitions\n3. Coverages A-F\n4. Exclusions\n5. Endorsements\n6. Conditions\n7. Ordinance + Law\n8. Sewer/drain backup\n9. Roof surface limitations\n10. Matching\n11. Lawsuit time limit\n\n[Body...]\n', 'how to read homeowners insurance policy', 2, @pid_policyreview, 'top', '2026-06-18 09:00:00', 1),
(4, 'roof-estimating-software-small-shops', 'Roof Estimating Software for Small Restoration Shops', 'You don''t need ServiceTitan-tier software to estimate roofing. Here''s what actually works for 1-10 person shops.', '# Roof Estimating Software for Small Restoration Shops\n\n[Outline]\n1. The Xactimate-only myth\n2. 5 tools for sub-$200K/yr shops\n3. When to add a CRM\n\n[Body...]\n', 'roof estimating software', 1, @pid_contractor, 'mid', '2026-06-22 09:00:00', 1),
(4, 'acculynx-alternative-2026', 'AccuLynx Alternative for Restoration Contractors', 'AccuLynx works, but its pricing keeps climbing. Here are 4 cheaper alternatives with feature comparisons.', '# AccuLynx Alternative for Restoration Contractors\n\n[Outline]\n1. AccuLynx pricing today\n2. 4 alternatives priced + scored\n3. The CADsuite migration story (Nelrock case study link)\n\n[Body...]\n', 'acculynx alternative', 1, @pid_contractor, 'bottom', '2026-06-23 09:00:00', 1),
(4, 'what-is-bundled-pricing', 'What is Bundled Pricing in Insurance Estimates?', 'Bundled bid line items confuse a lot of adjusters and contractors. Here''s the right way to handle them.', '# What is Bundled Pricing in Insurance Estimates?\n\n[Outline]\n1. Definition\n2. When carriers bundle\n3. How to display bundled groups (bid at top, line items below)\n4. Why bundling != lump-sum\n\n[Body...]\n', 'bundled pricing insurance estimate', 1, @pid_estimateeval, 'top', '2026-06-25 09:00:00', 1),
(4, '7-line-items-carriers-hope-you-forget', '7 Line Items Insurance Carriers Hope You Forget', 'The 7 most commonly omitted Xactimate items — and the catalog codes you need to add them.', '# 7 Line Items Insurance Carriers Hope You Forget\n\n[Outline]\n1. Drip edge\n2. Ice + water shield\n3. Ridge vent\n4. Step flashing\n5. Detach + reset HVAC equipment\n6. Drying time (per day)\n7. Permits + fees\n\n[Body...]\n', 'commonly missed xactimate items', 1, @pid_scopecritic, 'top', '2026-06-30 09:00:00', 1),
(4, 'spot-hail-damaged-roof-from-ground', 'How to Spot a Hail-Damaged Roof from the Ground', 'Visual cues to identify hail damage during a door-knock without climbing.', '# How to Spot a Hail-Damaged Roof from the Ground\n\n[Outline]\n1. Hail bruising vs blistering vs granule loss\n2. What to ask the homeowner first\n3. When to recommend insurance claim\n4. When NOT to recommend a claim\n\n[Body...]\n', 'hail damage roof inspection', 1, @pid_stormwatch, 'top', '2026-07-02 09:00:00', 1);

-- ============================================================================
-- M-10: Seed CADsuite pipeline + stages (Lead → MQL → SQL → Trial → Paid → Churn)
-- ============================================================================

INSERT INTO pipelines (account_id, name, is_default, created_at) VALUES (4, 'CADsuite Sales Funnel', 1, NOW());
SET @cs_pipe = LAST_INSERT_ID();

INSERT INTO pipeline_stages (account_id, pipeline_id, name, sort_order, color) VALUES
(4, @cs_pipe, 'Lead', 10, '#94a3b8'),
(4, @cs_pipe, 'MQL', 20, '#3b82f6'),
(4, @cs_pipe, 'SQL', 30, '#8b5cf6'),
(4, @cs_pipe, 'Demo Booked', 40, '#f59e0b'),
(4, @cs_pipe, 'Trial', 50, '#10b981'),
(4, @cs_pipe, 'Paid', 60, '#059669'),
(4, @cs_pipe, 'Churned', 70, '#ef4444');

-- Final reporting check
SELECT 'funnel_products'      n, COUNT(*) v FROM funnel_products       WHERE account_id=4 UNION ALL
SELECT 'landing_pages',          COUNT(*)   FROM landing_pages          WHERE account_id=4 UNION ALL
SELECT 'lead_magnets',           COUNT(*)   FROM lead_magnets           WHERE account_id=4 UNION ALL
SELECT 'email_templates',        COUNT(*)   FROM email_templates        WHERE account_id=4 UNION ALL
SELECT 'email_sequences',        COUNT(*)   FROM email_sequences        WHERE account_id=4 UNION ALL
SELECT 'sequence_steps (joined)',(SELECT COUNT(*) FROM sequence_steps ss JOIN email_sequences es ON es.id=ss.sequence_id WHERE es.account_id=4) UNION ALL
SELECT 'webinars',               COUNT(*)   FROM webinars               WHERE account_id=4 UNION ALL
SELECT 'case_studies',           COUNT(*)   FROM case_studies           WHERE account_id=4 UNION ALL
SELECT 'ad_pixels',              COUNT(*)   FROM ad_pixels              WHERE account_id=4 UNION ALL
SELECT 'retargeting_audiences',  COUNT(*)   FROM retargeting_audiences  WHERE account_id=4 UNION ALL
SELECT 'partners',               COUNT(*)   FROM partners               WHERE account_id=4 UNION ALL
SELECT 'pricing_plans',          COUNT(*)   FROM pricing_plans          WHERE account_id=4 UNION ALL
SELECT 'billing_settings',       COUNT(*)   FROM billing_settings       WHERE account_id=4 UNION ALL
SELECT 'content_calendar',       COUNT(*)   FROM content_calendar       WHERE account_id=4 UNION ALL
SELECT 'blog_posts',             COUNT(*)   FROM blog_posts             WHERE account_id=4 UNION ALL
SELECT 'pipeline_stages',        COUNT(*)   FROM pipeline_stages        WHERE account_id=4 UNION ALL
SELECT 'contacts',               COUNT(*)   FROM contacts               WHERE account_id=4;
