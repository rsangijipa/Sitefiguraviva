export type CardType =
  | "CONCEITO"
  | "AUTOR"
  | "CLÍNICA"
  | "CAMPO"
  | "FENOMENOLOGIA"
  | "PERGUNTA";

export type CardCategory =
  | "Conceitos"
  | "Autores"
  | "Perguntas"
  | "Clínica"
  | "Campo"
  | "Fenomenologia";

export type CardStatus = "publicado" | "rascunho" | "arquivado";

export interface GestaltCard {
  id: string;
  code: string; // e.g. 'FV · C023'
  type: CardType;
  category: CardCategory;
  title: string; // Fraunces display on front
  subtitle?: string;
  body: string; // Main definition or commentary in Karla
  author?: string;
  work?: string; // Obra
  year?: number | string;
  reference?: string; // Bibliographic citation
  reflection?: string; // "Para ficar com isso" short prompt
  deck: string; // e.g. "Fundamentos", "Prática Clínica"
  tags: string[];
  relatedCardIds: string[]; // up to 3 cards for Gestalt hypertext
  expandedNotes?: string; // "Aprofundar" full text
  portalReference?: string; // "Módulo 2 · Teoria do Self"
  status: CardStatus;
  updatedAt: string;
}

export interface StudyHistoryEntry {
  cardId: string;
  viewedAt: string;
  status: "explored" | "known" | "review" | "favorite";
}

export interface StudyStats {
  exploredCardsCount: number;
  favoriteCardIds: string[];
  reviewCardIds: string[];
  knownCardIds: string[];
  totalMinutesExplored: number;
  history: StudyHistoryEntry[];
}

export type ViewMode =
  | "home"
  | "explore"
  | "session"
  | "review"
  | "random"
  | "favorites"
  | "history"
  | "admin";

export interface FilterState {
  search: string;
  category: string;
  type: string;
  author: string;
  deck: string;
  filterBy: "all" | "favorites" | "review" | "unseen" | "explored";
}
