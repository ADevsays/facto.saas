-- Daily Views Table
CREATE TABLE IF NOT EXISTS daily_views (
  date date PRIMARY KEY,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_views_date ON daily_views (date DESC);
