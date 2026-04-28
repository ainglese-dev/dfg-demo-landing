-- Migration: add accent_color column to agents
-- Production (remote D1):  wrangler d1 execute dfg-booking --remote --file=db/migrations/001_agent_accent_color.sql
-- Local dev:               wrangler d1 execute dfg-booking --local  --file=db/migrations/001_agent_accent_color.sql
--
-- Safe to skip if you see "duplicate column name" — it means the column already exists in that DB.

ALTER TABLE agents ADD COLUMN accent_color TEXT DEFAULT '#00E5A0';
UPDATE agents SET accent_color = '#00E5A0' WHERE accent_color IS NULL;
