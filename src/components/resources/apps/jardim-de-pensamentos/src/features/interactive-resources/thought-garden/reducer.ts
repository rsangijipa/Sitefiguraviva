/**
 * Reducer e gerenciamento de estado para o Jardim de Pensamentos
 * Estados previsíveis: intro -> ready -> active -> paused -> completed -> empty -> error
 */

import { GardenLeaf, ExperienceState } from './types';
import { THOUGHT_LIMITS } from './schema';

export interface ThoughtGardenState {
  experienceState: ExperienceState;
  leaves: GardenLeaf[];
  selectedLeafId: string | null;
  editingLeafId: string | null;
  isFloatingPaused: boolean;
  reducedMotion: boolean;
  isMuted: boolean;
  sessionStartedAt: number;
  activeAnnouncement: string | null;
  errorNotice: string | null;
}

export type ThoughtGardenAction =
  | { type: 'START_EXPERIENCE' }
  | { type: 'COMPLETE_EXPERIENCE' }
  | { type: 'EXIT_EXPERIENCE' }
  | { type: 'SET_EXPERIENCE_STATE'; payload: ExperienceState }
  | { type: 'PLACE_LEAF'; payload: { text: string; optional_title?: string | null } }
  | { type: 'SELECT_LEAF'; payload: string | null }
  | { type: 'START_EDIT_LEAF'; payload: string }
  | { type: 'CANCEL_EDIT_LEAF' }
  | { type: 'UPDATE_LEAF'; payload: { id: string; text: string; optional_title?: string | null } }
  | { type: 'FLOAT_LEAF'; payload: string }
  | { type: 'LAND_LEAF'; payload: string }
  | { type: 'TOGGLE_PAUSE_FLOATING' }
  | { type: 'REMOVE_LEAF_FROM_SESSION'; payload: string }
  | { type: 'MARK_LEAF_AS_SAVED'; payload: { leafId: string; recordId: string } }
  | { type: 'TOGGLE_REDUCED_MOTION' }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_ANNOUNCEMENT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const COLOR_VARIANTS: GardenLeaf['colorVariant'][] = [
  'folha-verde',
  'folha-terra',
  'folha-areia',
  'folha-igarape',
];

// Distribuição orgânica predefinida em proporções naturais para canteiros do jardim
const ORGANIC_POSITIONS = [
  { x: 0.18, y: 0.28, rot: -8 },
  { x: 0.52, y: 0.22, rot: 6 },
  { x: 0.78, y: 0.35, rot: -12 },
  { x: 0.28, y: 0.52, rot: 10 },
  { x: 0.65, y: 0.58, rot: -5 },
  { x: 0.42, y: 0.78, rot: 14 },
  { x: 0.15, y: 0.72, rot: -7 },
  { x: 0.82, y: 0.75, rot: 8 },
];

export const initialThoughtGardenState: ThoughtGardenState = {
  experienceState: 'intro',
  leaves: [],
  selectedLeafId: null,
  editingLeafId: null,
  isFloatingPaused: false,
  reducedMotion: false,
  isMuted: true,
  sessionStartedAt: Date.now(),
  activeAnnouncement: null,
  errorNotice: null,
};

