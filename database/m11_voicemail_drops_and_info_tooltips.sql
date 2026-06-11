-- Phase M-11 — Twilio voicemail drops + section help tooltips
-- 2026-06-11

USE cadsuite_marketing;

-- ============================================================================
-- VOICEMAIL DROPS (Twilio Answering Machine Detection — AMD)
-- ============================================================================

-- Pre-recorded voicemail messages. User records once per persona/product, reuses.
CREATE TABLE IF NOT EXISTS voicemail_recordings (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  twilio_recording_sid VARCHAR(120),       -- Twilio asset SID (uploaded via Assets API)
  audio_url VARCHAR(500),                  -- Public mp3/wav URL Twilio can fetch
  duration_seconds INT,
  persona_id INT UNSIGNED,
  product_id INT UNSIGNED,
  transcript TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Twilio config per account
CREATE TABLE IF NOT EXISTS twilio_settings (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL UNIQUE,
  twilio_account_sid VARCHAR(120),
  twilio_auth_token VARCHAR(255),
  twilio_phone_number VARCHAR(30),
  amd_mode ENUM('Enable','DetectMessageEnd') NOT NULL DEFAULT 'DetectMessageEnd',
  daily_drop_cap INT NOT NULL DEFAULT 500,
  per_minute_cap INT NOT NULL DEFAULT 10,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A "drop" is one outbound call attempt. Twilio AMD answers: machine_start
-- → we play the recording. human → we hang up (or escalate to a connect mode).
CREATE TABLE IF NOT EXISTS voicemail_drops (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED NOT NULL,
  recording_id INT UNSIGNED NOT NULL,
  sequence_id INT UNSIGNED,                -- if part of a sequence
  sequence_step_id INT UNSIGNED,
  to_phone VARCHAR(30) NOT NULL,
  twilio_call_sid VARCHAR(120),
  status ENUM('queued','dialing','answered_human','answered_machine','dropped','no_answer','busy','failed','dnc') NOT NULL DEFAULT 'queued',
  amd_result VARCHAR(60),                  -- 'machine_start', 'human', 'fax', 'unknown'
  amd_confidence DECIMAL(5,4),
  duration_seconds INT,
  cost_cents INT,                          -- billed-cents from Twilio price callback
  on_human_action ENUM('hangup','connect_to_rep','play_then_hangup') NOT NULL DEFAULT 'hangup',
  human_connected_to_user_id INT UNSIGNED,
  failure_reason VARCHAR(255),
  scheduled_at DATETIME,
  attempted_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_status (account_id, status, scheduled_at),
  KEY idx_contact (contact_id),
  KEY idx_call_sid (twilio_call_sid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DNC (do not call) registry — checked before every drop is placed.
CREATE TABLE IF NOT EXISTS voicemail_dnc (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  phone VARCHAR(30) NOT NULL,
  reason VARCHAR(255),
  added_by_user_id INT UNSIGNED,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_phone (account_id, phone),
  KEY idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Extend sequence_steps to allow voicemail steps (the step_type ENUM already
-- includes 'sms' and 'call_task'; voicemail drops piggyback on 'call_task'
-- with config.kind='voicemail_drop' and config.recording_id=N).

-- Seed 5 voicemail recording stubs — one per persona, ready for user to
-- record actual audio via Twilio Voice or upload an MP3.
INSERT INTO voicemail_recordings (account_id, slug, name, persona_id, transcript) VALUES
(4, 'vm_gc_intro', 'Voicemail — GC Intro', 1,
 'Hey {first_name}, Darin from CADsuite here. Quick one — I noticed you''re running a restoration shop in {city}, and I wanted to send you a 5-minute walkthrough of how Robin Hood Roofing cut their admin time 41%. Reply to my email or call me back at this number. Thanks.'),
(4, 'vm_pa_intro', 'Voicemail — PA Intro', 2,
 'Hey {first_name}, Darin from CADsuite. We built Policy Review AI specifically for PAs — uploads a policy, gets you an 11-type breakdown in 90 seconds. Free trial if you want to test it. Reply to my email or call me back. Thanks.'),
(4, 'vm_app_intro', 'Voicemail — Appraiser Intro', 3,
 'Hey {first_name}, Darin from CADsuite. We rebuilt Appraisers CRM this year for independent appraisers. Worth a 12-minute look. Reply to my email or call me back.'),
(4, 'vm_hvac_intro', 'Voicemail — HVAC Intro', 4,
 'Hey {first_name}, Darin from CADsuite. HVAC CRM with AnswerLine — the AI receptionist answers your after-hours calls. Free trial. Call me back or reply to my email.'),
(4, 'vm_trial_d12', 'Voicemail — Trial Day 12 Conversion', NULL,
 'Hey {first_name}, Darin from CADsuite. Your trial wraps tomorrow. Quick voicemail to say if you want to lock in your trial-period pricing for 12 months, today is the deadline. Hit reply to my email or call me back. Thanks.');

-- ============================================================================
-- INFO TOOLTIPS — dismissable help bubbles per UI section
-- ============================================================================

-- Help articles per UI section. One row per (section_key, version).
-- Frontend renders an (i) icon next to the section heading; clicking opens
-- a popover with the content. Once the user clicks "Got it", we record the
-- dismissal so the bubble auto-hides on future visits.
CREATE TABLE IF NOT EXISTS section_help (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  section_key VARCHAR(120) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body_md MEDIUMTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  show_by_default TINYINT(1) NOT NULL DEFAULT 1,
  cta_text VARCHAR(80),
  cta_url VARCHAR(500),
  video_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_key_ver (account_id, section_key, version),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS section_help_dismissals (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  section_key VARCHAR(120) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  dismissed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_section (user_id, section_key, version),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed section help for every major UI section.
INSERT INTO section_help (account_id, section_key, title, body_md, cta_text, cta_url) VALUES
(4, 'dashboard.kpis', 'How dashboard KPIs work',
 'These cards pull live numbers from your funnel.\n\n- **Visitors** = unique IPs landing on any of your 13 product pages\n- **Leads** = anyone who filled a lead-magnet form\n- **MQL/SQL** = stage promotions in the CADsuite Sales Funnel pipeline\n- **Trials** = `checkout_sessions` with status=pending\n- **Paid** = `checkout_sessions` with status=succeeded\n\nClick any card to drill into the rows behind it.', 'Open Pipeline', '/deals'),
(4, 'contacts.list', 'Contacts: who shows up here?',
 'Every person who hits one of your funnels lands here. Tag them with a persona on import to drive auto-sequence enrollment.\n\n- Use the **persona filter** to slice by GC, PA, Appraiser, HVAC, Carrier.\n- Bulk-tag the rows to enroll a whole segment into a sequence.\n- The eyeball icon on the search bar toggles hidden columns.', 'See personas', '/personas'),
(4, 'contacts.import', 'Importing contacts',
 'Three ways to import:\n\n1. **CSV upload** — header row `name,email,phone,source,persona_slug`\n2. **Connect Gmail** — auto-pulls contacts you''ve emailed\n3. **CADsuite product sync** — pulls every customer of every product into your funnel automatically\n\nDuplicates by email are merged.', 'Open Importer', '/contacts/import'),
(4, 'sequences.list', 'What is a sequence?',
 'A multi-step automated touch flow. Each step is an email, SMS, voicemail drop, or LinkedIn task with a delay. Contacts enter a sequence via tag, form submit, deal-stage change, or schedule.\n\nThe 17 sequences here are pre-built from the M-3 playbook.', 'See sequence schema', '/help/sequence-schema'),
(4, 'sequences.editor', 'Editing a sequence',
 'Drag steps to reorder. Set day-delays per step. Pick an email template OR write a free-form message. Voicemail-drop steps need a Twilio recording + active Twilio settings — see Settings → Twilio.', 'Twilio Settings', '/settings/twilio'),
(4, 'templates.editor', 'Email template variables',
 'Use `{first_name}`, `{product_name}`, `{monthly_price}`, `{trial_url}`, `{calendar_url}`, `{loom_url}`, `{lead_magnet_url}` and they''ll be filled per-contact at send time.\n\nMarkdown body renders to HTML at send. Plaintext fallback is auto-generated.', 'See all variables', '/help/template-variables'),
(4, 'webinars.list', 'Webinars 101',
 'Each webinar gets a registration page, a confirmation email, a reminder sequence (24h + 1h before), and a 5-step follow-up after.\n\nUse Zoom, Riverside, or our built-in Daily.co room (Settings → Integrations).', NULL, NULL),
(4, 'voicemail.recordings', 'Voicemail drops with Twilio',
 'How it works: we place an outbound Twilio call with Answering Machine Detection. When AMD reports `machine_start`, we play your recording and hang up. When `human` answers, we either hang up silently or connect to a rep based on the step config.\n\nSetup:\n1. Settings → Twilio: paste your Account SID + Auth Token + a verified outbound number\n2. Record each voicemail (or upload mp3) and assign a persona\n3. Add a Voicemail step to any sequence\n\nTwilio cost is ~$0.014 per drop + AMD fee.\n\n**Compliance**: every drop is checked against your DNC list first. Add numbers via the DNC tab.', 'Open Twilio Settings', '/settings/twilio'),
(4, 'voicemail.compliance', 'Voicemail drop compliance',
 'Ringless voicemail is regulated. We strongly recommend:\n\n- Only drop to phones that have given prior consent (web form, signed agreement, prior business relationship)\n- Honor every opt-out within 24 hours\n- Keep daily volume below your `daily_drop_cap` setting\n- Identify yourself in the first 5 seconds of the recording\n\nWe maintain a DNC list and refuse any drop to numbers on it. Bulk-import suppressions in Settings → DNC.', NULL, NULL),
(4, 'pixels.list', 'Setting up tracking pixels',
 'Meta, LinkedIn, Google. Paste your pixel ID + conversion API token, save, and the script tag drops into every landing page automatically.\n\n- **Meta**: Business Manager → Events Manager → Pixel ID + Conversions API access token\n- **LinkedIn**: Campaign Manager → Account Assets → Insight Tag → Partner ID\n- **Google**: Google Ads → Tools → Conversions → Conversion ID + Label, plus GA4 Measurement ID', NULL, NULL),
(4, 'audiences.list', 'Retargeting audiences',
 'We sync 5 default audiences to each platform you connect: 30/60/90-day visitors, trial-no-convert, and demo no-show.\n\nThese rebuild every 24h and push to the ad platform via the audience API. Custom audiences can be defined via the source_filter JSON.', NULL, NULL),
(4, 'partners.list', 'Partner / referral program',
 'Default tier: 20% recurring commission for 12 months on referred accounts that convert to paid.\n\nEach partner gets a unique referral link generator. Track clicks → signups → paid conversions. Commission auto-calculates at month-end into a payable report.', 'Default agreement', '/help/partner-agreement'),
(4, 'reviews.list', 'Review requests (Day 30)',
 'Triggers when a `paid_conversion` event fires 30 days after first paid. Sends one of 5 templates based on the contact''s persona.\n\nSurface at G2, Capterra, Google, Trustpilot, Facebook, LinkedIn, or internal recommendation letter.', NULL, NULL),
(4, 'pricing.list', 'Pricing plans',
 'Each plan has a trial period, monthly + yearly price, and a feature list shown on the landing page.\n\nFlip `is_featured=1` on the plan you want highlighted with a colored badge. Set `authnet_subscription_plan_id` after creating the matching Authorize.net ARB subscription plan.', NULL, NULL),
(4, 'billing.checkout', 'Authorize.net checkout',
 'Sandbox by default. Flip to production after you''ve put real creds in.\n\nWe use Authorize.net CIM for stored cards + ARB for recurring. Per CADsuite-wide rule we never use Stripe.\n\nWebhook URL to paste into Authorize.net: `/api/checkout/webhook`', 'Test card numbers', '/help/test-cards'),
(4, 'content.calendar', 'Content calendar',
 'Plan your posts ahead. Each row has a scheduled date, content type, target keyword, and funnel stage.\n\nDrag rows between dates. Click a row to open the draft. Status flow: idea → outlined → drafting → review → published.', NULL, NULL),
(4, 'blog.list', 'Blog posts',
 'Markdown body, hero image, SEO meta. Publishing flips `is_published=1` and sets `published_at` to now.\n\nUse `target_keyword` to bind to your content calendar entry. Views + conversions auto-count from `funnel_events`.', NULL, NULL),
(4, 'reports.funnel', 'Reading the funnel report',
 'Each row = one day. Columns: visitors, leads, MQLs, SQLs, trials, paid_conversions, MRR added, churned, CAC.\n\nVisitors and leads update in near-real-time. MRR/ARR roll up nightly. CAC = (ad_spend) ÷ (paid_conversions) per row.', NULL, NULL);

-- Set @maxes for end-of-script reporting
SELECT 'voicemail_recordings' n, COUNT(*) v FROM voicemail_recordings WHERE account_id=4 UNION ALL
SELECT 'twilio_settings', COUNT(*) FROM twilio_settings WHERE account_id=4 UNION ALL
SELECT 'section_help', COUNT(*) FROM section_help WHERE account_id=4 UNION ALL
SELECT 'section_help_dismissals', COUNT(*) FROM section_help_dismissals WHERE account_id=4;
