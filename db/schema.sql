CREATE TABLE IF NOT EXISTS agent_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES agent_groups(id),
  name TEXT NOT NULL,
  title TEXT,
  specializations TEXT,
  notify_email TEXT NOT NULL,
  working_hours TEXT,
  slot_duration_min INTEGER DEFAULT 60,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS blackouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER,
  date TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Prevent double-booking: only one non-cancelled booking per (agent, date, time).
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_slot
  ON bookings(agent_id, date, time)
  WHERE status != 'cancelled';

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO settings VALUES ('meeting_duration_min', '60');
INSERT OR IGNORE INTO settings VALUES ('timezone', 'America/New_York');

-- Seed: default agent group
INSERT OR IGNORE INTO agent_groups (id, name, description) VALUES
  (1, 'Tax & Financial Services', 'Tax preparation and financial advisory');

-- Seed: default agent — Mon–Fri only (weekends removed; use blackouts for holidays)
-- Weekdays: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
INSERT OR IGNORE INTO agents (id, group_id, name, title, specializations, notify_email, working_hours, slot_duration_min, active) VALUES
  (1, 1, 'Digits Financial Group', 'Financial Advisor', '["Tax Preparation","Bookkeeping","Credit Repair","Entity Creation"]',
   'bookings@digitsfinancial.tax',
   '{"1":["10:00","22:00"],"2":["10:00","22:00"],"3":["10:00","22:00"],"4":["10:00","22:00"],"5":["10:00","22:00"]}',
   60, 1);

-- If agent already exists, update working hours to Mon–Fri only
UPDATE agents SET working_hours = '{"1":["10:00","22:00"],"2":["10:00","22:00"],"3":["10:00","22:00"],"4":["10:00","22:00"],"5":["10:00","22:00"]}'
  WHERE id = 1;

-- ─── US Federal Holiday Blackouts ────────────────────────────────────────────
-- agent_id NULL = applies to all agents.
-- IDs 1000+ reserved for seed holidays to prevent duplicate inserts on re-run.

-- 2025
INSERT OR IGNORE INTO blackouts (id, agent_id, date, reason) VALUES
  (1000, NULL, '2025-01-01', 'New Year''s Day'),
  (1001, NULL, '2025-01-20', 'Martin Luther King Jr. Day'),
  (1002, NULL, '2025-02-17', 'Presidents'' Day'),
  (1003, NULL, '2025-05-26', 'Memorial Day'),
  (1004, NULL, '2025-06-19', 'Juneteenth National Independence Day'),
  (1005, NULL, '2025-07-04', 'Independence Day'),
  (1006, NULL, '2025-09-01', 'Labor Day'),
  (1007, NULL, '2025-10-13', 'Columbus Day'),
  (1008, NULL, '2025-11-11', 'Veterans Day'),
  (1009, NULL, '2025-11-27', 'Thanksgiving Day'),
  (1010, NULL, '2025-12-25', 'Christmas Day');

-- 2026
INSERT OR IGNORE INTO blackouts (id, agent_id, date, reason) VALUES
  (1011, NULL, '2026-01-01', 'New Year''s Day'),
  (1012, NULL, '2026-01-19', 'Martin Luther King Jr. Day'),
  (1013, NULL, '2026-02-16', 'Presidents'' Day'),
  (1014, NULL, '2026-05-25', 'Memorial Day'),
  (1015, NULL, '2026-06-19', 'Juneteenth National Independence Day'),
  (1016, NULL, '2026-07-03', 'Independence Day (observed — Jul 4 falls on Saturday)'),
  (1017, NULL, '2026-09-07', 'Labor Day'),
  (1018, NULL, '2026-10-12', 'Columbus Day'),
  (1019, NULL, '2026-11-11', 'Veterans Day'),
  (1020, NULL, '2026-11-26', 'Thanksgiving Day'),
  (1021, NULL, '2026-12-25', 'Christmas Day');

-- 2027
INSERT OR IGNORE INTO blackouts (id, agent_id, date, reason) VALUES
  (1022, NULL, '2027-01-01', 'New Year''s Day'),
  (1023, NULL, '2027-01-18', 'Martin Luther King Jr. Day'),
  (1024, NULL, '2027-02-15', 'Presidents'' Day'),
  (1025, NULL, '2027-05-31', 'Memorial Day'),
  (1026, NULL, '2027-06-18', 'Juneteenth (observed — Jun 19 falls on Saturday)'),
  (1027, NULL, '2027-07-05', 'Independence Day (observed — Jul 4 falls on Sunday)'),
  (1028, NULL, '2027-09-06', 'Labor Day'),
  (1029, NULL, '2027-10-11', 'Columbus Day'),
  (1030, NULL, '2027-11-11', 'Veterans Day'),
  (1031, NULL, '2027-11-25', 'Thanksgiving Day'),
  (1032, NULL, '2027-12-24', 'Christmas Day (observed — Dec 25 falls on Saturday)');
