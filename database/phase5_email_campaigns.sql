-- Phase 5 — Email Campaign Builder
-- 2026-06-11
USE cadsuite_marketing;

CREATE TABLE IF NOT EXISTS campaigns (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  from_name VARCHAR(120),
  from_email VARCHAR(150),
  reply_to VARCHAR(150),
  body_html MEDIUMTEXT,
  blocks_json LONGTEXT,
  status ENUM('draft','scheduled','sending','sent','paused','failed') NOT NULL DEFAULT 'draft',
  scheduled_at DATETIME,
  sent_at DATETIME,
  recipient_filter JSON,
  recipient_count INT UNSIGNED NOT NULL DEFAULT 0,
  sent_count INT UNSIGNED NOT NULL DEFAULT 0,
  open_count INT UNSIGNED NOT NULL DEFAULT 0,
  click_count INT UNSIGNED NOT NULL DEFAULT 0,
  bounce_count INT UNSIGNED NOT NULL DEFAULT 0,
  unsubscribe_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_by INT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_account_status (account_id, status, scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  contact_id INT UNSIGNED,
  email VARCHAR(150) NOT NULL,
  name VARCHAR(150),
  tracking_token CHAR(32) NOT NULL,
  status ENUM('queued','sending','sent','opened','clicked','bounced','unsubscribed','failed') NOT NULL DEFAULT 'queued',
  sent_at DATETIME,
  opened_at DATETIME,
  clicked_at DATETIME,
  bounced_at DATETIME,
  unsubscribed_at DATETIME,
  failure_reason VARCHAR(500),
  KEY idx_campaign_status (campaign_id, status),
  KEY idx_token (tracking_token),
  KEY idx_account (account_id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaign_link_clicks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  recipient_id BIGINT UNSIGNED NOT NULL,
  campaign_id INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  url VARCHAR(1000) NOT NULL,
  clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45),
  user_agent VARCHAR(500),
  KEY idx_recipient (recipient_id),
  KEY idx_campaign (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL UNIQUE,
  provider ENUM('local_mail','smtp','ses','sendgrid','mailgun','postmark','ringcentral') NOT NULL DEFAULT 'local_mail',
  host VARCHAR(150),
  port INT,
  username VARCHAR(200),
  password VARCHAR(500),
  encryption ENUM('none','tls','ssl') NOT NULL DEFAULT 'tls',
  from_email VARCHAR(150) NOT NULL,
  from_name VARCHAR(120),
  reply_to VARCHAR(150),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  daily_cap INT NOT NULL DEFAULT 2000,
  per_hour_cap INT NOT NULL DEFAULT 200,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS unsubscribes (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  email VARCHAR(150) NOT NULL,
  reason VARCHAR(255),
  unsubscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_acct_email (account_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO smtp_settings (account_id, provider, from_email, from_name) VALUES
(4, 'local_mail', 'orders@cadsuite.com', 'CADsuite');

SELECT 'campaigns' n, COUNT(*) v FROM campaigns WHERE account_id=4 UNION ALL
SELECT 'smtp_settings', COUNT(*) FROM smtp_settings WHERE account_id=4 UNION ALL
SELECT 'unsubscribes', COUNT(*) FROM unsubscribes WHERE account_id=4;
