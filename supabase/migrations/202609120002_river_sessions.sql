CREATE TABLE IF NOT EXISTS public.river_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  schema_version integer NOT NULL DEFAULT 1,
  content_version text NOT NULL DEFAULT 'v1' CHECK (char_length(content_version) BETWEEN 1 AND 80),
  mode text NOT NULL CHECK (mode IN ('timed', 'free')),
  planned_duration_seconds integer NULL,
  active_duration_seconds integer NOT NULL CHECK (active_duration_seconds BETWEEN 0 AND 86400),
  reflection text NULL CHECK (reflection IS NULL OR char_length(reflection) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT river_sessions_mode_duration_check CHECK (
    (mode = 'timed' AND planned_duration_seconds IN (120, 180, 300))
    OR (mode = 'free' AND planned_duration_seconds IS NULL)
  ),
  CONSTRAINT river_sessions_user_request_unique UNIQUE (user_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS river_sessions_user_created_id_idx
  ON public.river_sessions (user_id, created_at DESC, id DESC);

ALTER TABLE public.river_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS river_sessions_select_own ON public.river_sessions;
CREATE POLICY river_sessions_select_own ON public.river_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_insert_own ON public.river_sessions;
CREATE POLICY river_sessions_insert_own ON public.river_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_update_own ON public.river_sessions;
CREATE POLICY river_sessions_update_own ON public.river_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_delete_own ON public.river_sessions;
CREATE POLICY river_sessions_delete_own ON public.river_sessions
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

COMMENT ON TABLE public.river_sessions IS
  'Private, optional Thought River completion records. Deliberately contains no leaf or draft text.';
