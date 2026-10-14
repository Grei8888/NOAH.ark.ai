-- Preview-only isolated Neon branch. Never apply to the production database.
-- All paid AI calls reserve a conservative fixed amount BEFORE requesting OpenAI.
CREATE TABLE IF NOT EXISTS noah_beta_daily_budget (
  day_key text PRIMARY KEY,
  reserved_krw integer NOT NULL DEFAULT 0 CHECK (reserved_krw BETWEEN 0 AND 1000),
  admitted_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS noah_beta_reservation (
  id uuid PRIMARY KEY,
  day_key text NOT NULL REFERENCES noah_beta_daily_budget(day_key),
  cache_key text,
  reserved_krw integer NOT NULL CHECK (reserved_krw > 0),
  state text NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved','completed','uncertain')),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(day_key, cache_key)
);
CREATE TABLE IF NOT EXISTS noah_beta_answer_cache (
  cache_key text PRIMARY KEY,
  answer text NOT NULL CHECK (length(answer) BETWEEN 1 AND 4500),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS noah_beta_answer_cache_expiry ON noah_beta_answer_cache (expires_at);
