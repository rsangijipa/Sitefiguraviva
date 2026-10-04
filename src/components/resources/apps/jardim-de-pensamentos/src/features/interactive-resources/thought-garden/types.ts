/**
 * Design System Figura Viva v1.0 - Registro Confluência
 * Tipos para o Recurso Interativo: Jardim de Pensamentos
 */

export type LeafStatus = 'draft' | 'placed' | 'floating' | 'removed';

export interface GardenLeaf {
  id: string;
  text: string;
  optional_title?: string | null;
  status: LeafStatus;
  savedRecordId?: string; // id do registro persistido no banco, se houver
  isFloating: boolean;
  leafShapeIndex: number; // 0 a 4 para variações orgânicas de folhas
  colorVariant: 'folha-verde' | 'folha-terra' | 'folha-areia' | 'folha-igarape';
  xRatio: number; // 0.1 a 0.9 para posicionamento fluido no palco
  yRatio: number; // 0.15 a 0.85
  rotationDeg: number; // -15 a 15 graus
  createdAt: string;
}

export type ExperienceState =
  | 'intro'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error';

export interface PersistedThoughtRecord {
  id: string;
  user_id: string;
  client_request_id: string;
  text: string;
  optional_title: string | null;
  schema_version: number;
  content_version: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
}

export interface ResourceSession {
  id: string;
  user_id: string;
  resource_slug: string;
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface EditorialContentConfig {
  resource_key: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  title: string;
  subtitle: string;
  opening_prompt: string;
  support_text: string;
  ethical_note: string;
  placeholder_text: string;
  max_characters: number;
  max_visual_leaves_desktop: number;
  max_visual_leaves_mobile: number;
  max_session_leaves: number;
  closing_title: string;
  closing_support: string;
  updated_at: string;
}

export interface UserSessionProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  isAnonymous?: boolean;
}

export type GardenViewPreset = 'panoramic' | 'stream' | 'clearing' | 'canopy';
export type WindIntensity = 'calm' | 'gentle' | 'breeze';
export type RightPanelState = 'open' | 'collapsed' | 'expanded';
