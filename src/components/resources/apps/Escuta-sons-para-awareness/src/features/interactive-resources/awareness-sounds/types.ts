/**
 * Design System Figura Viva v1.0 - Registro Confluência
 * Tipos e interfaces de domínio para "Sons para Awareness"
 */

export type ResourceMode = 'free' | 'guided' | 'text';

export type SoundId = 'agua-corrente' | 'folhas-vento' | 'chuva-suave' | 'passaro-distante';

export type PerceivedDirection = 'esquerda' | 'centro' | 'direita' | 'frente' | 'atras' | 'nao_sei';

export type PerceivedDistance = 'perto' | 'intermediario' | 'longe' | 'nao_sei';

export type SoundQuality = 'suave' | 'continuo' | 'intermitente' | 'grave' | 'agudo';

export interface SoundAssetManifest {
  id: SoundId;
  title: string;
  description: string;
  category: string;
  durationSeconds: number;
  author: string;
  license: string;
  sourceUrl: string;
  mimeType: string;
  sizeBytes: number;
  version: string;
  textualDescription: string;
  defaultPosition: SoundPosition;
}

export interface SoundPosition {
  x: number; // -1.0 (esquerda) a +1.0 (direita)
  y: number; // -1.0 (atrás) a +1.0 (frente)
  distanceTier: 'perto' | 'medio' | 'longe';
  label?: string;
}

export interface GuidedScene {
  id: string;
  soundId: SoundId;
  title: string;
  configuredPosition: SoundPosition;
  revealedDescription: string;
  guidanceNote: string;
}

export interface SceneObservation {
  soundId: SoundId;
  soundVersion: string;
  configuredPosition: SoundPosition;
  perceivedDirection: PerceivedDirection | null;
  perceivedDistance: PerceivedDistance | null;
  qualities: SoundQuality[];
  customQuality: string | null;
  revealedAt?: string;
}

export interface InteractiveResourceSession {
  id: string;
  userId: string;
  resourceSlug: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  mode: ResourceMode;
  metadata: {
    audioEnabled: boolean;
    spatialEngine: 'hrtf' | 'stereo' | 'none';
    headphonesRecommendedUsed: boolean;
    observationsCount: number;
    reducedMotion: boolean;
  };
  createdAt: string;
}

export interface ListeningSessionEntry {
  id: string;
  userId: string;
  resourceSlug: 'sons-para-awareness';
  sessionId: string;
  clientRequestId: string;
  schemaVersion: number;
  contentVersion: string;
  mode: ResourceMode;
  durationSeconds: number;
  observations: SceneObservation[];
  personalReflection: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceContentVersion {
  id: string;
  resourceKey: 'sons-para-awareness';
  version: string;
  status: 'draft' | 'published' | 'archived';
  scenesCount: number;
  reviewer: string;
  changelog: string;
  publishedAt?: string;
  updatedAt: string;
}

export type TelemetryEventName =
  | 'resource_started'
  | 'resource_completed'
  | 'resource_abandoned'
  | 'resource_repeated';

export interface TelemetryEvent {
  eventName: TelemetryEventName;
  resourceSlug: 'sons-para-awareness';
  mode: ResourceMode;
  timestamp: string;
  durationBucket?: 'curto_sub_2m' | 'medio_2_5m' | 'longo_sup_5m';
}
