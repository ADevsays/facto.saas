-- Notification Events Table (Outbox pattern)
CREATE TABLE IF NOT EXISTS notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  dedupe_key text UNIQUE NOT NULL,
  payload jsonb NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  skip_reason text,
  telegram_message_id bigint,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_events_status_prio ON notification_events (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_notif_events_dedupe ON notification_events (dedupe_key);
CREATE INDEX IF NOT EXISTS idx_notif_events_scheduled ON notification_events (scheduled_for);

-- Notification Snapshots Table
CREATE TABLE IF NOT EXISTS notification_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type text NOT NULL DEFAULT 'milestone',
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_snapshots_type_date ON notification_snapshots (snapshot_type, created_at DESC);

-- Notification Locks Table (For atomic multi-instance synchronization)
CREATE TABLE IF NOT EXISTS notification_locks (
  lock_key text PRIMARY KEY,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  owner text NOT NULL
);
