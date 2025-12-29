export enum SupportCategory {
  PEOPLE = 'Pessoas',
  ROUTINES = 'Rotinas',
  PLACES = 'Lugares',
  PRACTICES = 'Práticas',
  BELIEFS = 'Crenças'
}

export interface SupportItem {
  id: string;
  text: string;
  category: SupportCategory;
}

export interface EnhancedSupportItem extends SupportItem {
  shortcut: string; // A small action to activate this support
}

export interface SupportKit {
  items: EnhancedSupportItem[];
  mantra: string;
  summary: string;
}

export type Step = 'welcome' | 'wizard' | 'processing' | 'result';