export function thoughtGardenReducer(
  state: ThoughtGardenState,
  action: ThoughtGardenAction
): ThoughtGardenState {
  switch (action.type) {
    case 'START_EXPERIENCE':
      return {
        ...state,
        experienceState: state.leaves.length === 0 ? 'empty' : 'active',
        sessionStartedAt: Date.now(),
        activeAnnouncement: 'Você entrou no jardim de pensamentos. Escreva se quiser.',
      };

    case 'COMPLETE_EXPERIENCE':
      return {
        ...state,
        experienceState: 'completed',
        selectedLeafId: null,
        editingLeafId: null,
        // Limpa folhas efêmeras não guardadas ao encerrar, mantendo respeito à sessão
        leaves: state.leaves.filter((l) => Boolean(l.savedRecordId)),
        activeAnnouncement: 'Experiência encerrada. Você pode voltar quando quiser.',
      };

    case 'EXIT_EXPERIENCE':
      return {
        ...initialThoughtGardenState,
        reducedMotion: state.reducedMotion,
        isMuted: state.isMuted,
      };

    case 'SET_EXPERIENCE_STATE':
      return {
        ...state,
        experienceState: action.payload,
      };

    case 'PLACE_LEAF': {
      if (state.leaves.length >= THOUGHT_LIMITS.MAX_SESSION_LEAVES) {
        return {
          ...state,
          errorNotice: `Você atingiu o limite de ${THOUGHT_LIMITS.MAX_SESSION_LEAVES} folhas nesta sessão. Escolha guardar ou retirar alguma antes de criar novas.`,
        };
      }

      const leafIndex = state.leaves.length;
      const pos = ORGANIC_POSITIONS[leafIndex % ORGANIC_POSITIONS.length];
      // Adiciona leve jitter aleatório nas posições para naturalidade orgânica
      const jitterX = (Math.random() - 0.5) * 0.08;
      const jitterY = (Math.random() - 0.5) * 0.06;

      const newLeaf: GardenLeaf = {
        id: `leaf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: action.payload.text,
        optional_title: action.payload.optional_title || null,
        status: 'placed',
        isFloating: false,
        leafShapeIndex: leafIndex % 5,
        colorVariant: COLOR_VARIANTS[leafIndex % COLOR_VARIANTS.length],
        xRatio: Math.min(0.88, Math.max(0.12, pos.x + jitterX)),
        yRatio: Math.min(0.82, Math.max(0.18, pos.y + jitterY)),
        rotationDeg: pos.rot + Math.round((Math.random() - 0.5) * 6),
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        leaves: [...state.leaves, newLeaf],
        experienceState: 'active',
        selectedLeafId: newLeaf.id,
        errorNotice: null,
        activeAnnouncement: 'Folha pousada no jardim. Você pode observá-la, guardá-la ou deixá-la flutuar.',
      };
    }

    case 'SELECT_LEAF':
      return {
        ...state,
        selectedLeafId: action.payload,
        activeAnnouncement: action.payload ? 'Folha selecionada para leitura e reflexão.' : 'Seleção liberada.',
      };

    case 'START_EDIT_LEAF':
      return {
        ...state,
        editingLeafId: action.payload,
      };

    case 'CANCEL_EDIT_LEAF':
      return {
        ...state,
        editingLeafId: null,
      };

    case 'UPDATE_LEAF':
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload.id
            ? {
                ...l,
                text: action.payload.text,
                optional_title: action.payload.optional_title || null,
              }
            : l
        ),
        editingLeafId: null,
        activeAnnouncement: 'Conteúdo da folha atualizado nesta sessão.',
      };

    case 'FLOAT_LEAF':
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload
            ? {
                ...l,
                isFloating: true,
                status: 'floating',
              }
            : l
        ),
        activeAnnouncement: state.reducedMotion
          ? 'Folha em modo de observação estática.'
          : 'Folha flutuando suavemente pelo jardim.',
      };

    case 'LAND_LEAF':
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload
            ? {
                ...l,
                isFloating: false,
                status: 'placed',
              }
            : l
        ),
        activeAnnouncement: 'Folha trazida de volta ao canteiro.',
      };

    case 'TOGGLE_PAUSE_FLOATING': {
      const nextPaused = !state.isFloatingPaused;
      return {
        ...state,
        isFloatingPaused: nextPaused,
        activeAnnouncement: nextPaused ? 'Movimento das folhas pausado.' : 'Movimento das folhas retomado.',
      };
    }

    case 'REMOVE_LEAF_FROM_SESSION': {
      const remaining = state.leaves.filter((l) => l.id !== action.payload);
      return {
        ...state,
        leaves: remaining,
        selectedLeafId: state.selectedLeafId === action.payload ? null : state.selectedLeafId,
        editingLeafId: state.editingLeafId === action.payload ? null : state.editingLeafId,
        experienceState: remaining.length === 0 ? 'empty' : state.experienceState,
        activeAnnouncement: 'Folha retirada desta sessão.',
      };
    }

    case 'MARK_LEAF_AS_SAVED':
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload.leafId
            ? {
                ...l,
                savedRecordId: action.payload.recordId,
              }
            : l
        ),
        activeAnnouncement: 'Pensamento guardado no seu histórico privado.',
      };

    case 'TOGGLE_REDUCED_MOTION':
      return {
        ...state,
        reducedMotion: !state.reducedMotion,
        activeAnnouncement: !state.reducedMotion
          ? 'Modo de movimento reduzido ativado.'
          : 'Modo de movimento reduzido desativado.',
      };

    case 'SET_REDUCED_MOTION':
      return {
        ...state,
        reducedMotion: action.payload,
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
        activeAnnouncement: !state.isMuted ? 'Áudio ativado.' : 'Áudio silenciado.',
      };

    case 'SET_ANNOUNCEMENT':
      return {
        ...state,
        activeAnnouncement: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        errorNotice: action.payload,
      };

    default:
      return state;
  }
}
