/**
 * Types for Instituto Figura Viva - Portal do Aluno
 * Design System Figura Viva v1.0 - Registro Confluência
 */

export type UserRole = 'student' | 'admin' | 'tutor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export type ResourceStageState =
  | 'loading'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error';

export interface TelemetryEventPayload {
  resource_key: string;
  content_version: string;
  duration_range?: string;
  timestamp: string;
}

export type TelemetryEventType =
  | 'resource_opened'
  | 'resource_started'
  | 'resource_completed'
  | 'resource_abandoned'
  | 'resource_repeated'
  | 'save_failed';
