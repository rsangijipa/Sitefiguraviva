export type RelationalMovementType =
  | "approach"
  | "withdrawal"
  | "boundary"
  | "mixed";

export interface FieldDynamic {
  label: string;
  boundaryState: "porous" | "rigid" | "clear" | "confluent" | "withdrawn";
  separationDistance: number; // 20 (very close) to 220 (distant)
  tensionLevel: "low" | "moderate" | "high";
  organicDescription: string;
}

export interface InstituteAnalysis {
  hasObjectiveAnswer: boolean; // se existe ou não resposta formal/didática unívoca
  objectiveAnswerNote?: string; // Quando houver conteúdo didático objetivamente definido
  conceptName?: string; // e.g., 'Fronteira de Contato', 'Confluência', 'Diferenciação', 'Retroflexão'
  didacticExplanation: string; // Conteúdo formal do Instituto
}

export interface VignetteResponse {
  id: string;
  movementType: RelationalMovementType;
  actionText: string;
  relationalMovementLabel: string; // e.g., "Aproximação / Confluência", "Afastamento / Silenciamento", "Expressão Direta de Limite"
  distanceDelta: number; // -50 (close) to +80 (far)
  fieldDynamic: FieldDynamic;
  possibleReadings: string[]; // Possíveis leituras fenomênicas
  instituteAnalysis: InstituteAnalysis; // Separação didática objetiva
}

export interface Vignette {
  id: string;
  title: string;
  category:
    | "Trabalho & Profissional"
    | "Relações Afetivas"
    | "Família & Convivência"
    | "Amizades & Grupos"
    | "Autonomia & Limites";
  context: string;
  situation: string;
  responses: VignetteResponse[];
  reflectiveQuestion: string;
  instituteCoreLesson?: string; // Diretriz conceitual do Instituto sobre esta fronteira
  isDefault?: boolean;
  createdAt?: string;
}

export interface DiaryEntry {
  id: string;
  vignetteId: string;
  vignetteTitle: string;
  vignetteContext: string;
  selectedResponseId?: string;
  selectedResponseAction?: string;
  selectedMovementLabel?: string;
  reflectiveQuestion: string;
  reflectionText: string;
  bodyAwareness?: string; // O que o corpo registrou / sensações
  createdAt: string;
}

export type ActiveTab = "experiment" | "catalog" | "diary" | "admin" | "theory";
