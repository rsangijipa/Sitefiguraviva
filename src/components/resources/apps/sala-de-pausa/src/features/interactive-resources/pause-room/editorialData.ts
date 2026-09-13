/**
 * @license
 * Instituto Figura Viva - Registro Tipado de Práticas da Sala de Pausa
 * Versionamento editorial v1.0.0 (Registro Confluência)
 */

import { PausePracticeConfig, PausePracticeId } from '../../../types';

export const PAUSE_PRACTICES: Record<PausePracticeId, PausePracticeConfig> = {
  breathing: {
    id: 'breathing',
    title: 'Respirar',
    shortDescription: 'Perceba sua respiração natural, no ritmo que for confortável.',
    invitationText: 'Perceba sua respiração como ela está. Acompanhe a forma apenas se for confortável.',
    guidanceText: 'Não há meta de segundos ou retenção obrigatória. Deixe o ar entrar e sair no seu tempo.',
    iconName: 'wind',
    defaultDurationSeconds: 180,
    supportedDurations: [120, 180, 300],
    capabilities: {
      audio: false,
      motion: true,
      staticAlternative: true,
    },
    version: '1.0.0',
  },
  observing: {
    id: 'observing',
    title: 'Observar',
    shortDescription: 'Note uma cor, uma forma ou uma textura no espaço em que você está.',
    invitationText: 'Encontre uma cor ao seu redor. Depois, perceba uma forma ou uma textura.',
    guidanceText: 'Atenção aberta ao ambiente imediato, sem tarefas ou contagens forçadas.',
    iconName: 'eye',
    defaultDurationSeconds: 180,
    supportedDurations: [120, 180, 300],
    capabilities: {
      audio: false,
      motion: false,
      staticAlternative: true,
    },
    version: '1.0.0',
  },
  listening: {
    id: 'listening',
    title: 'Ouvir',
    shortDescription: 'Ouça os sons naturais do ambiente ou uma paisagem suave de igarapé.',
    invitationText: 'Escolha um som e observe como ele se apresenta.',
    guidanceText: 'Selecione a escuta do seu ambiente ou uma frequência sutil de águas sem ruído.',
    iconName: 'headphones',
    defaultDurationSeconds: 180,
    supportedDurations: [120, 180, 300],
    capabilities: {
      audio: true,
      motion: false,
      staticAlternative: true,
    },
    version: '1.0.0',
  },
  movement: {
    id: 'movement',
    title: 'Movimentar',
    shortDescription: 'Soltura suave de mãos ou ombros, ou apenas permanecer em repouso.',
    invitationText: 'Se for confortável, experimente um pequeno movimento das mãos ou dos ombros. Você pode permanecer imóvel e apenas observar.',
    guidanceText: 'Sem exigência de esforço ou flexibilidade. Escolha sua posição de conforto.',
    iconName: 'activity',
    defaultDurationSeconds: 180,
    supportedDurations: [120, 180, 300],
    capabilities: {
      audio: false,
      motion: true,
      staticAlternative: true,
    },
    version: '1.0.0',
  },
  slowing: {
    id: 'slowing',
    title: 'Desacelerar',
    shortDescription: 'Deixe uma tarefa de lado e perceba a sustentação do chão ou da cadeira.',
    invitationText: 'Por alguns instantes, deixe uma tarefa de lado e perceba o apoio sob você.',
    guidanceText: 'Repouso da atenção, acolhendo o peso do corpo e o momento presente.',
    iconName: 'coffee',
    defaultDurationSeconds: 180,
    supportedDurations: [120, 180, 300],
    capabilities: {
      audio: false,
      motion: false,
      staticAlternative: true,
    },
    version: '1.0.0',
  },
};

export const PRACTICE_ORDER: PausePracticeId[] = [
  'breathing',
  'observing',
  'listening',
  'movement',
  'slowing',
];
