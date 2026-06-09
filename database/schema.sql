-- GHL Add-On Core Schema
-- MariaDB 10.11

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','agent','viewer') NOT NULL DEFAULT 'agent',
    avatar_url    VARCHAR(255) DEFAULT NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contacts (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    email            VARCHAR(150) DEFAULT NULL,
    phone            VARCHAR(30) DEFAULT NULL,
    source           VARCHAR(100) DEFAULT NULL,
    tags             JSON DEFAULT NULL,
    pipeline_stage_id INT UNSIGNED DEFAULT NULL,
    notes            TEXT DEFAULT NULL,
    created_by       INT UNSIGNED DEFAULT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pipelines (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pipeline_id INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    color       VARCHAR(20) DEFAULT '#6b7280',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS deals (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contact_id       INT UNSIGNED NOT NULL,
    pipeline_id      INT UNSIGNED NOT NULL,
    stage_id         INT UNSIGNED NOT NULL,
    title            VARCHAR(200) NOT NULL,
    value            DECIMAL(12,2) DEFAULT 0.00,
    expected_close   DATE DEFAULT NULL,
    status           ENUM('open','won','lost') NOT NULL DEFAULT 'open',
    notes            TEXT DEFAULT NULL,
    assigned_to      INT UNSIGNED DEFAULT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed default pipeline
INSERT IGNORE INTO pipelines (id, name, is_default) VALUES (1, 'Sales Pipeline', 1);
INSERT IGNORE INTO pipeline_stages (pipeline_id, name, sort_order, color) VALUES
    (1, 'New Lead',       1, '#3b82f6'),
    (1, 'Contacted',      2, '#8b5cf6'),
    (1, 'Qualified',      3, '#f59e0b'),
    (1, 'Proposal Sent',  4, '#ec4899'),
    (1, 'Won',            5, '#10b981'),
    (1, 'Lost',           6, '#ef4444');

-- Phase 3 — RingCentral call logging
CREATE TABLE IF NOT EXISTS call_logs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contact_id      INT UNSIGNED DEFAULT NULL,
    user_id         INT UNSIGNED DEFAULT NULL,
    direction       ENUM('inbound','outbound','missed') NOT NULL DEFAULT 'outbound',
    phone_number    VARCHAR(30) NOT NULL,
    duration_sec    INT UNSIGNED NOT NULL DEFAULT 0,
    rc_session_id   VARCHAR(64) DEFAULT NULL,
    rc_call_id      VARCHAR(64) DEFAULT NULL,
    recording_url   VARCHAR(500) DEFAULT NULL,
    result          VARCHAR(30) DEFAULT NULL,  -- 'connected', 'no-answer', 'voicemail', 'busy', etc.
    notes           TEXT DEFAULT NULL,
    started_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME DEFAULT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
    INDEX (contact_id, started_at),
    INDEX (phone_number, started_at),
    UNIQUE KEY uq_rc_session (rc_session_id)
) ENGINE=InnoDB;
