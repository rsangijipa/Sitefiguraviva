export const SESSION_DURATION_SECONDS = 120;

export const TECHNIQUES = {
    '4-6': {
        id: '4-6',
        title: 'Relaxamento Rápido',
        subtitle: 'Inspire em 4s, Expire em 6s',
        inhaleTime: 4000,
        holdTime: 0,
        exhaleTime: 6000,
        holdPostExhaleTime: 0,
        color: 'bg-accent',
        ringColor: 'stroke-accent',
        instruction: 'Inspire pelo nariz...',
        instructionExhale: 'Expire pela boca...',
    },
    'pursed-lips': {
        id: 'pursed-lips',
        title: 'Lábios Semicerrados',
        subtitle: 'Controle o fluxo de ar',
        inhaleTime: 2000,
        holdTime: 0,
        exhaleTime: 4000, // Adjustable in mind, but fixed here for simplicity loop
        holdPostExhaleTime: 0,
        color: 'bg-secondary',
        ringColor: 'stroke-secondary',
        instruction: 'Inspire fundo...',
        instructionExhale: 'Sopre suavemente...',
    }
};
