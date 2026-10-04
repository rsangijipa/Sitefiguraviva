/**
 * Instituto Figura Viva - Tipos do Design System Confluência e Recursos Interativos
 */

export type ResourceState = 
  | 'loading'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error'
  | 'reduced-motion';

export type RiverMode = 'free' | 'timed';

export interface LeafThought {
  id: string;
  text: string;
  createdAt: number;
  // normalized coordinates (0.0 to 1.0)
  xProgress: number;
  yLane: number; // 0.1 to 0.9 vertical spread
  speed: number;
  rotation: number;
  angularVelocity: number;
  leafShape: 'broad' | 'willow' | 'oval' | 'lanceolate';
  scale: number;
  tintSeed: number;
}

export interface RiverSession {
  id: string;
  user_id: string;
  client_request_id: string;
  resource_slug: string;
  started_at: string;
  completed_at?: string;
  active_duration_seconds: number;
  planned_duration_seconds?: number | null;
  mode: RiverMode;
  reflection?: string | null;
  schema_version: number;
  content_version: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface ResourceContentVersion {
  id: string;
  resource_key: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  title: string;
  subtitle: string;
  card_description: string;
  opening_text: string;
  support_text: string;
  max_active_leaves: number;
  suggested_durations: number[]; // e.g. [120, 180, 300]
  water_flow_speed: 'slow' | 'calm' | 'moderate';
  updated_at: string;
}

export interface TelemetryEvent {
  event_name: 'resource_opened' | 'resource_started' | 'resource_completed' | 'resource_abandoned' | 'resource_repeated';
  resource_key: string;
  content_version: string;
  duration_range?: string; // '0-2min', '2-5min', '5min+' - sem dados íntimos
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'anonymous';
}
