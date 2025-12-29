import generatedCourses from './generatedCourses.json';

export const staticCourses = [
    {
        id: 'experiencia-atemporal',
        title: 'Experiência Atemporal',
        subtitle: 'Estudos e experimentação artística a partir do encontro entre Laura Perls e Nancy',
        category: 'Curso',
        status: 'Aberto',
        date: 'Início: 27 de fev 2026',
        fullDate: 'Fevereiro a Novembro de 2026', // For detail page
        image: '/assets/curso-experiencia-atemporal.jpg',
        images: ['/assets/curso-experiencia-atemporal.jpg'],
        mediators: ['Wanne Belmino', 'Lílian Gusmão'],
        tags: ['Online', 'Mensal', 'Gravado', '2026'],
        description: 'Percorrer o tempo no caminho de Laura desde a intimidade, com arte, história, cartas e composições únicas. Em algumas datas teremos o tempo de pausar, como proposta de acolher o tempo de assimilação das experiências vividas no grupo.',
        link: 'https://www.instagram.com/institutofiguraviva/',
        details: {
            intro: 'Percorrer o tempo no caminho de Laura desde a intimidade, com arte, história, cartas e composições únicas.',
            format: [
                'Encontros mensais on-line nas sextas-feiras, das 09h às 11h (horário de Brasília), gravados',
                'Material de suporte enviado com antecedência de 30 dias',
                'Estudos e experimentação artística e espaços de pausas',
                'Grupo de suporte, trocas e aquecimento pelo WhatsApp',
                'Material de suporte do livro-guia “Timeless Experience” (tradução livre) + materiais complementares'
            ],
            schedule: [
                '27/02', '27/03', '24/04', '15/05',
                '26/06', '17/07', '07/08', '28/08',
                '18/09', '09/10', '30/10', '27/11'
            ]
        }
    },
    ...generatedCourses
];
