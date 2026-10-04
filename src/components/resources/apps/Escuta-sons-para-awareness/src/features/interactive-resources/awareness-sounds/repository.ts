/**
 * Repositório de Persistência e RLS - Sons para Awareness
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios fundamentais:
 * - Conteúdo efêmero em memória é o padrão.
 * - Somente persiste mediante escolha explícita ao finalizar ("Salvar no meu histórico").
 * - Isolamento RLS por user_id. Administrador NÃO tem acesso aos registros íntimos de percepção.
 * - Idempotência por client_request_id.
 * - Fornece schema DDL / migrations Supabase com RLS ativa.
 */

import {
  InteractiveResourceSession,
  ListeningSessionEntry,
  ResourceContentVersion,
  TelemetryEvent,
} from './types';

const STORAGE_KEY_SESSIONS = 'figura_viva_resource_sessions_v1';
const STORAGE_KEY_ENTRIES = 'figura_viva_listening_entries_v1';
const STORAGE_KEY_TELEMETRY = 'figura_viva_resource_telemetry_v1';
const STORAGE_KEY_CMS = 'figura_viva_resource_content_versions_v1';

// Script DDL canônico para migração Supabase
export const SUPABASE_MIGRATIONS_SQL = `-- Migração Oficial: Instituto Figura Viva - Recursos Interativos Confluência
-- Módulo: Sons para Awareness (Escuta espacial e percepção subjetiva)

-- 1. Tabela de sessões de recursos interativos
CREATE TABLE IF NOT EXISTS public.interactive_resource_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em interactive_resource_sessions
ALTER TABLE public.interactive_resource_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactive_resource_sessions_user_select"
    ON public.interactive_resource_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "interactive_resource_sessions_user_insert"
    ON public.interactive_resource_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interactive_resource_sessions_user_delete"
    ON public.interactive_resource_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Tabela de registros pessoais do aluno (listening_sessions)
CREATE TABLE IF NOT EXISTS public.interactive_resource_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL CHECK (resource_slug = 'sons-para-awareness'),
    session_id UUID REFERENCES public.interactive_resource_sessions(id) ON DELETE SET NULL,
    client_request_id UUID NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    content_version TEXT NOT NULL DEFAULT '1.2.0',
    mode TEXT NOT NULL CHECK (mode IN ('free', 'guided', 'text')),
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    personal_reflection TEXT CHECK (length(personal_reflection) <= 500),
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_client_request UNIQUE (user_id, client_request_id)
);

-- Índice para histórico paginado
CREATE INDEX IF NOT EXISTS idx_listening_entries_user_created 
    ON public.interactive_resource_entries (user_id, created_at DESC, id);

-- Habilitar RLS em interactive_resource_entries (STRICT PRIVACY)
-- Nota: Administradores e instrutores NÃO possuem política de leitura sobre percepções pessoais!
ALTER TABLE public.interactive_resource_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listening_entries_owner_select"
    ON public.interactive_resource_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "listening_entries_owner_insert"
    ON public.interactive_resource_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listening_entries_owner_update"
    ON public.interactive_resource_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listening_entries_owner_delete"
    ON public.interactive_resource_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Conteúdo Editorial & CMS administrável
CREATE TABLE IF NOT EXISTS public.resource_content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key TEXT NOT NULL CHECK (resource_key = 'sons-para-awareness'),
    version TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    scenes_count INTEGER NOT NULL DEFAULT 4,
    reviewer TEXT NOT NULL,
    changelog TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_content_versions ENABLE ROW LEVEL SECURITY;

-- Alunos autenticados podem apenas LER versões publicadas
CREATE POLICY "content_versions_public_read"
    ON public.resource_content_versions
    FOR SELECT
    USING (status = 'published');
`;

export class AwarenessRepository {
  private currentUserId: string = 'user_aluno_mariana_01'; // Usuário mock autenticado no portal
  private isAnonymous: boolean = false;

