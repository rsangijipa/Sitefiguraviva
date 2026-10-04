/**
 * Tipos de domínio para a experiência "Necessidades Agora"
 * Registro Confluência - Instituto Figura Viva
 */

export type NeedCategory =
  | 'ritmo'
  | 'relacao'
  | 'cuidado'
  | 'espaco'
  | 'expressao'
  | 'compreensao';

export interface NeedCatalogItem {
  id: string;
  name: string;
  shortDescription: string;
  reflectionQuestion?: string;
  gestureExample?: string;
  category: NeedCategory;
  iconName: string;
  active: boolean;
  orderIndex: number;
}

export interface NeedSelectionEntry {
  entryId: string; // identificador único nesta seleção
  needId: string | null; // nulo se for personalizada ("Outra, em minhas palavras")
  labelSnapshot: string;
  descriptionSnapshot?: string;
  isCustom?: boolean;
}

export type ExperienceStep =
  | 'intro'
  | 'selecting'
  | 'prioritizing'
  | 'optionalStep'
  | 'reviewing'
  | 'saved'
  | 'exit';

export type NeedRecordState = 'selected' | 'unsure';

export interface NeedRecord {
  id: string;
  userId: string;
  clientRequestId: string;
  schemaVersion: number;
  contentVersion: string;
  state: NeedRecordState;
  entries: NeedSelectionEntry[];
  ordered: boolean; // se o usuário ativou ordenação por presença
  focusEntryId: string | null; // item marcado como "Quero observar esta primeiro"
  smallStep: string | null; // gesto opcional livre de até 300 caracteres
  createdAt: string;
  updatedAt: string;
}

export interface CurrentNeedsState {
  step: ExperienceStep;
  contentVersion: string;
  stateType: NeedRecordState;
  selectedEntries: NeedSelectionEntry[];
  ordered: boolean;
  focusEntryId: string | null;
  smallStep: string;
  // Feedback e estados transitórios
  customLabelInput: string;
  customDescInput: string;
  showCustomModal: boolean;
  inspectedNeedId: string | null; // card aberto para leitura sem selecionar
  explanationMessage: string | null;
  hasUnsavedChanges: boolean;
  showExitDialog: boolean;
  isSaving: boolean;
  saveError: string | null;
  currentRecordId: string | null;
}

export interface CatalogVersion {
  version: string;
  publishedAt: string;
  publishedBy: string;
  status: 'draft' | 'published' | 'archived';
  items: NeedCatalogItem[];
  editorialIntro: {
    title: string;
    subtitle: string;
    supportText: string;
    estimatedTime: string;
  };
}
