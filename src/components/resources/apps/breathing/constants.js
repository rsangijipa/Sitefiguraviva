export const SESSION_DURATION_SECONDS = 120;

export const TECHNIQUES = {
  "4-6": {
    id: "4-6",
    title: "Relaxamento Rápido",
    subtitle: "Inspire em 4s, Expire em 6s",
    inhaleDuration: 4,
    holdDuration: 0,
    exhaleDuration: 6,
    holdAfterExhale: 0,
    color: "bg-accent",
    ringColor: "stroke-accent",
    instruction: "Inspire pelo nariz...",
    instructionExhale: "Expire pela boca...",
  },
  "pursed-lips": {
    id: "pursed-lips",
    title: "Lábios Semicerrados",
    subtitle: "Controle o fluxo de ar",
    inhaleDuration: 2,
    holdDuration: 0,
    exhaleDuration: 4,
    holdAfterExhale: 0,
    color: "bg-secondary",
    ringColor: "stroke-secondary",
    instruction: "Inspire fundo...",
    instructionExhale: "Sopre suavemente...",
  },
};
