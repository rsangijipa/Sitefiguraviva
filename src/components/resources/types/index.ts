/**
 * Design System Figura Viva v1.0 - Confluência
 * Tipos e Interfaces do Portal do Aluno
 */

export type ResourceCategory = 'PERCEBER' | 'REGULAR' | 'EXPERIMENTAR' | 'APRENDER';

export type ShellState =
  | 'loading'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error';

export interface InteractiveResource {
  slug: string;
  name: string;
  category: ResourceCategory;
  description: string;
  duration?: string;
  iconName: 'wheel' | 'breath' | 'tree' | 'body' | 'quiz' | 'lake';
  isAvailable: boolean;
}

export interface EmotionNuance {
  id: string;
  name: string;
  phenomenologicalDescription: string;
}

export interface EmotionSecondary {
  id: string;
  name: string;
  nuances: EmotionNuance[];
}

export interface EmotionFamily {
  id: string;
  name: string;
  colorAccent: string;
  subtleBg: string;
  borderColor: string;
  description: string;
  secondaries: EmotionSecondary[];
}

export interface BodyAnchor {
  id: string;
  label: string;
}

export interface EmotionWheelSelection {
  familyId?: string;
  secondaryId?: string;
  nuanceId?: string;
  customEmotion?: string;
  intensity?: number; // 1 to 5
  bodyAnchor?: string;
  reflection?: string;
}

export interface InteractiveResourceSession {
  id: string;
  user_id: string;
  resource_slug: string;
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface InteractiveResourceEntry {
  id: string;
  user_id: string;
  resource_slug: string;
  session_id: string;
  payload: {
    emotion_family?: string;
    emotion_label?: string;
    nuance_label?: string;
    custom_label?: string;
    intensity?: number;
    body_note?: string;
    reflection?: string;
    phenomenological_description?: string;
  };
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export type TelemetryEvent =
  | 'resource_started'
  | 'resource_completed'
  | 'resource_abandoned'
  | 'resource_repeated';

export interface TelemetryLog {
  id: string;
  event: TelemetryEvent;
  resource_slug: string;
  timestamp: string;
  session_id: string;
}
