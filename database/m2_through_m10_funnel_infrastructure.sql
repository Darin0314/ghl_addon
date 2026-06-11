-- Phase M-2 through M-10 — Funnel infrastructure + content seed
-- 2026-06-11
-- All tables scoped by account_id from the start. Seeded with CADsuite (account_id=4) content.

-- ============================================================================
-- M-2: PRODUCTS + LANDING PAGES + LEAD MAGNETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS funnel_products (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  tagline VARCHAR(255),
  primary_persona_id INT UNSIGNED,
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS landing_pages (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  headline VARCHAR(255),
  subhead VARCHAR(500),
  body_md MEDIUMTEXT,
  cta_text VARCHAR(80),
  cta_url VARCHAR(500),
  pixel_config JSON,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  views_count INT UNSIGNED NOT NULL DEFAULT 0,
  conversions_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_account (account_id),
  KEY idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lead_magnets (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED,
  landing_page_id INT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  format ENUM('pdf','calculator','checklist','video','tool','webinar','cheat_sheet') NOT NULL,
  description TEXT,
  delivery_email_template_id INT UNSIGNED,
  asset_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  downloads_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-3: EMAIL TEMPLATES + SEQUENCES + STEPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  body_md MEDIUMTEXT NOT NULL,
  body_html MEDIUMTEXT,
  category VARCHAR(60),
  persona_id INT UNSIGNED,
  product_id INT UNSIGNED,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_category (category),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_sequences (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  trigger_type ENUM('manual','tag_added','form_submit','deal_stage','schedule','behavior') NOT NULL DEFAULT 'manual',
  trigger_config JSON,
  persona_id INT UNSIGNED,
  product_id INT UNSIGNED,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  total_steps INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sequence_steps (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sequence_id INT UNSIGNED NOT NULL,
  step_order INT UNSIGNED NOT NULL,
  step_type ENUM('email','sms','linkedin','call_task','wait','condition','tag','webhook') NOT NULL,
  delay_days INT NOT NULL DEFAULT 0,
  delay_hours INT NOT NULL DEFAULT 0,
  email_template_id INT UNSIGNED,
  message_body TEXT,
  config JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sequence (sequence_id, step_order),
  FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sequence_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  current_step INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','paused','completed','exited') NOT NULL DEFAULT 'active',
  next_send_at DATETIME,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  KEY idx_account (account_id),
  KEY idx_next_send (next_send_at, status),
  UNIQUE KEY uk_seq_contact (sequence_id, contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-4: WEBINARS + CASE STUDIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS webinars (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  presenter VARCHAR(120),
  scheduled_at DATETIME,
  duration_minutes INT NOT NULL DEFAULT 45,
  replay_url VARCHAR(500),
  landing_page_id INT UNSIGNED,
  registrations_count INT UNSIGNED NOT NULL DEFAULT 0,
  attendees_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webinar_registrations (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  webinar_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  email VARCHAR(150) NOT NULL,
  name VARCHAR(150),
  attended TINYINT(1) NOT NULL DEFAULT 0,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_webinar (webinar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS case_studies (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  customer_name VARCHAR(150),
  industry VARCHAR(120),
  persona_id INT UNSIGNED,
  product_id INT UNSIGNED,
  problem_md TEXT,
  solution_md TEXT,
  results_md TEXT,
  quote TEXT,
  metrics_json JSON,
  video_url VARCHAR(500),
  format ENUM('written','video','both') NOT NULL DEFAULT 'written',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-5: AD PIXELS + RETARGETING AUDIENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_pixels (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  platform ENUM('meta','linkedin','google','tiktok','x','reddit') NOT NULL,
  pixel_id VARCHAR(120),
  conversion_api_token VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  config JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_platform (account_id, platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS retargeting_audiences (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  platform ENUM('meta','linkedin','google','tiktok','x','reddit') NOT NULL,
  window_days INT NOT NULL DEFAULT 30,
  source_filter JSON,
  contact_count INT UNSIGNED NOT NULL DEFAULT 0,
  external_audience_id VARCHAR(120),
  is_synced TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-6: PARTNER / REFERRAL PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  company_name VARCHAR(200),
  contact_name VARCHAR(200),
  contact_email VARCHAR(150),
  phone VARCHAR(30),
  tier ENUM('standard','silver','gold','platinum') NOT NULL DEFAULT 'standard',
  commission_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  commission_months INT NOT NULL DEFAULT 12,
  payout_method ENUM('check','ach','paypal','credit') NOT NULL DEFAULT 'check',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS referral_links (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  partner_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  slug VARCHAR(60) NOT NULL UNIQUE,
  destination_url VARCHAR(500) NOT NULL,
  campaign VARCHAR(120),
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  signups INT UNSIGNED NOT NULL DEFAULT 0,
  paid_conversions INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_partner (partner_id),
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS referral_attributions (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  referral_link_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  account_id INT UNSIGNED NOT NULL,
  click_ip VARCHAR(45),
  click_user_agent VARCHAR(500),
  clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  signed_up_at DATETIME,
  paid_at DATETIME,
  paid_amount DECIMAL(10,2),
  commission_owed DECIMAL(10,2),
  commission_paid_at DATETIME,
  KEY idx_link (referral_link_id),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-7: REVIEW / UGC REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_requests (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED NOT NULL,
  platform ENUM('g2','capterra','google','trustpilot','facebook','linkedin','internal') NOT NULL,
  status ENUM('queued','sent','clicked','submitted','dismissed') NOT NULL DEFAULT 'queued',
  send_at DATETIME,
  sent_at DATETIME,
  submitted_at DATETIME,
  rating TINYINT,
  review_text TEXT,
  review_url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_send (send_at, status),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-8: PRICING + AUTHORIZE.NET CHECKOUT
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  setup_fee DECIMAL(10,2),
  trial_days INT NOT NULL DEFAULT 14,
  features_json JSON,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  authnet_subscription_plan_id VARCHAR(120),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug),
  KEY idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS billing_settings (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL UNIQUE,
  authnet_api_login_id VARCHAR(120),
  authnet_transaction_key VARCHAR(255),
  authnet_environment ENUM('sandbox','production') NOT NULL DEFAULT 'sandbox',
  default_currency CHAR(3) NOT NULL DEFAULT 'USD',
  receipt_email VARCHAR(150),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  pricing_plan_id INT UNSIGNED NOT NULL,
  session_token VARCHAR(64) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','succeeded','failed','expired') NOT NULL DEFAULT 'pending',
  authnet_transaction_id VARCHAR(120),
  authnet_subscription_id VARCHAR(120),
  customer_profile_id VARCHAR(120),
  payment_profile_id VARCHAR(120),
  failure_reason VARCHAR(255),
  succeeded_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account (account_id),
  KEY idx_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-9: CONTENT CALENDAR + BLOG POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_calendar (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  scheduled_date DATE NOT NULL,
  content_type ENUM('blog','email','social','video','podcast','webinar','case_study','press') NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_keyword VARCHAR(150),
  search_volume INT,
  target_persona_id INT UNSIGNED,
  target_product_id INT UNSIGNED,
  funnel_stage ENUM('top','mid','bottom') NOT NULL DEFAULT 'top',
  status ENUM('idea','outlined','drafting','review','published','archived') NOT NULL DEFAULT 'idea',
  assigned_to INT UNSIGNED,
  url VARCHAR(500),
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_account_date (account_id, scheduled_date),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  calendar_id INT UNSIGNED,
  slug VARCHAR(150) NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  body_md MEDIUMTEXT,
  hero_image_url VARCHAR(500),
  target_keyword VARCHAR(150),
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  persona_id INT UNSIGNED,
  product_id INT UNSIGNED,
  funnel_stage ENUM('top','mid','bottom') NOT NULL DEFAULT 'top',
  published_at DATETIME,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  conversions INT UNSIGNED NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_slug (account_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- M-10: FUNNEL METRICS + REPORTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  product_id INT UNSIGNED,
  persona_id INT UNSIGNED,
  event_type VARCHAR(60) NOT NULL,
  event_value DECIMAL(10,2),
  source VARCHAR(120),
  utm_source VARCHAR(120),
  utm_medium VARCHAR(120),
  utm_campaign VARCHAR(120),
  utm_content VARCHAR(120),
  utm_term VARCHAR(120),
  referrer VARCHAR(500),
  metadata JSON,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_event (account_id, event_type, occurred_at),
  KEY idx_contact (contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS funnel_metrics_daily (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED,
  persona_id INT UNSIGNED,
  metric_date DATE NOT NULL,
  visitors INT UNSIGNED NOT NULL DEFAULT 0,
  leads INT UNSIGNED NOT NULL DEFAULT 0,
  mqls INT UNSIGNED NOT NULL DEFAULT 0,
  sqls INT UNSIGNED NOT NULL DEFAULT 0,
  trials INT UNSIGNED NOT NULL DEFAULT 0,
  paid_conversions INT UNSIGNED NOT NULL DEFAULT 0,
  mrr_added DECIMAL(10,2) NOT NULL DEFAULT 0,
  arr_added DECIMAL(10,2) NOT NULL DEFAULT 0,
  churned INT UNSIGNED NOT NULL DEFAULT 0,
  churned_mrr DECIMAL(10,2) NOT NULL DEFAULT 0,
  ad_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
  cac DECIMAL(10,2),
  UNIQUE KEY uk_acct_prod_date (account_id, product_id, metric_date),
  KEY idx_date (metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
