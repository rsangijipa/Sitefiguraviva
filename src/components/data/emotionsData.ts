import { EmotionFamily, BodyAnchor } from '../types';

/**
 * Famílias e nuances emocionais estruturadas para exploração fenomenológica.
 * Princípio: Não classificar como positivo ou negativo; toda emoção é um movimento
 * somático e psíquico que carrega informação e presença.
 */
export const EMOTION_FAMILIES: EmotionFamily[] = [
  {
    id: 'alegria',
    name: 'Alegria & Contentamento',
    colorAccent: '#005A1F', // Verde Raiz
    subtleBg: '#F1E9DB',   // Areia
    borderColor: '#005A1F',
    description: 'Movimento de expansão, vitalidade e acolhimento do momento presente.',
    secondaries: [
      {
        id: 'serenidade',
        name: 'Serenidade',
        nuances: [
          {
            id: 'tranquilidade',
            name: 'Tranquilidade',
            phenomenologicalDescription: 'Uma sensação de respiração ampla e ausência de urgência.',
          },
          {
            id: 'paz-interior',
            name: 'Paz Interior',
            phenomenologicalDescription: 'Um ancoramento estável no centro do corpo, como terra firme.',
          },
          {
            id: 'plenitude',
            name: 'Plenitude',
            phenomenologicalDescription: 'A percepção de suficiência, onde nada falta e nada sobra.',
          },
        ],
      },
      {
        id: 'entusiasmo',
        name: 'Entusiasmo',
        nuances: [
          {
            id: 'vitalidade',
            name: 'Vitalidade',
            phenomenologicalDescription: 'Uma corrente de calor ou pulsação viva que percorre o peito e membros.',
          },
          {
            id: 'curiosidade-viva',
            name: 'Curiosidade Viva',
            phenomenologicalDescription: 'Olhar aberto voltado ao que se apresenta de novo no campo.',
          },
          {
            id: 'animacao',
            name: 'Animação',
            phenomenologicalDescription: 'Um impulso leve de movimento e aproximação com o mundo.',
          },
        ],
      },
      {
        id: 'gratidao',
        name: 'Gratidão',
        nuances: [
          {
            id: 'reconhecimento',
            name: 'Reconhecimento',
            phenomenologicalDescription: 'Sensação de ser tocado pelo valor de um gesto ou instante partilhado.',
          },
          {
            id: 'apreco',
            name: 'Apreço',
            phenomenologicalDescription: 'Um calor brando que se expande a partir da região cardíaca.',
          },
          {
            id: 'reverencia',
            name: 'Reverência',
            phenomenologicalDescription: 'Um silêncio respeitoso diante do que sustenta a existência.',
          },
        ],
      },
    ],
  },
  {
    id: 'tristeza',
    name: 'Tristeza & Recolhimento',
    colorAccent: '#07614C', // Verde Igarapé
    subtleBg: '#E9E3D5',
    borderColor: '#07614C',
    description: 'Movimento de recolhimento, assimilação de perdas e honra àquilo que tem valor.',
    secondaries: [
      {
        id: 'pesar',
        name: 'Pesar',
        nuances: [
          {
            id: 'luto',
            name: 'Luto',
            phenomenologicalDescription: 'Um peso no peito que acolhe a ausência e pede silêncio.',
          },
          {
            id: 'desolacao',
            name: 'Desolação',
            phenomenologicalDescription: 'Sensação de espaço vazio onde antes havia apoio.',
          },
          {
            id: 'comocao',
            name: 'Comoção',
            phenomenologicalDescription: 'Um nó suave na garganta diante da fragilidade compartilhada.',
          },
        ],
      },
      {
        id: 'saudade',
        name: 'Saudade',
        nuances: [
          {
            id: 'nostalgia',
            name: 'Nostalgia',
            phenomenologicalDescription: 'A presença sensível de um instante passado que continua ressoando.',
          },
          {
            id: 'desejo-retorno',
            name: 'Anseio por Retorno',
            phenomenologicalDescription: 'Um puxar brando no plexo solar por um lugar ou vínculo seguro.',
          },
          {
            id: 'ternura-antiga',
            name: 'Ternura Lembrada',
            phenomenologicalDescription: 'Reconhecer a beleza que existiu mesmo quando a forma mudou.',
          },
        ],
      },
      {
        id: 'introspeccao',
        name: 'Introspecção',
        nuances: [
          {
            id: 'quietude',
            name: 'Quietude',
            phenomenologicalDescription: 'Necessidade de recolher os sentidos para dentro e fechar os olhos.',
          },
          {
            id: 'desaceleracao',
            name: 'Desaceleração',
            phenomenologicalDescription: 'O corpo pede pouso, redução de estímulos e descanso.',
          },
          {
            id: 'sobriedade',
            name: 'Sobriedade',
            phenomenologicalDescription: 'Um olhar limpo e despojado de ilusões sobre a realidade.',
          },
        ],
      },
    ],
  },
  {
    id: 'raiva',
    name: 'Raiva & Firmeza',
    colorAccent: '#96551F', // Terra Barro
    subtleBg: '#EFE4D6',
    borderColor: '#96551F',
    description: 'Energia de delimitação de fronteiras, proteção do justo e clareza de posicionamento.',
    secondaries: [
      {
        id: 'indignacao',
        name: 'Indignação',
        nuances: [
          {
            id: 'senso-justica',
            name: 'Inconformismo Justo',
            phenomenologicalDescription: 'Uma verticalidade que se ergue na coluna diante do que ultrapassa limites.',
          },
          {
            id: 'clareza-moral',
            name: 'Firmeza de Princípio',
            phenomenologicalDescription: 'Percepção nítida de uma linha que não pode ser desrespeitada.',
          },
          {
            id: 'voz-firme',
            name: 'Prontidão Vocal',
            phenomenologicalDescription: 'Ar comprimido no peito que pede expressão límpida e direta.',
          },
        ],
      },
      {
        id: 'frustracao',
        name: 'Frustração',
        nuances: [
          {
            id: 'bloqueio',
            name: 'Percepção de Bloqueio',
            phenomenologicalDescription: 'Pressão nos maxilares ou punhos diante de um caminho obstruído.',
          },
          {
            id: 'impaciencia',
            name: 'Inquietação por Resolução',
            phenomenologicalDescription: 'Uma pulsação que quer ver o processo andar com rapidez.',
          },
          {
            id: 'desapontamento',
            name: 'Descompasso de Expectativa',
            phenomenologicalDescription: 'Uma quebra abrupta entre o planejado e o ocorrido.',
          },
        ],
      },
      {
        id: 'limite',
        name: 'Afirmação de Limite',
        nuances: [
          {
            id: 'basta',
            name: 'Não Acolhido',
            phenomenologicalDescription: 'Um estancar resoluto no ventre: momento de dizer até aqui.',
          },
          {
            id: 'protecao-espaco',
            name: 'Guarda de Território',
            phenomenologicalDescription: 'Sensação de fechar o círculo em torno do que é próprio.',
          },
          {
            id: 'autodeterminacao',
            name: 'Autodeterminação',
            phenomenologicalDescription: 'Um centramento firme nos próprios pés e ossos.',
          },
        ],
      },
    ],
  },
  {
    id: 'medo',
    name: 'Medo & Cautela',
    colorAccent: '#6B6B63', // Pedra
    subtleBg: '#ECEAE4',
    borderColor: '#6B6B63',
    description: 'Vigilância atenta para salvaguardar a integridade física, emocional e coletiva.',
    secondaries: [
      {
        id: 'apreensao',
        name: 'Apreensão',
        nuances: [
          {
            id: 'alerta',
            name: 'Alerta Sensorial',
            phenomenologicalDescription: 'Pupilas atentas, ouvidos aguçados para pequenos sinais no ambiente.',
          },
          {
            id: 'hesitacao',
            name: 'Hesitação Prudente',
            phenomenologicalDescription: 'Um passo suspenso no ar antes de pisar em terreno incerto.',
          },
          {
            id: 'frio-barriga',
            name: 'Frio no Ventre',
            phenomenologicalDescription: 'Movimento visceral rápido que avisa que algo requer cuidado.',
          },
        ],
      },
      {
        id: 'vulnerabilidade',
        name: 'Vulnerabilidade',
        nuances: [
          {
            id: 'desprotecao',
            name: 'Exposição Sensível',
            phenomenologicalDescription: 'Sensação de pele fina e desarmada diante dos outros.',
          },
          {
            id: 'delicadeza',
            name: 'Delicadeza Interna',
            phenomenologicalDescription: 'Reconhecimento de que se está diante de algo precioso e quebradiço.',
          },
          {
            id: 'humildade',
            name: 'Pequenez Reconhecida',
            phenomenologicalDescription: 'Aceitar que nem tudo está sob controle ou previsão.',
          },
        ],
      },
      {
        id: 'prudencia',
        name: 'Prudência',
        nuances: [
          {
            id: 'resguardo',
            name: 'Recuo Estratégico',
            phenomenologicalDescription: 'Dar um passo atrás para avaliar melhor o panorama.',
          },
          {
            id: 'cautela',
            name: 'Caminhar Compassado',
            phenomenologicalDescription: 'Movimentos deliberados e conscientes para evitar tropeços.',
          },
          {
            id: 'zelo',
            name: 'Zelo Protetivo',
            phenomenologicalDescription: 'Atenção dedicada a não machucar a si nem a outrem.',
          },
        ],
      },
    ],
  },
  {
    id: 'surpresa',
    name: 'Surpresa & Desassossego',
    colorAccent: '#262B22', // Mata
    subtleBg: '#EDEAE3',
    borderColor: '#262B22',
    description: 'Quebra súbita da continuidade habitual, convocando nova postura perceptiva.',
    secondaries: [
      {
        id: 'espanto',
        name: 'Espanto',
        nuances: [
          {
            id: 'assombro',
            name: 'Assombro',
            phenomenologicalDescription: 'Uma parada momentânea do fluxo de pensamento diante da magnitude.',
          },
          {
            id: 'estupefacao',
            name: 'Desconcerto',
            phenomenologicalDescription: 'Sensação de recalibrar a mente quando o esperado não acontece.',
          },
          {
            id: 'maravilhamento',
            name: 'Maravilhamento',
            phenomenologicalDescription: 'Respiração inspirada e suspensa diante do belo ou extraordinário.',
          },
        ],
      },
      {
        id: 'inquietacao',
        name: 'Inquietação',
        nuances: [
          {
            id: 'desassossego',
            name: 'Desassossego',
            phenomenologicalDescription: 'Um movimento interno difuso que não encontra postura de repouso imediata.',
          },
          {
            id: 'duvida-fertil',
            name: 'Dúvida Fértil',
            phenomenologicalDescription: 'O questionamento do que parecia óbvio abrindo novas perguntas.',
          },
          {
            id: 'estranhamento',
            name: 'Estranhamento',
            phenomenologicalDescription: 'Perceber algo familiar como se fosse visto pela primeira vez.',
          },
        ],
      },
      {
        id: 'abertura',
        name: 'Abertura ao Inédito',
        nuances: [
          {
            id: 'espaco-aberto',
            name: 'Espaço em Branco',
            phenomenologicalDescription: 'A sensação de uma folha virada onde nada ainda foi traçado.',
          },
          {
            id: 'disponibilidade',
            name: 'Disponibilidade',
            phenomenologicalDescription: 'Corpo solto e receptivo para acolher o que quer que chegue.',
          },
          {
            id: 'receptividade',
            name: 'Receptividade',
            phenomenologicalDescription: 'Acolher o inesperado sem resistência imediata.',
          },
        ],
      },
    ],
  },
  {
    id: 'afeto',
    name: 'Afeto & Conexão',
    colorAccent: '#4B4B49', // Grafite
    subtleBg: '#F3EFE7',
    borderColor: '#4B4B49',
    description: 'Movimento de aproximação, acolhimento mútuo e reconhecimento de humanidade comum.',
    secondaries: [
      {
        id: 'ternura',
        name: 'Ternura',
        nuances: [
          {
            id: 'docura',
            name: 'Doçura no Contato',
            phenomenologicalDescription: 'Suavização dos traços faciais e relaxamento dos ombros.',
          },
          {
            id: 'calor-humano',
            name: 'Calor Humano',
            phenomenologicalDescription: 'Uma irradiação tépida no tronco que convida ao abraço ou toque.',
          },
          {
            id: 'delicadeza-afetiva',
            name: 'Cuidado Delicado',
            phenomenologicalDescription: 'Gestos contidos e atenciosos para acolher a fragilidade alheia.',
          },
        ],
      },
      {
        id: 'compaixao',
        name: 'Compaixão',
        nuances: [
          {
            id: 'ressonancia',
            name: 'Ressonância com a Dor',
            phenomenologicalDescription: 'Sentir o coração apertar com a dor alheia, acompanhado do desejo de alívio.',
          },
          {
            id: 'solidariedade',
            name: 'Solidariedade',
            phenomenologicalDescription: 'Um estar ombro a ombro sem necessidade de fórmulas prontas.',
          },
          {
            id: 'autocompaixao',
            name: 'Acolhimento de Si',
            phenomenologicalDescription: 'Colocar a própria mão no peito e suspirar aliviado por não precisar ser perfeito.',
          },
        ],
      },
      {
        id: 'pertencimento',
        name: 'Pertencimento',
        nuances: [
          {
            id: 'enraizamento',
            name: 'Enraizamento Comunitário',
            phenomenologicalDescription: 'Saber-se parte de uma rede viva que acolhe e sustenta.',
          },
          {
            id: 'confianca-mutua',
            name: 'Confiança Mútua',
            phenomenologicalDescription: 'Relaxar o corpo no chão ou no apoio do outro sem temer a queda.',
          },
          {
            id: 'sintonia',
            name: 'Sintonia Afetiva',
            phenomenologicalDescription: 'O ritmo respiratório que encontra harmonia e repouso no encontro.',
          },
        ],
      },
    ],
  },
];

export const BODY_ANCHORS: BodyAnchor[] = [
  { id: 'peito', label: 'Peito / Região Cardíaca' },
  { id: 'garganta', label: 'Garganta / Voz' },
  { id: 'estomago', label: 'Estômago / Ventre' },
  { id: 'ombros', label: 'Ombros / Costas' },
  { id: 'cabeca', label: 'Cabeça / Têmporas' },
  { id: 'maos', label: 'Mãos / Braços' },
  { id: 'respiracao', label: 'Ritmo da Respiração' },
  { id: 'corpo-todo', label: 'Difuso no Corpo Todo' },
  { id: 'outro', label: 'Outro Ponto Específico' },
];

export const INTENSITY_LEVELS = [
  { level: 1, label: 'Sutil', description: 'Uma nuance quase imperceptível, como uma brisa leve.' },
  { level: 2, label: 'Presente', description: 'Claramente notável quando a atenção se volta a ela.' },
  { level: 3, label: 'Nítida', description: 'Ocupa o centro da percepção corporal com firmeza.' },
  { level: 4, label: 'Densa', description: 'Envolve o corpo e a mente de maneira marcante.' },
  { level: 5, label: 'Intensa', description: 'Vibrante e profunda, mobilizando toda a presença.' },
];
