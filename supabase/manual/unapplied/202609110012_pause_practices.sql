-- Pause practices: admin-managed content metadata for Sala de Pausa
CREATE TABLE IF NOT EXISTS public.pause_practices (
  id text PRIMARY KEY CHECK (id IN ('breathing', 'observing', 'listening', 'movement', 'slowing')),
  title text NOT NULL DEFAULT '' CHECK (length(title) <= 100),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 200),
  content_text text NOT NULL DEFAULT '' CHECK (length(content_text) IS NULL OR length(content_text) <= 1000),
  sort_order integer NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  durations jsonb NOT NULL DEFAULT '[120, 180, 300]'::jsonb,
  capabilities jsonb NOT NULL DEFAULT '{"audio": false, "motion": true, "static": true}'::jsonb,
  content_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  reviewer text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pause_practices_status ON public.pause_practices(status);
CREATE INDEX IF NOT EXISTS idx_pause_practices_order ON public.pause_practices(sort_order);

-- RLS
ALTER TABLE public.pause_practices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read published practices
CREATE POLICY "any_authenticated_read_published_practices"
  ON public.pause_practices FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

-- Only admins can modify
CREATE POLICY "admins_manage_practices"
  ON public.pause_practices FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public._update_pause_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pause_practices_updated_at ON public.pause_practices;
CREATE TRIGGER trg_pause_practices_updated_at
  BEFORE UPDATE ON public.pause_practices
  FOR EACH ROW
  EXECUTE FUNCTION public._update_pause_practices_updated_at();

COMMENT ON TABLE public.pause_practices IS 'Admin-managed content metadata for Sala de Pausa practices. Sessions use content_version at completion time.';
