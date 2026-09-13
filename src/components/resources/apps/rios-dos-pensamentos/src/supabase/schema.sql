-- ==============================================================================
-- INSTITUTO FIGURA VIVA - ESQUEMA DE PERSISTÊNCIA E RLS
-- Recurso: Rio dos Pensamentos (Registro Confluência)
-- ==============================================================================

-- 1. Tabela de Sessões do Rio dos Pensamentos
CREATE TABLE IF NOT EXISTS public.river_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_request_id UUID NOT NULL,
    resource_slug TEXT NOT NULL DEFAULT 'rio-dos-pensamentos',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    active_duration_seconds INTEGER NOT NULL DEFAULT 0,
    planned_duration_seconds INTEGER,
    mode TEXT NOT NULL DEFAULT 'free',
    reflection TEXT,
    schema_version INTEGER NOT NULL DEFAULT 1,
    content_version TEXT NOT NULL DEFAULT 'v1.0.0',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Restrições éticas e de integridade
    CONSTRAINT check_positive_duration CHECK (active_duration_seconds >= 0 AND active_duration_seconds <= 86400),
    CONSTRAINT check_reflection_length CHECK (reflection IS NULL OR char_length(reflection) <= 500),
    CONSTRAINT check_mode_valid CHECK (mode IN ('free', 'timed')),
    CONSTRAINT unique_user_client_request UNIQUE (user_id, client_request_id)
);

-- NOTA ARQUITETURAL: Não criamos tabela de folhas ou palavras.
-- As frases inseridas durante a prática são efêmeras em memória e descartadas 
-- assim que saem do campo de visão.

-- 2. Tabela Base de Sessões de Recursos Interativos (Padrão Unificado Portal)
CREATE TABLE IF NOT EXISTS public.interactive_resource_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_resource_duration CHECK (duration_seconds >= 0)
);

-- 3. Tabela de Versões Editoriais (CMS Administrativo)
CREATE TABLE IF NOT EXISTS public.resource_content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    card_description TEXT NOT NULL,
    opening_text TEXT NOT NULL,
    support_text TEXT NOT NULL,
    max_active_leaves INTEGER NOT NULL DEFAULT 8,
    suggested_durations JSONB NOT NULL DEFAULT '[120, 180, 300]'::jsonb,
    water_flow_speed TEXT NOT NULL DEFAULT 'calm',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT unique_resource_version UNIQUE (resource_key, version)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - PRIVACIDADE ESTRITA DO ALUNO
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.river_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_resource_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_content_versions ENABLE ROW LEVEL SECURITY;

-- Políticas para river_sessions: o usuário só tem acesso aos seus próprios registros
CREATE POLICY "Alunos podem inserir apenas seus próprios registros"
    ON public.river_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Alunos podem visualizar apenas seus próprios registros"
    ON public.river_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Alunos podem atualizar apenas seus próprios registros"
    ON public.river_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Alunos podem excluir apenas seus próprios registros"
    ON public.river_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para resource_content_versions:
-- Alunos leem apenas versões publicadas
CREATE POLICY "Alunos e visitantes leem versões publicadas de recursos"
    ON public.resource_content_versions
    FOR SELECT
    USING (status = 'published');

-- Admins com role 'admin' gerenciam conteúdo editorial
CREATE POLICY "Administradores gerenciam configurações editoriais"
    ON public.resource_content_versions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ==============================================================================
-- ÍNDICES DE DESEMPENHO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_river_sessions_user_history 
    ON public.river_sessions (user_id, created_at DESC, id);

CREATE INDEX IF NOT EXISTS idx_resource_content_versions_key_status 
    ON public.resource_content_versions (resource_key, status);
