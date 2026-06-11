-- Phase M-12 — Call Center: ACD queues, IVR, agent stations, power dialer, recordings
-- 2026-06-11

USE cadsuite_marketing;

-- ============================================================================
-- AGENTS + STATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_agents (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  station_extension VARCHAR(30),
  outbound_caller_id VARCHAR(30),
  default_skill_tags JSON,
  is_supervisor TINYINT(1) NOT NULL DEFAULT 0,
  max_concurrent_calls TINYINT NOT NULL DEFAULT 1,
  webrtc_client_name VARCHAR(60),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_user (account_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Live ACD presence
CREATE TABLE IF NOT EXISTS agent_presence (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  agent_id INT UNSIGNED NOT NULL,
  status ENUM('offline','available','busy','wrapup','away','dnd','training') NOT NULL DEFAULT 'offline',
  status_reason VARCHAR(120),
  status_since DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_call_id BIGINT UNSIGNED,
  UNIQUE KEY uk_agent (agent_id),
  KEY idx_account_status (account_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Status log for reporting (talk-time, AHT, etc.)
CREATE TABLE IF NOT EXISTS agent_status_log (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  agent_id INT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL,
  duration_seconds INT,
  started_at DATETIME NOT NULL,
  ended_at DATETIME,
  KEY idx_agent_started (agent_id, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- QUEUES (ACD)
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_queues (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  ring_strategy ENUM('round_robin','longest_idle','skill_based','simultaneous','priority') NOT NULL DEFAULT 'longest_idle',
  wrapup_seconds INT NOT NULL DEFAULT 15,
  music_on_hold_url VARCHAR(500),
  max_wait_seconds INT NOT NULL DEFAULT 600,
  overflow_to_voicemail_id INT UNSIGNED,
  overflow_to_queue_id INT UNSIGNED,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS queue_agents (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  queue_id INT UNSIGNED NOT NULL,
  agent_id INT UNSIGNED NOT NULL,
  priority TINYINT NOT NULL DEFAULT 5,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_queue_agent (queue_id, agent_id),
  FOREIGN KEY (queue_id) REFERENCES call_queues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Live queue of waiting calls
CREATE TABLE IF NOT EXISTS queue_calls (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  queue_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  twilio_call_sid VARCHAR(120) NOT NULL UNIQUE,
  from_phone VARCHAR(30) NOT NULL,
  to_phone VARCHAR(30) NOT NULL,
  enqueued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  routed_to_agent_id INT UNSIGNED,
  routed_at DATETIME,
  abandoned_at DATETIME,
  position_in_queue INT,
  status ENUM('waiting','routing','answered','abandoned','overflowed') NOT NULL DEFAULT 'waiting',
  KEY idx_queue_status (queue_id, status, enqueued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- IVR (interactive voice response)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ivr_menus (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(150) NOT NULL,
  greeting_text TEXT,
  greeting_audio_url VARCHAR(500),
  timeout_seconds INT NOT NULL DEFAULT 10,
  max_attempts TINYINT NOT NULL DEFAULT 3,
  on_timeout_action ENUM('repeat','queue','voicemail','hangup','dial') NOT NULL DEFAULT 'repeat',
  on_timeout_target VARCHAR(120),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ivr_options (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  menu_id INT UNSIGNED NOT NULL,
  digit VARCHAR(2) NOT NULL,
  label VARCHAR(120),
  action ENUM('queue','voicemail','dial','submenu','hangup','play','transfer_external') NOT NULL,
  target VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_menu_digit (menu_id, digit),
  FOREIGN KEY (menu_id) REFERENCES ivr_menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- LIVE CALLS + RECORDINGS + TRANSCRIPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS active_calls (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  twilio_call_sid VARCHAR(120) NOT NULL UNIQUE,
  direction ENUM('inbound','outbound','internal') NOT NULL,
  from_phone VARCHAR(30) NOT NULL,
  to_phone VARCHAR(30) NOT NULL,
  contact_id INT UNSIGNED,
  agent_id INT UNSIGNED,
  queue_id INT UNSIGNED,
  ivr_menu_id INT UNSIGNED,
  status ENUM('ringing','queued','in_progress','on_hold','transferring','completed','failed','busy','no_answer','cancelled') NOT NULL DEFAULT 'ringing',
  is_recording TINYINT(1) NOT NULL DEFAULT 0,
  is_supervisor_monitoring TINYINT(1) NOT NULL DEFAULT 0,
  supervisor_user_id INT UNSIGNED,
  supervisor_mode ENUM('listen','whisper','barge') DEFAULT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  ended_at DATETIME,
  duration_seconds INT,
  hold_seconds INT NOT NULL DEFAULT 0,
  talk_seconds INT NOT NULL DEFAULT 0,
  wrapup_seconds INT NOT NULL DEFAULT 0,
  hangup_cause VARCHAR(120),
  KEY idx_account_status (account_id, status),
  KEY idx_agent (agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS call_recordings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  active_call_id BIGINT UNSIGNED,
  twilio_recording_sid VARCHAR(120) NOT NULL,
  recording_url VARCHAR(500) NOT NULL,
  duration_seconds INT NOT NULL,
  transcript LONGTEXT,
  transcript_provider VARCHAR(40),
  sentiment_score DECIMAL(4,3),
  topics JSON,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_created (account_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS call_dispositions (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(60) NOT NULL,
  label VARCHAR(120) NOT NULL,
  category ENUM('outcome','followup','escalation','do_not_call') NOT NULL DEFAULT 'outcome',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS call_outcomes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  active_call_id BIGINT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  agent_id INT UNSIGNED NOT NULL,
  disposition_id INT UNSIGNED,
  notes TEXT,
  next_action ENUM('callback','email','sequence','task','none') NOT NULL DEFAULT 'none',
  next_action_at DATETIME,
  followup_assigned_to INT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_created (account_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- POWER / PREDICTIVE DIALER
-- ============================================================================

CREATE TABLE IF NOT EXISTS dialer_campaigns (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  dial_mode ENUM('preview','progressive','power','predictive') NOT NULL DEFAULT 'power',
  lines_per_agent TINYINT NOT NULL DEFAULT 2,
  pacing_ratio DECIMAL(3,1) NOT NULL DEFAULT 1.5,
  max_attempts_per_contact TINYINT NOT NULL DEFAULT 4,
  retry_interval_hours INT NOT NULL DEFAULT 24,
  caller_id VARCHAR(30),
  script_md MEDIUMTEXT,
  amd_action ENUM('hangup','voicemail_drop','queue_human','play') NOT NULL DEFAULT 'voicemail_drop',
  amd_voicemail_recording_id INT UNSIGNED,
  status ENUM('draft','running','paused','completed','archived') NOT NULL DEFAULT 'draft',
  contact_filter_json JSON,
  total_contacts INT UNSIGNED NOT NULL DEFAULT 0,
  attempted INT UNSIGNED NOT NULL DEFAULT 0,
  connected_human INT UNSIGNED NOT NULL DEFAULT 0,
  voicemail_dropped INT UNSIGNED NOT NULL DEFAULT 0,
  abandoned INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dialer_attempts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED NOT NULL,
  attempt_number TINYINT NOT NULL DEFAULT 1,
  status ENUM('queued','dialing','answered_human','answered_machine','dropped','no_answer','busy','failed','dnc') NOT NULL DEFAULT 'queued',
  twilio_call_sid VARCHAR(120),
  agent_id INT UNSIGNED,
  amd_result VARCHAR(40),
  duration_seconds INT,
  scheduled_at DATETIME,
  attempted_at DATETIME,
  completed_at DATETIME,
  KEY idx_campaign_status (campaign_id, status, scheduled_at),
  KEY idx_contact (contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SEED — 3 queues, 1 IVR, default dispositions, 1 power-dial campaign
-- ============================================================================

INSERT INTO call_queues (account_id, slug, name, description, ring_strategy, wrapup_seconds) VALUES
(4, 'inbound_sales',   'Inbound — Sales',          'New product inquiries from web + phone',     'longest_idle', 20),
(4, 'inbound_support', 'Inbound — Support',        'Existing customers calling for help',         'skill_based',  30),
(4, 'inbound_billing', 'Inbound — Billing',        'Billing + payment + invoicing questions',     'round_robin',  15);

INSERT INTO ivr_menus (account_id, slug, name, greeting_text, timeout_seconds, on_timeout_action, on_timeout_target) VALUES
(4, 'main', 'Main IVR', 'Thanks for calling CADsuite. For sales, press 1. For support, press 2. For billing, press 3. To speak with a human, press 0 or stay on the line.', 8, 'queue', 'inbound_sales');

SET @ivr_main = LAST_INSERT_ID();
INSERT INTO ivr_options (menu_id, digit, label, action, target, sort_order) VALUES
(@ivr_main, '1', 'Sales',   'queue',     'inbound_sales',   10),
(@ivr_main, '2', 'Support', 'queue',     'inbound_support', 20),
(@ivr_main, '3', 'Billing', 'queue',     'inbound_billing', 30),
(@ivr_main, '0', 'Operator','queue',     'inbound_sales',   40),
(@ivr_main, '9', 'Hours',   'play',      'tts:Our office is open Monday through Friday from 8am to 6pm Mountain Time.', 50);

-- Default dispositions
INSERT INTO call_dispositions (account_id, slug, label, category, sort_order) VALUES
(4, 'connected_demo_booked', 'Connected — Demo Booked',  'outcome',     10),
(4, 'connected_no_interest', 'Connected — No Interest',   'outcome',     20),
(4, 'connected_callback',    'Connected — Callback',      'followup',    30),
(4, 'left_voicemail',        'Left Voicemail',            'outcome',     40),
(4, 'no_answer',             'No Answer',                 'outcome',     50),
(4, 'wrong_number',          'Wrong Number',              'outcome',     60),
(4, 'do_not_call',           'Do Not Call',               'do_not_call', 70),
(4, 'transferred',           'Transferred',               'escalation',  80);

-- Sample power-dial campaign skeleton — targets CADsuite-customer contacts in cold sequences
INSERT INTO dialer_campaigns (account_id, slug, name, description, dial_mode, lines_per_agent, pacing_ratio, max_attempts_per_contact, caller_id, script_md, amd_action, status, contact_filter_json) VALUES
(4, 'cold_gc_restoration_dial_q3',
 'Power Dial — Cold GC/Restoration Q3 2026',
 'Power dial all GC/Restoration contacts in the Cold-GC-2026 sequence that have NOT replied by step 4.',
 'power', 2, 1.5, 4, '+17204467500',
 '## Opener\n\nHi {first_name}, this is [agent] from CADsuite. I sent you a note about supplement tracking — got a quick minute?\n\n## If yes\nWe built the Contractor CRM around the supplement-tracking gap most restoration shops have. $99 per seat, 14-day trial, no card required.\n\n## If interested\nLet me get you on a 12-minute screen share with our founder Darin — what works better, this afternoon or tomorrow morning?\n\n## If no\nNo worries. Want me to send a 5-min Loom? Easier to watch when you have a sec.',
 'voicemail_drop', 'draft',
 JSON_OBJECT('persona_id', 1, 'tag', 'cadsuite-customer', 'min_sequence_step', 4, 'no_reply', true));

-- Mark the power-dial AMD voicemail recording
UPDATE dialer_campaigns SET amd_voicemail_recording_id = (SELECT id FROM voicemail_recordings WHERE slug='vm_gc_intro' AND account_id=4)
WHERE account_id=4 AND slug='cold_gc_restoration_dial_q3';

-- ============================================================================
-- SECTION HELP for call center
-- ============================================================================

INSERT INTO section_help (account_id, section_key, title, body_md, cta_text, cta_url) VALUES
(4, 'call_center.queues', 'Call queues 101',
 'A queue is a holding pen for inbound callers waiting for an agent. Ring strategy decides who gets the next call:\n\n- **Longest idle** — fairest distribution\n- **Round robin** — strict rotation\n- **Skill-based** — match call tags to agent skills\n- **Simultaneous** — ring everyone (fastest answer)\n- **Priority** — by agent priority order\n\nOverflow lets a call escape to another queue or voicemail after `max_wait_seconds`.', NULL, NULL),
(4, 'call_center.ivr', 'IVR setup',
 'The IVR is the "press 1 for sales" menu. We seeded one Main IVR pointing 1→Sales, 2→Support, 3→Billing, 0→Operator.\n\nRecord a greeting (or use AI text-to-speech). Map each digit to an action (queue, voicemail, dial, submenu).\n\nTwilio will fetch your TwiML from `/api/voice/ivr/{slug}` when the inbound number rings.', NULL, NULL),
(4, 'call_center.agents', 'Agent stations',
 'Each agent gets a WebRTC softphone (browser-based). To go live:\n\n1. Click the headset icon top-right → Go Available\n2. Inbound calls auto-route based on your queue assignments\n3. Click red Hang Up to end, then pick a disposition + notes\n\nSupervisors can listen, whisper, or barge into any active call from the Live Calls board.', 'Open Live Board', '/call-center/live'),
(4, 'call_center.recordings', 'Call recording + transcripts',
 'Every call is recorded if `is_recording=1` on the queue. Twilio sends us the recording, we transcribe via Deepgram (default) or AssemblyAI, run sentiment, surface topics.\n\nTranscripts are searchable. Use the search bar at the top to find calls mentioning a phrase ("billing", "cancel", "supplement").', NULL, NULL),
(4, 'call_center.dialer', 'Power dialer',
 'A power dialer auto-dials your list and connects an agent only when a human answers. AMD (Answering Machine Detection) decides:\n\n- `human` → connect to next available agent\n- `machine_start` → play a voicemail drop and move on\n\nPacing ratio of 1.5 means we dial 1.5 numbers per agent simultaneously (predictive). Lower if you''re hitting abandoned-call thresholds (TCPA: must stay under 3%).', NULL, NULL),
(4, 'call_center.supervisor', 'Supervisor tools',
 'From the Live Calls board, click any active call to:\n\n- **Listen** — silent monitor\n- **Whisper** — agent hears you, caller doesn''t\n- **Barge** — three-way merge into the call\n\nAll three are logged for compliance.', NULL, NULL);

-- Reporting
SELECT 'call_queues' n, COUNT(*) v FROM call_queues WHERE account_id=4 UNION ALL
SELECT 'ivr_menus',     COUNT(*) FROM ivr_menus     WHERE account_id=4 UNION ALL
SELECT 'ivr_options',   (SELECT COUNT(*) FROM ivr_options o JOIN ivr_menus m ON m.id=o.menu_id WHERE m.account_id=4) UNION ALL
SELECT 'call_dispositions', COUNT(*) FROM call_dispositions WHERE account_id=4 UNION ALL
SELECT 'dialer_campaigns', COUNT(*) FROM dialer_campaigns WHERE account_id=4 UNION ALL
SELECT 'section_help (call_center.*)', (SELECT COUNT(*) FROM section_help WHERE account_id=4 AND section_key LIKE 'call_center.%');
