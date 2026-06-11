-- Phase M-1: Personas + tenant-scope columns + CADsuite contact import
-- 2026-06-11

CREATE TABLE IF NOT EXISTS personas (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO personas (slug, name, description, color, sort_order) VALUES
('gc_restoration', 'GC / Restoration', 'General contractors + restoration companies. Roofing, exterior, mitigation. Buyers of Contractor CRM, Supplementer, StormWatch.', '#F97316', 10),
('public_adjuster', 'Public Adjuster', 'Independent PAs representing policyholders. Buyers of Supplementer, Policy Review, Estimate Evaluator.', '#10B981', 20),
('independent_appraiser', 'Independent Appraiser', 'Insurance appraisers + umpires. Buyers of Appraisers CRM, Loss Appraisers brand.', '#3B82F6', 30),
('hvac_owner', 'HVAC Owner', 'HVAC contractors + service companies. Buyers of HVAC CRM, AnswerLine.', '#8B5CF6', 40),
('carrier_ops', 'Insurance Carrier Ops', 'Carrier claims ops + SIU. Buyers of Policy Review, Estimate Evaluator (enterprise).', '#EC4899', 50);

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS account_id INT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS persona_id INT UNSIGNED NULL,
  ADD KEY idx_contacts_account (account_id),
  ADD KEY idx_contacts_persona (persona_id);

-- CADsuite customer import lives in the M-1 build notes; re-run via the
-- documented INSERTs against the live prod product DBs (contractor /
-- supplements_live / appraisers / lossappr / canvasser).
