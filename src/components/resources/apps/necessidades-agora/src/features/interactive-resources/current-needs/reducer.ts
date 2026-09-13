/**
 * State machine e Reducer para a experiência Necessidades Agora
 */
import { CURRENT_NEEDS_CONSTRAINTS } from './schema';
import { CurrentNeedsState, NeedSelectionEntry, ExperienceStep } from './types';

export type CurrentNeedsAction =
  | { type: 'START_EXPERIENCE' }
  | { type: 'TOGGLE_NEED'; need: { id: string; name: string; shortDescription: string } }
  | { type: 'ADD_CUSTOM_NEED'; label: string; description?: string }
  | { type: 'REMOVE_ENTRY'; entryId: string }
  | { type: 'SELECT_UNSURE' }
  | { type: 'SWITCH_TO_SELECTING' }
  | { type: 'SET_ORDERED'; ordered: boolean }
  | { type: 'REORDER_ENTRIES'; newEntries: NeedSelectionEntry[] }
  | { type: 'MOVE_ENTRY'; entryId: string; direction: 'up' | 'down' }
  | { type: 'SET_FOCUS_ENTRY'; entryId: string | null }
  | { type: 'SET_SMALL_STEP'; text: string }
  | { type: 'SET_STEP'; step: ExperienceStep }
  | { type: 'SET_INSPECTED_NEED'; needId: string | null }
  | { type: 'CLEAR_EXPLANATION' }
  | { type: 'OPEN_CUSTOM_MODAL' }
  | { type: 'CLOSE_CUSTOM_MODAL' }
  | { type: 'OPEN_EXIT_DIALOG' }
  | { type: 'CLOSE_EXIT_DIALOG' }
  | { type: 'START_SAVING' }
  | { type: 'SAVE_SUCCESS'; recordId: string }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'RESET_EXPERIENCE' };

export const initialCurrentNeedsState: CurrentNeedsState = {
  step: 'intro',
  contentVersion: '1.0.0',
  stateType: 'selected',
  selectedEntries: [],
  ordered: false,
  focusEntryId: null,
  smallStep: '',
  customLabelInput: '',
  customDescInput: '',
  showCustomModal: false,
  inspectedNeedId: null,
  explanationMessage: null,
  hasUnsavedChanges: false,
  showExitDialog: false,
  isSaving: false,
  saveError: null,
  currentRecordId: null,
};

