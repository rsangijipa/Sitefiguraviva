export type ResourceCategory = 'PERCEBER' | 'REGULAR' | 'EXPERIMENTAR' | 'APRENDER';

export type MicroappState =
  | 'loading'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error'
  | 'reduced-motion';

export interface InteractiveResource {
  id: string;
  slug: string;
  name: string;
  category: ResourceCategory;
  description: string;
  durationApprox: string;
  iconName: 'wind' | 'tree' | 'activity' | 'waves' | 'sprout' | 'help-circle';
  isFeatured?: boolean;
}

export type ThoughtAction = 'deixar-aqui' | 'aproximar' | 'afastar' | 'guardar' | 'soltar';

export type BotanicalFormType =
  | 'folha-lanceolada'
  | 'ramo-confluente'
  | 'semente-alvorada'
  | 'folha-larga'
  | 'samambaia-flutuante';

export interface ThoughtLeaf {
  id: string;
  text: string;
  action: ThoughtAction;
  botanicalForm: BotanicalFormType;
  x: number; // 0 to 100 percentage in stage
  y: number; // 0 to 100 percentage in stage
  rotation: number;
  scale: number;
  opacity: number;
  hueTint: string;
  createdAt: string;
  isSaved?: boolean;
  serverId?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  resource_slug: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserEntry {
  id: string;
  user_id: string;
  resource_slug: string;
  session_id: string | null;
  payload: {
    text: string;
    action: string;
    botanical_form?: string;
    notes?: string;
  };
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cohort: string;
  role: string;
}
