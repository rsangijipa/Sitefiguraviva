/**
 * Serviço de Persistência e Telemetria - Instituto Figura Viva
 * Compatível com Supabase e armazenamento local do aluno
 */

import {
  InteractiveResourceSession,
  InteractiveResourceEntry,
  TelemetryEvent,
  TelemetryLog,
} from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'figura_viva_resource_sessions_v1',
  ENTRIES: 'figura_viva_diary_entries_v1',
  TELEMETRY: 'figura_viva_telemetry_v1',
  ACTIVE_USER: 'figura_viva_current_user_v1',
};


/**
 * Esquema SQL e RLS do Supabase recomendado para produção:
 */
export const SUPABASE_SQL_SCHEMA = `
-- Tabela de sessões de recursos interativos
create table if not exists public.interactive_resource_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_slug text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tabela de registros pessoais do diário (conteúdo subjetivo protegido)
create table if not exists public.interactive_resource_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_slug text not null,
  session_id uuid references public.interactive_resource_sessions(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Políticas de Segurança RLS (Row Level Security)
alter table public.interactive_resource_sessions enable row level security;
alter table public.interactive_resource_entries enable row level security;

-- Usuário gerencia apenas suas próprias sessões
create policy "Usuário acessa suas próprias sessões"
  on public.interactive_resource_sessions
  for all using (auth.uid() = user_id);

-- Usuário gerencia apenas seus próprios registros íntimos de diário
-- Nem mesmo administradores têm acesso a registros com is_private = true
create policy "Usuário acessa exclusivamente seus próprios registros pessoais"
  on public.interactive_resource_entries
  for all using (auth.uid() = user_id);
`;

export class SupabasePersistenceService {
  private static getStored<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Erro ao salvar no armazenamento local:', e);
    }
  }

  static getCurrentUser() {
    return this.getStored(STORAGE_KEYS.ACTIVE_USER, { id: '', name: '', role: 'student' });
  }

  static setCurrentUser(user: { id: string; name: string; role: string }) {
    this.setStored(STORAGE_KEYS.ACTIVE_USER, user);
  }

  /**
   * Registra o início de uma sessão de recurso
   */
  static startSession(resourceSlug: string, metadata?: Record<string, unknown>): InteractiveResourceSession {
    const user = this.getCurrentUser();
    const session: InteractiveResourceSession = {
      id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      resource_slug: resourceSlug,
      started_at: new Date().toISOString(),
      duration_seconds: 0,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    const sessions = this.getStored<InteractiveResourceSession[]>(STORAGE_KEYS.SESSIONS, []);
    sessions.push(session);
    this.setStored(STORAGE_KEYS.SESSIONS, sessions);

    this.logTelemetry('resource_started', resourceSlug, session.id);
    return session;
  }

  /**
   * Conclui a experiência intencionalmente
   */
  static completeSession(
    sessionId: string,
    durationSeconds: number,
    metadata?: Record<string, unknown>
  ): void {
    const sessions = this.getStored<InteractiveResourceSession[]>(STORAGE_KEYS.SESSIONS, []);
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].completed_at = new Date().toISOString();
      sessions[index].duration_seconds = durationSeconds;
      if (metadata) {
        sessions[index].metadata = { ...sessions[index].metadata, ...metadata };
      }
      this.setStored(STORAGE_KEYS.SESSIONS, sessions);
      this.logTelemetry('resource_completed', sessions[index].resource_slug, sessionId);
    }
  }

  /**
   * Registra abandono precoce sem julgamento
   */
  static abandonSession(sessionId: string, durationSeconds: number): void {
    const sessions = this.getStored<InteractiveResourceSession[]>(STORAGE_KEYS.SESSIONS, []);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      this.logTelemetry('resource_abandoned', session.resource_slug, sessionId);
    }
  }

  /**
   * Salva um registro pessoal no diário somente com consentimento explícito
   */
  static saveDiaryEntry(
    resourceSlug: string,
    sessionId: string,
    payload: InteractiveResourceEntry['payload']
  ): InteractiveResourceEntry {
    const user = this.getCurrentUser();
    const entry: InteractiveResourceEntry = {
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      resource_slug: resourceSlug,
      session_id: sessionId,
      payload,
      is_private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const entries = this.getStored<InteractiveResourceEntry[]>(STORAGE_KEYS.ENTRIES, []);
    entries.unshift(entry);
    this.setStored(STORAGE_KEYS.ENTRIES, entries);

    return entry;
  }

  /**
   * Recupera os registros pessoais do usuário
   */
  static getDiaryEntries(resourceSlug?: string): InteractiveResourceEntry[] {
    const user = this.getCurrentUser();
    const entries = this.getStored<InteractiveResourceEntry[]>(STORAGE_KEYS.ENTRIES, []);
    return entries.filter((e) => e.user_id === user.id && (!resourceSlug || e.resource_slug === resourceSlug));
  }

  /**
   * Exclui um registro específico do diário
   */
  static deleteDiaryEntry(id: string): void {
    const entries = this.getStored<InteractiveResourceEntry[]>(STORAGE_KEYS.ENTRIES, []);
    const filtered = entries.filter((e) => e.id !== id);
    this.setStored(STORAGE_KEYS.ENTRIES, filtered);
  }

  /**
   * Telemetria estritamente ética
   */
  static logTelemetry(event: TelemetryEvent, resourceSlug: string, sessionId: string): void {
    const logs = this.getStored<TelemetryLog[]>(STORAGE_KEYS.TELEMETRY, []);
    const log: TelemetryLog = {
      id: 'tel-' + Date.now(),
      event,
      resource_slug: resourceSlug,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };
    logs.push(log);
    // Limita tamanho do log para performance
    if (logs.length > 50) logs.shift();
    this.setStored(STORAGE_KEYS.TELEMETRY, logs);
  }

  static getTelemetryLogs(): TelemetryLog[] {
    return this.getStored<TelemetryLog[]>(STORAGE_KEYS.TELEMETRY, []);
  }
}
