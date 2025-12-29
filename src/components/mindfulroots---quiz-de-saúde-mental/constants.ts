import { Question, AnswerOption, ResultData, ScoreZone } from './types';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Alguns dias" },
  { value: 2, label: "Mais da metade dos dias" },
  { value: 3, label: "Quase todos os dias" },
];

export const QUESTIONS: Question[] = [
  { id: 1, text: "Senti pouca energia ou cansaço que não passa.", isInverse: false },
  { id: 2, text: "Tive dificuldade para dormir (pegar no sono, manter, ou acordei cedo demais).", isInverse: false },
  { id: 3, text: "Me senti ansioso(a), tenso(a) ou “no modo alerta”.", isInverse: false },
  { id: 4, text: "Tive pensamentos acelerados ou dificuldade de desligar a mente.", isInverse: false },
  { id: 5, text: "Me senti triste, desanimado(a) ou sem esperança.", isInverse: false },
  { id: 6, text: "Perdi interesse/prazer em coisas que normalmente gosto.", isInverse: false },
  { id: 7, text: "Me senti irritado(a) com facilidade (pavio curto).", isInverse: false },
  { id: 8, text: "Tive dificuldade de concentração (ler, trabalhar, conversar).", isInverse: false },
  { id: 9, text: "Evitei pessoas/atividades por falta de vontade ou medo/desconforto.", isInverse: false },
  { id: 10, text: "Senti culpa excessiva ou me cobrei além do limite.", isInverse: false },
  { id: 11, text: "Me senti sobrecarregado(a), como se “não desse conta”.", isInverse: false },
  { id: 12, text: "Usei comida, álcool, telas ou compras como fuga com frequência.", isInverse: false },
  { id: 13, text: "Senti sintomas físicos por estresse (tensão, dor de cabeça, nó no peito/estômago).", isInverse: false },
  { id: 14, text: "Notei que pequenas coisas viraram grandes problemas na minha cabeça.", isInverse: false },
  { id: 15, text: "Consegui fazer pausas e me recuperar quando algo me estressou.", isInverse: true },
  { id: 16, text: "Senti que tenho alguém (ou algum lugar) onde posso buscar apoio.", isInverse: true },
];

export const BONUS_QUESTION = "Nas últimas 2 semanas, pensei que seria melhor não existir, me machucar, ou tive ideia de suicídio?";

export const getResultData = (score: number): ResultData => {
  if (score <= 12) {
    return {
      zone: 'green',
      score,
      title: 'Zona Verde',
      description: 'Sinais leves ou esperados do dia a dia. Você parece estar lidando bem com os desafios atuais.',
      actionPlan: 'Manter hábitos base: sono regular, boa alimentação, movimento, contato social e pausas.'
    };
  } else if (score <= 24) {
    return {
      zone: 'yellow',
      score,
      title: 'Zona Amarela',
      description: 'Atenção. O estresse, ansiedade ou humor podem estar começando a impactar sua rotina.',
      actionPlan: 'Escolha 2 alavancas: Priorize o sono + estabeleça limites (tempo de tela/agenda) pelos próximos 7 dias.'
    };
  } else if (score <= 36) {
    return {
      zone: 'orange',
      score,
      title: 'Zona Laranja',
      description: 'Impacto moderado a alto. Seus sintomas estão consumindo energia significativa.',
      actionPlan: 'Adicionar apoio (terapia ou escuta ativa) + reduzir a carga imediatamente (delegar tarefas ou cortar excessos).'
    };
  } else {
    return {
      zone: 'red',
      score,
      title: 'Zona Vermelha',
      description: 'Impacto alto na qualidade de vida. É importante não enfrentar isso sozinho(a).',
      actionPlan: 'Apoio profissional + rede de segurança (não ficar sozinho(a) em momentos de crise, ativar plano de emergência).'
    };
  }
};

export const COLOR_MAP: Record<ScoreZone, string> = {
  green: 'text-boho-olive border-boho-olive bg-boho-olive/10',
  yellow: 'text-yellow-700 border-yellow-600 bg-yellow-50',
  orange: 'text-boho-terracotta border-boho-terracotta bg-boho-terracotta/10',
  red: 'text-boho-clay border-boho-clay bg-boho-clay/10',
};