-- Phase M-13 — Pixel tracking + Conversion API
-- 2026-06-11
USE cadsuite_marketing;

-- Extend ad_pixels with API endpoint fields + dataset_id for new platforms
ALTER TABLE ad_pixels
  ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(120) NULL AFTER pixel_id,
  ADD COLUMN IF NOT EXISTS test_event_code VARCHAR(60) NULL AFTER conversion_api_token,
  ADD COLUMN IF NOT EXISTS notes VARCHAR(500) NULL;

-- Seed all 6 platforms for CADsuite (account 4). Meta/LinkedIn/Google already exist from M-5.
INSERT IGNORE INTO ad_pixels (account_id, platform, pixel_id, is_active, config) VALUES
(4, 'tiktok', NULL, 0, JSON_OBJECT('note', 'Add TikTok Pixel ID + Events API access token. TikTok Ads Manager → Assets → Events → Web Events.')),
(4, 'x',      NULL, 0, JSON_OBJECT('note', 'Add X (Twitter) Pixel ID. X Ads → Events Manager → Add new event source.')),
(4, 'reddit', NULL, 0, JSON_OBJECT('note', 'Add Reddit Pixel ID. Reddit Ads → Conversions → Pixel.'));

-- The Google pixel row covers Google Ads + YouTube Ads (YT is part of Google).
-- Store the YT channel handle in config.json for organic + ads attribution:
UPDATE ad_pixels
   SET notes = 'Google Ads conversion ID + GA4 measurement ID handle BOTH Google Search/Display AND YouTube Ads. For organic YouTube tracking, add channel handle in config.youtube_channel.'
 WHERE account_id = 4 AND platform = 'google';

-- A single event dispatch log so we can see every fire (debugging + audit)
CREATE TABLE IF NOT EXISTS pixel_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  platform ENUM('meta','linkedin','google','tiktok','x','reddit') NOT NULL,
  contact_id INT UNSIGNED,
  event_name VARCHAR(80) NOT NULL,
  event_value DECIMAL(10,2),
  currency CHAR(3) DEFAULT 'USD',
  dispatch_mode ENUM('browser','server','both') NOT NULL DEFAULT 'browser',
  status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  response_code INT,
  error_message TEXT,
  metadata JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account_platform (account_id, platform, created_at),
  KEY idx_contact (contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mapping of CADsuite funnel events → platform-specific event names
CREATE TABLE IF NOT EXISTS pixel_event_mappings (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  funnel_event VARCHAR(80) NOT NULL,
  meta_event VARCHAR(80),
  google_event VARCHAR(80),
  linkedin_event VARCHAR(80),
  tiktok_event VARCHAR(80),
  x_event VARCHAR(80),
  reddit_event VARCHAR(80),
  default_value DECIMAL(10,2),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_acct_funnel (account_id, funnel_event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Standard funnel event map
INSERT IGNORE INTO pixel_event_mappings (account_id, funnel_event, meta_event, google_event, linkedin_event, tiktok_event, x_event, reddit_event, default_value) VALUES
(4, 'page_view',         'PageView',         'page_view',          'PageView',  'Pageview',           'PageView',  'PageVisit',     NULL),
(4, 'lead_submitted',    'Lead',             'generate_lead',      'Lead',      'SubmitForm',         'Lead',      'SignUp',        50.00),
(4, 'demo_booked',       'Schedule',         'schedule',           'BookAppointment','SubmitForm',    'Schedule',  'Lead',         100.00),
(4, 'trial_started',     'StartTrial',       'begin_trial',        'StartTrial','StartTrial',         'StartTrial','SignUp',        99.00),
(4, 'paid_conversion',   'Purchase',         'purchase',           'Purchase',  'CompletePayment',    'Purchase',  'Purchase',     990.00),
(4, 'add_payment_info',  'AddPaymentInfo',   'add_payment_info',   'AddPaymentInfo','AddPaymentInfo', 'AddPaymentInfo','AddPaymentInfo', NULL),
(4, 'subscribe',         'Subscribe',        'subscribe',          'Subscribe', 'Subscribe',          'Subscribe', 'Subscribe',    990.00),
(4, 'content_view',      'ViewContent',      'view_item',          'ViewContent','ViewContent',       'ViewContent','ViewContent', NULL),
(4, 'search',            'Search',           'search',             'Search',    'Search',             'Search',    'Search',       NULL),
(4, 'video_view',        'ViewContent',      'video_view',         'ViewContent','ViewContent',       'ViewContent','ViewContent', NULL);

SELECT 'ad_pixels' n, COUNT(*) v FROM ad_pixels WHERE account_id=4 UNION ALL
SELECT 'pixel_event_mappings', COUNT(*) FROM pixel_event_mappings WHERE account_id=4 UNION ALL
SELECT 'pixel_events',         COUNT(*) FROM pixel_events         WHERE account_id=4;
