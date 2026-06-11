-- Phases 6, 7, 8 — Automation + Calendar + Funnels
-- 2026-06-11
USE cadsuite_marketing;

-- ============================================================================
-- PHASE 7 — CALENDAR (Calendly-style)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_types (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  buffer_before INT NOT NULL DEFAULT 0,
  buffer_after INT NOT NULL DEFAULT 0,
  min_notice_hours INT NOT NULL DEFAULT 4,
  max_advance_days INT NOT NULL DEFAULT 60,
  location_type ENUM('zoom','google_meet','phone','in_person','custom') NOT NULL DEFAULT 'zoom',
  location_details VARCHAR(500),
  questions_json JSON,
  redirect_url VARCHAR(500),
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS availability_blocks (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  day_of_week TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(60) NOT NULL DEFAULT 'America/Denver',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  KEY idx_account_user (account_id, user_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  event_type_id INT UNSIGNED,
  user_id INT UNSIGNED,
  contact_id INT UNSIGNED,
  invitee_name VARCHAR(200),
  invitee_email VARCHAR(150),
  invitee_phone VARCHAR(40),
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  timezone VARCHAR(60),
  status ENUM('booked','cancelled','no_show','completed','rescheduled') NOT NULL DEFAULT 'booked',
  location_type VARCHAR(40),
  meeting_url VARCHAR(500),
  answers_json JSON,
  notes TEXT,
  cancel_token CHAR(32) NOT NULL,
  reminded_24h TINYINT(1) DEFAULT 0,
  reminded_1h TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_starts (account_id, starts_at),
  KEY idx_token (cancel_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS availability_overrides (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  override_date DATE NOT NULL,
  is_unavailable TINYINT(1) NOT NULL DEFAULT 1,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(200),
  KEY idx_user_date (user_id, override_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: 30-min CADsuite demo event type + 5 day Mon-Fri 9-5 availability
INSERT IGNORE INTO event_types (account_id, slug, name, description, duration_minutes, min_notice_hours, max_advance_days, location_type, color, questions_json) VALUES
(4, 'cadsuite-demo', 'CADsuite — 30-min Demo', 'Quick walkthrough of any CADsuite product. Pick your product on the booking form.', 30, 4, 30, 'zoom', '#6366f1',
 JSON_ARRAY(
   JSON_OBJECT('key','product','label','Which CADsuite product?','type','select','options',JSON_ARRAY('Contractor CRM','Supplementer','Appraisers','StormWatch','Policy Review','Estimate Evaluator','HVAC CRM','Plan Takeoff','Other'),'required',true),
   JSON_OBJECT('key','company_size','label','Company size','type','select','options',JSON_ARRAY('1','2-5','6-20','21-50','50+'),'required',false),
   JSON_OBJECT('key','use_case','label','What are you hoping to solve?','type','textarea','required',false)
 )),
(4, 'cadsuite-discovery', 'CADsuite — 15-min Discovery Call', 'Quick chat to see if CADsuite is a fit.', 15, 2, 14, 'phone', '#10b981',
 JSON_ARRAY(JSON_OBJECT('key','role','label','Your role','type','text','required',false)));

INSERT IGNORE INTO availability_blocks (account_id, day_of_week, start_time, end_time, timezone) VALUES
(4, 1, '09:00:00', '17:00:00', 'America/Denver'),
(4, 2, '09:00:00', '17:00:00', 'America/Denver'),
(4, 3, '09:00:00', '17:00:00', 'America/Denver'),
(4, 4, '09:00:00', '17:00:00', 'America/Denver'),
(4, 5, '09:00:00', '17:00:00', 'America/Denver');

-- ============================================================================
-- PHASE 6 — AUTOMATION WORKFLOWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS automations (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  trigger_type ENUM('form_submit','tag_added','appointment_booked','email_opened','email_clicked','deal_stage_changed','contact_created','schedule','webhook','manual') NOT NULL,
  trigger_config JSON,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  enrolled_count INT UNSIGNED NOT NULL DEFAULT 0,
  completed_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS automation_nodes (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  automation_id INT UNSIGNED NOT NULL,
  node_key VARCHAR(40) NOT NULL,
  node_type ENUM('start','send_email','send_sms','add_tag','remove_tag','wait','if_branch','update_stage','create_task','webhook','assign_user','voicemail_drop','book_meeting','end') NOT NULL,
  position_x INT,
  position_y INT,
  config JSON,
  UNIQUE KEY uk_auto_node (automation_id, node_key),
  FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS automation_edges (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  automation_id INT UNSIGNED NOT NULL,
  from_node_key VARCHAR(40) NOT NULL,
  to_node_key VARCHAR(40) NOT NULL,
  branch ENUM('default','true','false') NOT NULL DEFAULT 'default',
  FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS automation_runs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  automation_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  current_node VARCHAR(40),
  status ENUM('running','waiting','completed','failed','exited') NOT NULL DEFAULT 'running',
  next_action_at DATETIME,
  variables JSON,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  KEY idx_account (account_id),
  KEY idx_next_action (status, next_action_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: 3 automation templates
INSERT IGNORE INTO automations (account_id, slug, name, description, trigger_type, trigger_config) VALUES
(4, 'welcome_new_lead', 'Welcome new lead', 'Sends a welcome email + adds the cadsuite-lead tag when a contact is created.', 'contact_created', JSON_OBJECT('immediate', true)),
(4, 'demo_no_show_recover', 'Demo no-show recovery', 'Fires when an appointment status flips to no_show. 3-email recovery over 5 days.', 'appointment_booked', JSON_OBJECT('on_status', 'no_show')),
(4, 'webinar_attended_followup', 'Webinar attended → follow-up', 'Tags + sends the trial-offer email when a contact attends a webinar.', 'tag_added', JSON_OBJECT('tag', 'webinar-attended-2026'));

-- ============================================================================
-- PHASE 8 — FUNNELS (page builder)
-- ============================================================================

CREATE TABLE IF NOT EXISTS funnels (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  product_id INT UNSIGNED,
  persona_id INT UNSIGNED,
  goal ENUM('lead_capture','demo_booking','trial_signup','sale','content_view') NOT NULL DEFAULT 'lead_capture',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  conversions INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS funnel_pages (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  funnel_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  step INT NOT NULL DEFAULT 0,
  page_type ENUM('landing','optin','sales','checkout','upsell','downsell','thankyou','webinar_register','calendar') NOT NULL DEFAULT 'landing',
  title VARCHAR(255) NOT NULL,
  blocks_json LONGTEXT,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  pixel_events JSON,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  conversions INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uk_funnel_step (funnel_id, step),
  KEY idx_account_slug (account_id, slug),
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS form_submissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  funnel_page_id INT UNSIGNED,
  contact_id INT UNSIGNED,
  email VARCHAR(150),
  name VARCHAR(200),
  phone VARCHAR(40),
  data_json JSON,
  ip VARCHAR(45),
  user_agent VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account (account_id),
  KEY idx_page (funnel_page_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: one 3-step demo funnel for the Contractor CRM
INSERT IGNORE INTO funnels (account_id, slug, name, description, goal, is_published) VALUES
(4, 'contractor-demo-funnel', 'Contractor CRM — Demo Funnel', 'Lead-magnet → calendar booking → thank-you. 3 pages.', 'demo_booking', 0);

SET @f := LAST_INSERT_ID();
INSERT IGNORE INTO funnel_pages (funnel_id, account_id, slug, step, page_type, title, blocks_json, meta_title, meta_description) VALUES
(@f, 4, 'job-stage-cheat-sheet', 1, 'optin', 'Free: 2026 Restoration Job Stage Cheat Sheet',
 JSON_ARRAY(
   JSON_OBJECT('type','heading','text','Free: 2026 Restoration Job Stage Cheat Sheet','size','h1'),
   JSON_OBJECT('type','text','text','The 18 job stages every restoration shop needs. PDF download.'),
   JSON_OBJECT('type','form','fields',JSON_ARRAY(
     JSON_OBJECT('name','name','label','Full name','required',true),
     JSON_OBJECT('name','email','label','Work email','required',true),
     JSON_OBJECT('name','company','label','Company','required',false)
   ),'submit_label','Send me the PDF','next_step',2)
 ),
 'Free Job Stage Cheat Sheet — CADsuite', 'The 18 job stages every restoration shop needs. Free PDF.'),
(@f, 4, 'book-demo', 2, 'calendar', 'Book your 30-min CADsuite demo',
 JSON_ARRAY(
   JSON_OBJECT('type','heading','text','You''re in. Now grab a 30-min demo.','size','h1'),
   JSON_OBJECT('type','text','text','PDF is on its way. While you''re here, lock in a 30-min walkthrough of Contractor CRM with Darin.'),
   JSON_OBJECT('type','calendar','event_type_slug','cadsuite-demo','next_step',3)
 ),
 'Book your CADsuite demo', 'Walkthrough of Contractor CRM. 30 minutes.'),
(@f, 4, 'thank-you', 3, 'thankyou', 'Thanks — talk soon',
 JSON_ARRAY(
   JSON_OBJECT('type','heading','text','You''re booked.','size','h1'),
   JSON_OBJECT('type','text','text','Calendar invite is in your inbox. In the meantime, the cheat sheet PDF is attached.'),
   JSON_OBJECT('type','button','label','Explore CADsuite products','url','https://cadsuite.com')
 ),
 'Thanks — talk soon', NULL);

SELECT 'event_types' n, COUNT(*) v FROM event_types WHERE account_id=4 UNION ALL
SELECT 'availability_blocks', COUNT(*) FROM availability_blocks WHERE account_id=4 UNION ALL
SELECT 'automations', COUNT(*) FROM automations WHERE account_id=4 UNION ALL
SELECT 'funnels', COUNT(*) FROM funnels WHERE account_id=4 UNION ALL
SELECT 'funnel_pages', COUNT(*) FROM funnel_pages WHERE account_id=4;
