/**
 * @license
 * Instituto Figura Viva - Design System v1.0 (Registro Confluência)
 * Tipos e contratos do Portal do Aluno e Recursos Interativos
 */

export type UserRole = 'student' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

// Estados obrigatórios do InteractiveResourceShell
export type ResourceState = 
  | 'loading' 
  | 'ready' 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'empty' 
  | 'error';

// Duração planejada suportada para a Sala de Pausa (segundos: 120s, 180s, 300s ou 0 = modo livre)
export type PlannedDurationSeconds = 120 | 180 | 300 | 0;

// Práticas da Sala de Pausa
export type PausePracticeId = 'breathing' | 'observing' | 'listening' | 'movement' | 'slowing';

export interface PausePracticeConfig {
  id: PausePracticeId;
  title: string;
  shortDescription: string;
  invitationText: string;
  guidanceText: string;
  iconName: 'wind' | 'eye' | 'headphones' | 'activity' | 'coffee';
  defaultDurationSeconds: PlannedDurationSeconds;
  supportedDurations: PlannedDurationSeconds[];
  capabilities: {
    audio: boolean;
    motion: boolean;
    staticAlternative: boolean;
  };
  version: string;
}

// Registro de sessão da Sala de Pausa (tabela pause_sessions)
export interface PauseSessionRecord {
  id: string;
  user_id: string;
  client_request_id: string;
  practice_id: PausePracticeId;
  practice_title: string;
  planned_duration_seconds: PlannedDurationSeconds;
  active_duration_seconds: number;
  ended_by: 'timer' | 'user' | 'switch';
  reflection: string | null;
  content_version: string;
  created_at: string;
}

// Sessão genérica de recurso interativo (tabela interactive_resource_sessions)
export interface InteractiveResourceSession {
  id: string;
  user_id: string;
  resource_slug: 'sala-de-pausa' | 'rio-dos-pensamentos';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Entrada pessoal com RLS (tabela interactive_resource_entries)
export interface InteractiveResourceEntry {
  id: string;
  user_id: string;
  resource_slug: 'sala-de-pausa' | 'rio-dos-pensamentos';
  session_id: string;
  payload: {
    title: string;
    summary?: string;
    reflection?: string;
    details?: Record<string, unknown>;
  };
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Versões de conteúdo editorial gerenciadas por Admin
export interface ResourceContentVersion {
  id: string;
  resource_key: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  title: string;
  subtitle: string;
  configuration: Record<string, unknown>;
  reviewer: string;
  updated_at: string;
}

// Evento no Rio dos Pensamentos (Reactive Stream)
export interface FloatingThought {
  id: string;
  text: string;
  category: 'sensacao' | 'ideia' | 'preocupacao' | 'observacao' | 'livre';
  colorTone: 'areia' | 'folha' | 'seixo' | 'creme';
  positionX: number; // 0 a 100%
  positionY: number; // 0 a 100% (flutua para baixo)
  speed: number;
  rotation: number;
  createdAt: number;
  dissolved: boolean;
}

export type RiverSpeed = 'calm' | 'serene' | 'still';

// Telemetria mínima e não invasiva
export type TelemetryEventType = 
  | 'resource_started' 
  | 'resource_completed' 
  | 'resource_abandoned' 
  | 'resource_repeated';

export interface TelemetryLog {
  id: string;
  eventType: TelemetryEventType;
  resourceSlug: string;
  timestamp: string;
  durationSeconds?: number;
}
