-- Migration 002: prevent double-booking via partial unique index.
-- Cancelled bookings are excluded so the slot can be re-booked after cancellation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_slot
  ON bookings(agent_id, date, time)
  WHERE status != 'cancelled';
