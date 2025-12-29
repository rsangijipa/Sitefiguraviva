import { TechniqueConfig } from './types';

export const TECHNIQUES: Record<string, TechniqueConfig> = {
  '4-6': {
    id: '4-6',
    title: '4 — 6 (Calma Rápida)',
    subtitle: 'Para ansiedade imediata',
    description: [
      'Inspire 4s pelo nariz',
      'Expire 6s pela boca',
      'Repita por 2 min'
    ],
    inhaleDuration: 4,
    holdDuration: 0,
    exhaleDuration: 6,
    holdAfterExhale: 0,
    color: 'bg-earth',
    icon: 'nose'
  },
  'pursed-lips': {
    id: 'pursed-lips',
    title: 'Lábios Semicerrados',
    subtitle: 'Controle e foco',
    description: [
      'Inspire pelo nariz',
      'Solte o ar devagar com bico',
      'Alongue a expiração'
    ],
    inhaleDuration: 4,
    holdDuration: 0,
    exhaleDuration: 8,
    holdAfterExhale: 0,
    color: 'bg-rust',
    icon: 'lips'
  }
};

export const SESSION_DURATION_SECONDS = 120; // 2 minutes
