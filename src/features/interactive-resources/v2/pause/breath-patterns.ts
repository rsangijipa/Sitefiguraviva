/** Padrões de respiração guiada. `to` é o nível de enchimento (0 = expirado, 1 = cheio) ao fim da fase. */
export type PhaseKind = "in" | "hold" | "out";
export interface BreathPhase { kind: PhaseKind; sec: number; to?: number; cue: string }
export interface BreathPattern { id: string; label: string; short: string; about: string; phases: BreathPhase[] }

const IN = (sec: number, to = 1, cue = "Inspire"): BreathPhase => ({ kind: "in", sec, to, cue });
const OUT = (sec: number, cue = "Expire"): BreathPhase => ({ kind: "out", sec, to: 0, cue });
const HOLD = (sec: number, cue = "Segure, sem forçar"): BreathPhase => ({ kind: "hold", sec, cue });

export const BREATH_PATTERNS: BreathPattern[] = [
  { id: "natural", label: "Natural", short: "No seu ritmo", about: "Sem contagem rígida: a mandala acompanha um ritmo calmo e você segue o seu.", phases: [IN(4.5), OUT(5.5)] },
  { id: "lento", label: "Lento 5–5", short: "≈ 6 por minuto", about: "Inspirar e expirar em 5 segundos, cerca de 6 respirações por minuto.", phases: [IN(5), OUT(5)] },
  { id: "caixa", label: "Caixa 4-4-4-4", short: "Quatro tempos", about: "Inspirar, segurar, expirar e segurar, cada um por 4 segundos. Estudos mostram menos reação ao estresse agudo.", phases: [IN(4), HOLD(4), OUT(4), HOLD(4, "Pausa vazia, sem forçar")] },
  { id: "478", label: "4-7-8", short: "Expiração longa", about: "Inspirar 4, segurar 7, expirar 8. Há pouca pesquisa sobre esta proporção; se incomodar, encurte a pausa ou não prenda o ar.", phases: [IN(4), HOLD(7), OUT(8)] },
  { id: "exp46", label: "Expiração 4–6", short: "Soltar mais devagar", about: "Expirar mais devagar do que inspirar costuma dar sensação de soltura.", phases: [IN(4), OUT(6)] },
  { id: "suspiro", label: "Suspiro cíclico", short: "Duas entradas, uma saída", about: "Duas inspirações curtas pelo nariz e uma expiração longa pela boca. Em comparação de Stanford, foi o que mais ajudou o humor.", phases: [IN(2, 0.8, "Inspire"), IN(1, 1, "Inspire mais um pouco"), OUT(6, "Solte devagar")] },
];
export const patternById = (id: string) => BREATH_PATTERNS.find(pattern => pattern.id === id) ?? BREATH_PATTERNS[0];