export function currentNeedsReducer(
  state: CurrentNeedsState,
  action: CurrentNeedsAction
): CurrentNeedsState {
  switch (action.type) {
    case 'START_EXPERIENCE':
      return {
        ...state,
        step: 'selecting',
        explanationMessage: null,
      };

    case 'TOGGLE_NEED': {
      // Se estava em 'unsure', mudar para 'selected'
      const isCurrentlyUnsure = state.stateType === 'unsure';
      const alreadySelected = state.selectedEntries.some(
        (e) => e.needId === action.need.id
      );

      if (alreadySelected) {
        // Remover
        const updated = state.selectedEntries.filter(
          (e) => e.needId !== action.need.id
        );
        const removedEntry = state.selectedEntries.find((e) => e.needId === action.need.id);
        const focusStillValid =
          state.focusEntryId && removedEntry && state.focusEntryId !== removedEntry.entryId
            ? state.focusEntryId
            : null;

        return {
          ...state,
          selectedEntries: updated,
          focusEntryId: focusStillValid,
          hasUnsavedChanges: updated.length > 0,
          explanationMessage: null,
        };
      } else {
        // Adicionar
        if (state.selectedEntries.length >= CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES) {
          return {
            ...state,
            explanationMessage: `Você já selecionou 5 necessidades. Para adicionar outra, remova uma das anteriores.`,
          };
        }

        const newEntry: NeedSelectionEntry = {
          entryId: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          needId: action.need.id,
          labelSnapshot: action.need.name,
          descriptionSnapshot: action.need.shortDescription,
          isCustom: false,
        };

        return {
          ...state,
          stateType: 'selected',
          selectedEntries: isCurrentlyUnsure ? [newEntry] : [...state.selectedEntries, newEntry],
          hasUnsavedChanges: true,
          explanationMessage: null,
        };
      }
    }

    case 'ADD_CUSTOM_NEED': {
      const cleanLabel = action.label.trim();
      if (!cleanLabel) return state;

      if (state.selectedEntries.length >= CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES) {
        return {
          ...state,
          explanationMessage: `Você já selecionou 5 necessidades. Para adicionar outra, remova uma das anteriores.`,
        };
      }

      // Evitar duplicação
      const duplicate = state.selectedEntries.some(
        (e) => e.labelSnapshot.toLowerCase() === cleanLabel.toLowerCase()
      );
      if (duplicate) {
        return {
          ...state,
          explanationMessage: `Você já tem uma necessidade chamada "${cleanLabel}" selecionada.`,
        };
      }

      const customEntry: NeedSelectionEntry = {
        entryId: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        needId: null,
        labelSnapshot: cleanLabel.slice(0, CURRENT_NEEDS_CONSTRAINTS.CUSTOM_LABEL_MAX_LENGTH),
        descriptionSnapshot: action.description?.trim().slice(0, CURRENT_NEEDS_CONSTRAINTS.CUSTOM_DESC_MAX_LENGTH) || undefined,
        isCustom: true,
      };

      return {
        ...state,
        stateType: 'selected',
        selectedEntries: [...state.selectedEntries, customEntry],
        showCustomModal: false,
        customLabelInput: '',
        customDescInput: '',
        hasUnsavedChanges: true,
        explanationMessage: null,
      };
    }

    case 'REMOVE_ENTRY': {
      const updated = state.selectedEntries.filter((e) => e.entryId !== action.entryId);
      const isFocusRemoved = state.focusEntryId === action.entryId;

      return {
        ...state,
        selectedEntries: updated,
        focusEntryId: isFocusRemoved ? null : state.focusEntryId,
        hasUnsavedChanges: updated.length > 0 || !!state.smallStep,
        explanationMessage: null,
      };
    }

    case 'SELECT_UNSURE':
      return {
        ...state,
        stateType: 'unsure',
        selectedEntries: [],
        focusEntryId: null,
        ordered: false,
        hasUnsavedChanges: true,
        explanationMessage: null,
        step: 'optionalStep',
      };

    case 'SWITCH_TO_SELECTING':
      return {
        ...state,
        stateType: 'selected',
        step: 'selecting',
      };

    case 'SET_ORDERED':
      return {
        ...state,
        ordered: action.ordered,
        hasUnsavedChanges: true,
      };

    case 'REORDER_ENTRIES':
      return {
        ...state,
        selectedEntries: action.newEntries,
        ordered: true,
        hasUnsavedChanges: true,
      };

    case 'MOVE_ENTRY': {
      const idx = state.selectedEntries.findIndex((e) => e.entryId === action.entryId);
      if (idx === -1) return state;

      const targetIdx = action.direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= state.selectedEntries.length) return state;

      const newEntries = [...state.selectedEntries];
      const [item] = newEntries.splice(idx, 1);
      newEntries.splice(targetIdx, 0, item);

      return {
        ...state,
        selectedEntries: newEntries,
        ordered: true,
        hasUnsavedChanges: true,
      };
    }

    case 'SET_FOCUS_ENTRY':
      return {
        ...state,
        focusEntryId: action.entryId,
        hasUnsavedChanges: true,
      };

    case 'SET_SMALL_STEP':
      return {
        ...state,
        smallStep: action.text.slice(0, CURRENT_NEEDS_CONSTRAINTS.SMALL_STEP_MAX_LENGTH),
        hasUnsavedChanges: true,
      };

    case 'SET_STEP':
      return {
        ...state,
        step: action.step,
        explanationMessage: null,
      };

    case 'SET_INSPECTED_NEED':
      return {
        ...state,
        inspectedNeedId: action.needId,
      };

    case 'CLEAR_EXPLANATION':
      return {
        ...state,
        explanationMessage: null,
      };

    case 'OPEN_CUSTOM_MODAL':
      return {
        ...state,
        showCustomModal: true,
        customLabelInput: '',
        customDescInput: '',
      };

    case 'CLOSE_CUSTOM_MODAL':
      return {
        ...state,
        showCustomModal: false,
      };

    case 'OPEN_EXIT_DIALOG':
      return {
        ...state,
        showExitDialog: true,
      };

    case 'CLOSE_EXIT_DIALOG':
      return {
        ...state,
        showExitDialog: false,
      };

    case 'START_SAVING':
      return {
        ...state,
        isSaving: true,
        saveError: null,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        saveError: null,
        hasUnsavedChanges: false,
        currentRecordId: action.recordId,
        step: 'saved',
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isSaving: false,
        saveError: action.error,
      };

    case 'RESET_EXPERIENCE':
      return {
        ...initialCurrentNeedsState,
      };

    default:
      return state;
  }
}
