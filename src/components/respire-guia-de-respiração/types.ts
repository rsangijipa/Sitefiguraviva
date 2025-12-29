export type TechniqueId = '4-6' | 'pursed-lips';

export interface TechniqueConfig {
  id: TechniqueId;
  title: string;
  subtitle: string;
  description: string[];
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  holdAfterExhale: number;
  color: string;
  icon: 'nose' | 'lips';
}

export type AppState = 'menu' | 'active' | 'completed';
