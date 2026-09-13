-- =====================================================================
-- Instituto Figura Viva - Schema Supabase / PostgreSQL
-- Recursos Interativos: Sala de Pausa & Rio dos Pensamentos
-- Arquitetura Confluência com RLS e Isolamento Estrito de Privacidade
-- =====================================================================

-- 1. TABELA: interactive_resource_sessions
-- Registra início e fim de uso dos recursos interativos (sem dados íntimos)
CREATE TABLE IF NOT EXISTS public.interactive_resource_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL CHECK (resource_slug IN ('sala-de-pausa', 'rio-dos-pensamentos')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de consulta rápida paginada por usuário
CREATE INDEX IF NOT EXISTS idx_sessions_user_created 
ON public.interactive_resource_sessions (user_id, created_at DESC, id);

-- 2. TABELA: interactive_resource_entries
-- Registros privados salvos voluntariamente pelo próprio aluno
CREATE TABLE IF NOT EXISTS public.interactive_resource_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL,
    session_id UUID REFERENCES public.interactive_resource_sessions(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_entries_user_created 
ON public.interactive_resource_entries (user_id, created_at DESC);

-- 3. TABELA: pause_sessions
-- Tabela dedicada e tipada para a Sala de Pausa
CREATE TABLE IF NOT EXISTS public.pause_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_request_id UUID NOT NULL,
    practice_id TEXT NOT NULL CHECK (practice_id IN ('breathing', 'observing', 'listening', 'movement', 'slowing')),
    practice_title TEXT NOT NULL,
    planned_duration_seconds INTEGER NOT NULL CHECK (planned_duration_seconds IN (120, 180, 300)),
    active_duration_seconds INTEGER NOT NULL CHECK (active_duration_seconds >= 0 AND active_duration_seconds <= 7200),
    ended_by TEXT NOT NULL CHECK (ended_by IN ('timer', 'user', 'switch')),
    reflection TEXT CHECK (char_length(reflection) <= 500),
    content_version TEXT NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unq_user_client_request UNIQUE(user_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS idx_pause_user_created 
ON public.pause_sessions (user_id, created_at DESC, id);

-- 4. TABELA: resource_content_versions
-- Gerenciamento editorial de roteiros pelo Admin (sem acesso a dados pessoais)
CREATE TABLE IF NOT EXISTS public.resource_content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    reviewer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unq_resource_version UNIQUE(resource_key, version)
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE PRIVACIDADE ABSOLUTA
-- =====================================================================

ALTER TABLE public.interactive_resource_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_resource_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pause_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_content_versions ENABLE ROW LEVEL SECURITY;

-- Sessões de recursos interativos:
CREATE POLICY "Aluno lê suas próprias sessões"
ON public.interactive_resource_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Aluno insere suas próprias sessões"
ON public.interactive_resource_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aluno atualiza suas próprias sessões"
ON public.interactive_resource_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aluno remove suas próprias sessões"
ON public.interactive_resource_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Entradas privadas do aluno:
CREATE POLICY "Aluno lê apenas suas próprias entradas íntimas"
ON public.interactive_resource_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Aluno insere suas próprias entradas"
ON public.interactive_resource_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aluno remove suas próprias entradas"
ON public.interactive_resource_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Sessões da Sala de Pausa:
CREATE POLICY "Aluno lê seu histórico de pausas"
ON public.pause_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Aluno registra sua pausa no histórico"
ON public.pause_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aluno exclui pausa do seu histórico"
ON public.pause_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Conteúdo Editorial:
-- Alunos leem apenas versões publicadas
CREATE POLICY "Alunos leem apenas roteiros publicados"
ON public.resource_content_versions FOR SELECT
TO authenticated
USING (status = 'published');

-- Admins autorizados gerenciam roteiros (nunca dados dos alunos)
CREATE POLICY "Admin gerencia versões de conteúdo"
ON public.resource_content_versions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
