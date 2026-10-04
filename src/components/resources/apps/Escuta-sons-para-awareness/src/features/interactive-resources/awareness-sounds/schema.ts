/**
 * Validação rigorosa dos dados de escuta para Sons para Awareness
 * Segue diretriz: Sem interpretação clínica, salvamento mínimo, restrições de tamanho.
 */

import {
  PerceivedDirection,
  PerceivedDistance,
  ResourceMode,
  SceneObservation,
  SoundId,
  SoundQuality,
} from './types';

export const VALID_MODES: ResourceMode[] = ['free', 'guided', 'text'];

export const VALID_SOUND_IDS: SoundId[] = [
  'agua-corrente',
  'folhas-vento',
  'chuva-suave',
  'passaro-distante',
];

export const VALID_DIRECTIONS: PerceivedDirection[] = [
  'esquerda',
  'centro',
  'direita',
  'frente',
  'atras',
  'nao_sei',
];

export const VALID_DISTANCES: PerceivedDistance[] = [
  'perto',
  'intermediario',
  'longe',
  'nao_sei',
];

export const VALID_QUALITIES: SoundQuality[] = [
  'suave',
  'continuo',
  'intermitente',
  'grave',
  'agudo',
];

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  sanitized?: T;
}

export function validateObservation(obs: Partial<SceneObservation>): ValidationResult<SceneObservation> {
  const errors: string[] = [];

  if (!obs.soundId || !VALID_SOUND_IDS.includes(obs.soundId)) {
    errors.push('Identificador do som inválido ou ausente.');
  }

  if (obs.perceivedDirection && !VALID_DIRECTIONS.includes(obs.perceivedDirection)) {
    errors.push('Direção percebida não reconhecida.');
  }

  if (obs.perceivedDistance && !VALID_DISTANCES.includes(obs.perceivedDistance)) {
    errors.push('Distância percebida não reconhecida.');
  }

  if (obs.qualities && obs.qualities.length > 5) {
    errors.push('Máximo de 5 qualidades sonoras permitidas.');
  }

  let sanitizedCustom: string | null = null;
  if (obs.customQuality) {
    const trimmed = obs.customQuality.trim();
    if (trimmed.length > 120) {
      errors.push('Termo descritivo próprio excede 120 caracteres.');
    } else if (trimmed.length > 0) {
      sanitizedCustom = trimmed;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      soundId: obs.soundId!,
      soundVersion: obs.soundVersion || '1.0.0',
      configuredPosition: obs.configuredPosition || { x: 0, y: 0, distanceTier: 'medio' },
      perceivedDirection: obs.perceivedDirection || null,
      perceivedDistance: obs.perceivedDistance || null,
      qualities: obs.qualities || [],
      customQuality: sanitizedCustom,
      revealedAt: obs.revealedAt,
    },
  };
}

export function validateReflection(text: string | null | undefined): ValidationResult<string | null> {
  if (!text) {
    return { isValid: true, errors: [], sanitized: null };
  }

  const trimmed = text.trim();
  if (trimmed.length > 500) {
    return {
      isValid: false,
      errors: ['A reflexão pessoal não pode exceder 500 caracteres.'],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: trimmed.length > 0 ? trimmed : null,
  };
}
