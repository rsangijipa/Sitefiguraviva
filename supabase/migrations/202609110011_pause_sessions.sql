-- Pause sessions: private records of brief pause practices completed by users
CREATE TABLE IF NOT EXISTS public.pause_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id text NOT NULL CHECK (practice_id IN ('breathing', 'observing', 'listening', 'movement', 'slowing')),
  planned_duration_seconds integer NOT NULL CHECK (planned_duration_seconds IN (120, 180, 300)),
  active_duration_seconds integer NOT NULL DEFAULT 0 CHECK (active_duration_seconds >= 0),
  ended_by text NOT NULL DEFAULT 'user' CHECK (ended_by IN ('timer', 'user', 'switch')),
  reflection text NULL CHECK (length(reflection) IS NULL OR length(reflection) <= 500),
  content_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Idempotency key to prevent double-submit
  client_request_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pause_sessions_user_created 
  ON public.pause_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pause_sessions_user_id 
  ON public.pause_sessions(user_id);

-- RLS policies
ALTER TABLE public.pause_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_pause_sessions"
  ON public.pause_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_pause_sessions"
  ON public.pause_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_pause_sessions"
  ON public.pause_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_pause_sessions"
  ON public.pause_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.pause_sessions IS 'Private pause session records. Teachers/tutors/students cannot access each other''s data.';
