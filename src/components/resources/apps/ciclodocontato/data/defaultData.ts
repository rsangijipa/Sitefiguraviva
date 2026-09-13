import { ContactStage, ScenarioItem, ContactCycleConfig } from "../types";

export const DEFAULT_CONFIG: ContactCycleConfig = {
  title: "Ciclo do Contato",
  description:
    "Uma experiência visual para explorar como uma necessidade pode emergir, ganhar forma, mobilizar ação, encontrar contato e depois ceder espaço.",
  introContent:
    "Este recurso apresenta uma organização didática do Ciclo do Contato na Gestalt-terapia. O processo não deve ser compreendido como uma sequência rígida ou universal.",
  completionContent:
    "Você percorreu seis momentos desta organização didática do contato. O campo continua aberto e novos movimentos podem emergir.",
  guidedEnabled: true,
  freeEnabled: true,
  practiceEnabled: true,
  estimatedMinutes: 10,
  status: "published",
};

export const DEFAULT_STAGES: ContactStage[] = [
  {
    id: "stage-1",
    slug: "sensacao",
    label: "Sensação",
    position: 1,
    shortDefinition:
      "Algo começa a acontecer antes mesmo de estar claramente nomeado.",
    essentialContent: [
      "A sensação é o ponto de partida no organismo, onde o fundo (campo) desperta e algum sinal corporal ou ambiental começa a se fazer notar.",
      "Neste momento, ainda não há uma forma definida ou um objeto claro de desejo; há apenas um eco físico ou uma modulação tônica.",
    ],
    expandedContent: [
      "Em Gestalt-terapia, o organismo está sempre em intercâmbio com o ambiente. A sensação sinaliza uma perturbação no equilíbrio (homeostase) que convoca a atenção.",
      "Pode manifestar-se como leve aperto, secura, calor, inquietação ou mudança no ritmo respiratório, antes que o córtex processe um significado completo.",
    ],
    everydayExample:
      "Você percebe uma leve secura na boca enquanto trabalha, sem ainda pensar conscientemente em água.",
    clinicalExample:
      "O cliente começa a falar de um assunto cotidiano e, simultaneamente, seus ombros se elevam e a respiração se torna curta.",
    reflectionQuestion:
      "O que aparece antes de você conseguir nomear claramente o que está acontecendo?",
    relatedConcepts: ["Campo", "Organismo-ambiente", "Homeostase"],
    references: [
      {
        id: "ref-1",
        author: "Perls, F.; Hefferline, R.; Goodman, P.",
        title: "Gestalt-Therapy",
        year: 1951,
        publisher: "Julian Press",
        pages: "220-225",
      },
    ],
    authorNote: "Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
  {
    id: "stage-2",
    slug: "awareness",
    label: "Awareness",
    position: 2,
    shortDefinition:
      "O que estava difuso começa a ganhar forma e pode ser reconhecido.",
    essentialContent: [
      "Awareness (conscientização imediata) é o processo pelo qual a sensação difusa se organiza em figura nítida.",
      "O sujeito dá-se conta do que está acontecendo aqui e agora, integrando percepções sensoriais e necessidades.",
    ],
    expandedContent: [
      "A awareness não é mera reflexão intelectual; é contato sensório-motor e emocional com a experiência atual. É o momento em que a figura se destaca com clareza sobre o fundo.",
      "Nesta fase, a pessoa reconhece: 'Estou sentindo sede' ou 'Percebo que este tema me incomoda'.",
    ],
    everydayExample:
      "Você reconhece nitidamente: 'Estou com sede e preciso beber algo agora'.",
    clinicalExample:
      "O cliente percebe e nomeia: 'Senti um aperto no peito quando você mencionou essa data'.",
    reflectionQuestion: "O que está se tornando figura neste exato momento?",
    relatedConcepts: ["Figura/Fundo", "Conscientização", "Aqui e Agora"],
    references: [
      {
        id: "ref-2",
        author: "Polster, E.; Polster, M.",
        title: "Gestalt Therapy Integrated",
        year: 1973,
        publisher: "Brunner/Mazel",
        pages: "140-145",
      },
    ],
    authorNote: "Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
  {
    id: "stage-3",
    slug: "mobilizacao",
    label: "Mobilização",
    position: 3,
    shortDefinition:
      "Quando algo ganha forma, pode surgir uma organização de energia em direção à ação.",
    essentialContent: [
      "Identificada a necessidade (awareness), a energia do organismo se organiza para responder ao que se apresentou.",
      "É o momento do impulso, da preparação e da escolha de direção.",
    ],
    expandedContent: [
      "A mobilização envolve tanto processos internos (decisão, intenção) quanto tônicos (preparação muscular e emocional para agir no campo).",
      "Pode haver hesitação ou bloqueios (confluência, introjeção, projeção, retroflexão, deflexão) que modularem ou interromperem essa energia.",
    ],
    everydayExample:
      "Você decide levantar da cadeira e planeja ir até a cozinha.",
    clinicalExample:
      "O cliente sente vontade de expressar sua discordância e começa a articular as primeiras palavras.",
    reflectionQuestion:
      "Que impulso, possibilidade ou direção começa a aparecer?",
    relatedConcepts: ["Energia", "Intenção", "Ajustes Confluentes"],
    references: [
      {
        id: "ref-1",
        author: "Perls, F.; Hefferline, R.; Goodman, P.",
        title: "Gestalt-Therapy",
        year: 1951,
        publisher: "Julian Press",
        pages: "230-235",
      },
    ],
    authorNote: "Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
  {
    id: "stage-4",
    slug: "acao",
    label: "Ação",
    position: 4,
    shortDefinition: "O movimento passa a acontecer efetivamente no campo.",
    essentialContent: [
      "A energia mobilizada traduz-se em conduta, fala, expressão ou movimento em direção ao ambiente.",
      "A ação realiza a interface ativa entre o organismo e aquilo de que necessita.",
    ],
    expandedContent: [
      "Nesta etapa, o comportamento explícito ocorre. A pessoa age no mundo para buscar a satisfação ou a alteração da situação de campo.",
      "Não se trata de um ato mecânico, mas de uma conduta engajada na realidade relacional.",
    ],
    everydayExample: "Você caminha até o filtro e enche o copo de água.",
    clinicalExample:
      "O cliente diz diretamente ao terapeuta: 'Isso que você disse me causou desconforto'.",
    reflectionQuestion: "O que começa efetivamente a ser feito no campo?",
    relatedConcepts: ["Comportamento", "Engajamento", "Campo Relacional"],
    references: [
      {
        id: "ref-2",
        author: "Polster, E.; Polster, M.",
        title: "Gestalt Therapy Integrated",
        year: 1973,
        publisher: "Brunner/Mazel",
        pages: "150-155",
      },
    ],
    authorNote: "Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
  {
    id: "stage-5",
    slug: "contato",
    label: "Contato",
    position: 5,
    shortDefinition:
      "O encontro pleno entre a necessidade, o organismo e o ambiente.",
    essentialContent: [
      "O contato é o ponto de maior presença e assimilação. É a intersecção viva onde ocorre a troca real com o ambiente.",
      "Pode envolver assimilação de alimento, reconhecimento mútuo, expressão afetiva ou clareza relacional.",
    ],
    expandedContent: [
      "O contato genuíno altera tanto o organismo quanto o ambiente (fronteira de contato permeável e viva).",
      "Não é sinônimo de 'sucesso absoluto', mas de experiência plena e inteira do encontro.",
    ],
    everydayExample:
      "Você bebe a água, saboreia e percebe a sensação de frescor e saciedade.",
    clinicalExample:
      "Ocorre um momento de profunda ressonância emocional compartilhada na sessão, seguido de alívio e clareza.",
    reflectionQuestion:
      "O que acontece no encontro entre a necessidade, o ambiente e aquilo com que se entra em contato?",
    relatedConcepts: ["Fronteira de Contato", "Assimilação", "Encontro"],
    references: [
      {
        id: "ref-1",
        author: "Perls, F.; Hefferline, R.; Goodman, P.",
        title: "Gestalt-Therapy",
        year: 1951,
        publisher: "Julian Press",
        pages: "240-250",
      },
    ],
    authorNote:
      "Ponto visual de maior presença na experiência. Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
  {
    id: "stage-6",
    slug: "retirada",
    label: "Retirada",
    position: 6,
    shortDefinition:
      "A experiência cede espaço e o campo se abre para novos movimentos.",
    essentialContent: [
      "Satisfeita a necessidade ou concluído o encontro, a figura se recolhe e retorna ao fundo.",
      "A retirada é essencial para que o organismo descanse e o campo fique livre para emergências futuras.",
    ],
    expandedContent: [
      "A retirada não é um fim negativo ou rejeição; é o repouso fértil que permite a digestão da experiência e a preparação para o próximo ciclo.",
      "O fundo continua vivo e em contínua transformação.",
    ],
    everydayExample:
      "A sede deixa de ocupar a atenção; você retorna tranquilamente ao que estava fazendo antes.",
    clinicalExample:
      "Após um momento intenso de revelação, há um período de silêncio tranquilo e respiração pausada na sala.",
    reflectionQuestion:
      "O que acontece quando essa experiência deixa de ocupar o primeiro plano?",
    relatedConcepts: ["Fundo", "Repouso Fértil", "Assimilação e Fechamento"],
    references: [
      {
        id: "ref-2",
        author: "Polster, E.; Polster, M.",
        title: "Gestalt Therapy Integrated",
        year: 1973,
        publisher: "Brunner/Mazel",
        pages: "160-165",
      },
    ],
    authorNote:
      "O ciclo não termina num ponto morto; a linha continua discretamente em direção ao fundo. Conteúdo demonstrativo sujeito à revisão pedagógica.",
    status: "published",
  },
];

export const DEFAULT_SCENARIOS: ScenarioItem[] = [
  {
    id: "scen-1",
    title: "A Sede Cotidiana",
    slug: "sede-cotidiana",
    context:
      "Durante uma tarde de trabalho intenso em frente à tela, a garganta fica seca e a atenção começa a oscilar.",
    activityType: "position_on_cycle",
    difficulty: "iniciante",
    content: {
      prompt:
        "Em qual momento do ciclo esta percepção inicial da garganta seca está mais próxima?",
      targetStageSlug: "sensacao",
    },
    feedback: {
      discussion:
        "A garganta seca e a oscilação da atenção correspondem à Sensação: o organismo registra um sinal físico difuso antes de uma nomeação clara.",
      alternativeReadings: [
        "Algumas pessoas podem já estar em Awareness se o sinal for imediato e reconhecido como sede.",
        "O importante não é acertar uma resposta única, mas observar como o corpo avisa antes da mente.",
      ],
    },
    scored: false,
    status: "published",
    position: 1,
  },
  {
    id: "scen-2",
    title: "Tensão na Reunião",
    slug: "tensao-na-reuniao",
    context:
      "Durante uma discussão de equipe, você percebe os ombros tensionados e uma vontade súbita de interromper a fala.",
    activityType: "reflection",
    difficulty: "intermediário",
    content: {
      prompt:
        "O que começa a aparecer como figura e como a energia se organiza em direção à mobilização?",
    },
    feedback: {
      discussion:
        "A tensão nos ombros indica o trânsito entre Sensação e Awareness. A vontade de interromper aponta para a Mobilização de uma ação assertiva.",
      alternativeReadings: [
        "A energia pode encontrar barreiras de retenção (retroflexão), mantendo a tensão sem virar ação.",
      ],
    },
    scored: false,
    status: "published",
    position: 2,
  },
];
