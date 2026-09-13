/**
 * Esquema de validação e restrições canônicas para Necessidades Agora
 */
import { NeedSelectionEntry, NeedRecordState } from './types';

export const CURRENT_NEEDS_CONSTRAINTS = {
  MAX_ENTRIES: 5,
  CUSTOM_LABEL_MAX_LENGTH: 80,
  CUSTOM_DESC_MAX_LENGTH: 200,
  SMALL_STEP_MAX_LENGTH: 300,
  ALLOWED_ICONS: [
    'Moon',
    'Users',
    'Shield',
    'Compass',
    'Feather',
    'HeartHandshake',
    'Key',
    'Eye',
    'Sun',
    'Wind',
    'Sparkles',
    'Trees',
  ] as const,
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateRecordPayload(data: {
  state: NeedRecordState;
  entries: NeedSelectionEntry[];
  focusEntryId: string | null;
  smallStep: string | null;
}): ValidationResult {
  if (data.state === 'selected') {
    if (!data.entries || data.entries.length === 0) {
      return { valid: false, error: 'O estado "selecionadas" requer ao menos 1 necessidade.' };
    }
    if (data.entries.length > CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES) {
      return {
        valid: false,
        error: `O limite máximo é de ${CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES} necessidades.`,
      };
    }
    // Verificar unicidade de labels
    const labels = new Set<string>();
    for (const entry of data.entries) {
      if (labels.has(entry.labelSnapshot.toLowerCase())) {
        return { valid: false, error: 'Não é permitida duplicação de necessidades.' };
      }
      labels.add(entry.labelSnapshot.toLowerCase());
      if (entry.labelSnapshot.length > CURRENT_NEEDS_CONSTRAINTS.CUSTOM_LABEL_MAX_LENGTH) {
        return { valid: false, error: 'Texto da necessidade excede o tamanho permitido.' };
      }
    }
    // Verificar se o foco pertence à lista
    if (data.focusEntryId) {
      const exists = data.entries.some((e) => e.entryId === data.focusEntryId);
      if (!exists) {
        return { valid: false, error: 'A necessidade selecionada para foco não está na lista.' };
      }
    }
  } else if (data.state === 'unsure') {
    if (data.entries && data.entries.length > 0) {
      return { valid: false, error: 'O estado de indefinição ("Ainda não sei") deve ter lista vazia.' };
    }
  }

  if (data.smallStep && data.smallStep.length > CURRENT_NEEDS_CONSTRAINTS.SMALL_STEP_MAX_LENGTH) {
    return {
      valid: false,
      error: `O gesto livre não pode exceder ${CURRENT_NEEDS_CONSTRAINTS.SMALL_STEP_MAX_LENGTH} caracteres.`,
    };
  }

  return { valid: true };
}