  public setAuthenticatedUser(userId: string, isAnonymous: boolean = false) {
    this.currentUserId = userId;
    this.isAnonymous = isAnonymous;
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  public isUserAnonymous(): boolean {
    return this.isAnonymous;
  }

  // Obter registros de sessões do aluno atual (RLS aplicado)
  public async getStudentEntries(): Promise<ListeningSessionEntry[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (!raw) return [];
      const all: ListeningSessionEntry[] = JSON.parse(raw);
      // RLS Check: auth.uid() === user_id
      return all.filter((entry) => entry.userId === this.currentUserId);
    } catch {
      return [];
    }
  }

  // Salvar registro de escuta intencional
  public async saveEntry(entry: Omit<ListeningSessionEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ListeningSessionEntry> {
    if (this.isAnonymous) {
      throw new Error('Sessões anônimas não podem salvar no histórico privado permanente.');
    }

    const newEntry: ListeningSessionEntry = {
      ...entry,
      id: 'entry_' + crypto.randomUUID(),
      userId: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    const existing: ListeningSessionEntry[] = raw ? JSON.parse(raw) : [];

    // Idempotência por clientRequestId
    const alreadyExists = existing.find(
      (e) => e.userId === this.currentUserId && e.clientRequestId === newEntry.clientRequestId
    );
    if (alreadyExists) {
      return alreadyExists;
    }

    existing.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(existing));
    return newEntry;
  }

  // Excluir registro próprio com garantia de autorização
  public async deleteEntry(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) return false;
    const existing: ListeningSessionEntry[] = JSON.parse(raw);

    const target = existing.find((e) => e.id === id);
    if (!target) return false;

    // RLS: Apenas dono pode excluir
    if (target.userId !== this.currentUserId) {
      throw new Error('Acesso negado: Você só pode excluir seus próprios registros.');
    }

    const filtered = existing.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(filtered));
    return true;
  }

  // Exportar dados próprios do aluno (em formato JSON seguro)
  public async exportStudentData(): Promise<string> {
    const entries = await this.getStudentEntries();
    return JSON.stringify(
      {
        portal: 'Instituto Figura Viva - Portal do Aluno',
        recurso: 'Sons para Awareness',
        userId: this.currentUserId,
        exportadoEm: new Date().toISOString(),
        totalRegistros: entries.length,
        registros: entries,
      },
      null,
      2
    );
  }

  // Telemetria não-invasiva
  public trackTelemetry(event: TelemetryEvent) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY);
      const list: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
      list.push(event);
      // Guarda até 50 eventos sem sobrecarregar
      if (list.length > 50) list.shift();
      localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(list));
    } catch {
      // Ignora erro em ambiente restrito
    }
  }

  // CMS: Versões de conteúdo editorial
  public getContentVersions(): ResourceContentVersion[] {
    const defaultVersions: ResourceContentVersion[] = [
      {
        id: 'ver-1.2.0',
        resourceKey: 'sons-para-awareness',
        version: '1.2.0',
        status: 'published',
        scenesCount: 4,
        reviewer: 'Coordenação Pedagógica Figura Viva',
        changelog: 'Cenas I a IV validadas com fones e áudio espacial HRTF.',
        publishedAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
      {
        id: 'ver-1.3.0-rc',
        resourceKey: 'sons-para-awareness',
        version: '1.3.0-rc',
        status: 'draft',
        scenesCount: 6,
        reviewer: 'Equipe Acústica Confluência',
        changelog: 'Adição de 2 novas cenas de transição crepuscular (em revisão editorial).',
        updatedAt: '2026-09-10T14:30:00Z',
      },
    ];

    try {
      const raw = localStorage.getItem(STORAGE_KEY_CMS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_CMS, JSON.stringify(defaultVersions));
        return defaultVersions;
      }
      return JSON.parse(raw);
    } catch {
      return defaultVersions;
    }
  }
}

export const globalRepository = new AwarenessRepository();
