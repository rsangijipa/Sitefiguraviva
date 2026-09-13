import { EmotionFamily, SomaticRegion } from "../types";

export const SOMATIC_REGIONS: SomaticRegion[] = [
  {
    id: "peito",
    label: "Peito & Coração",
    description:
      "Sensações de expansão, aperto, calor ou peso no centro torácico",
  },
  {
    id: "garganta",
    label: "Garganta & Mandíbula",
    description: "Nó, contenção, tensão muscular ou fluidez respiratória",
  },
  {
    id: "estomago",
    label: "Estômago & Ventre",
    description: "Frio, agitação, borboletas, contração ou soltura abdominal",
  },
  {
    id: "ombros",
    label: "Ombros & Costas",
    description: "Sensação de carga, firmeza, postura ereta ou afundamento",
  },
  {
    id: "cabeca",
    label: "Cabeça & Têmporas",
    description: "Pressão, clareza, formigamento, calor ou sensação de espaço",
  },
  {
    id: "maos",
    label: "Mãos & Membros",
    description:
      "Impulso de agir, relaxamento, estremecimento ou quietude motora",
  },
  {
    id: "difuso",
    label: "Corpo todo / Difuso",
    description: "Uma atmosfera envolvente sem ponto fixo evidente",
  },
];

export const INTENSITY_LEVELS = [
  {
    value: 1,
    label: "Sutil",
    description: "Quase imperceptível, como uma brisa tênue de fundo",
  },
  {
    value: 2,
    label: "Presente",
    description: "Perceptível logo que a atenção repousa sobre ela",
  },
  {
    value: 3,
    label: "Nítida",
    description: "Clara e distinta no campo da consciência imediata",
  },
  {
    value: 4,
    label: "Marcante",
    description: "Envolve o corpo e orienta com força o estado atual",
  },
  {
    value: 5,
    label: "Envolvente",
    description: "Preenche inteiramente a percepção neste instante",
  },
];

export const EMOTION_FAMILIES: EmotionFamily[] = [
  {
    id: "afeto_conexao",
    name: "Afeto & Conexão",
    subtitle: "Abertura ao entrelaçamento e calor relacional",
    description:
      "Um movimento espontâneo de dilatação e acolhimento, onde a atenção se volta ao cuidado, à proximidade e ao reconhecimento do outro ou de si.",
    accent: {
      color: "#B8654B", // Terracotta elegante
      border: "#8F4630",
      bg: "#FBF2EE",
      light: "#EEDCD4",
      text: "#572617",
    },
    relatedEmotions: [
      {
        id: "ternura",
        label: "Ternura",
        description:
          "Sensação de suavidade e amolecimento interior diante de algo que pede cuidado e delicadeza.",
        somaticTendency:
          "Descontração do peito, respiração compassada e olhar acolhedor.",
        nuances: [
          {
            id: "carinho",
            label: "Carinho",
            description:
              "Disposição suave para tocar, abrigar ou oferecer conforto sem pressa.",
            somaticTendency:
              "Calor nas palmas das mãos e afrouxamento da mandíbula.",
          },
          {
            id: "compaixao",
            label: "Compaixão",
            description:
              "Ressonância sensível com a fragilidade de alguém, acompanhada pelo desejo de amparo.",
            somaticTendency:
              "Aperto terno no esterno que se converte em respiração compassiva.",
          },
          {
            id: "zelo",
            label: "Zelo",
            description:
              "Atenção dedicada aos detalhes e à integridade do que se estima.",
            somaticTendency:
              "Alinhamento cuidadoso do corpo e gestos deliberados.",
          },
          {
            id: "delicadeza",
            label: "Delicadeza",
            description:
              "Percepção apurada da vulnerabilidade ambiente, movendo-se com leveza.",
            somaticTendency: "Passos suaves e respiração quase inaudível.",
          },
        ],
      },
      {
        id: "gratidao",
        label: "Gratidão",
        description:
          "Sentimento de reconhecimento por algo recebido ou vivido, gerando plenitude receptiva.",
        somaticTendency:
          "Sensação de peito pleno e inclinação sutil da cabeça em reverência.",
        nuances: [
          {
            id: "reconhecimento",
            label: "Reconhecimento",
            description:
              "Ato de perceber o valor de um gesto ou instante e honrar sua presença.",
            somaticTendency: "Olhar límpido e relaxamento das sobrancelhas.",
          },
          {
            id: "apreco",
            label: "Apreço",
            description:
              "Valorização sentida da beleza ou significado singular de alguém ou algo.",
            somaticTendency:
              "Sorriso espontâneo nos cantos dos lábios e postura aberta.",
          },
          {
            id: "plenitude",
            label: "Plenitude",
            description:
              "Sensação de suficiência, onde não há necessidade urgente de acréscimo.",
            somaticTendency:
              "Respiração profunda e peso sereno do corpo sobre a base.",
          },
          {
            id: "encantamento",
            label: "Encantamento",
            description:
              "Captura luminosa pela generosidade ou singularidade do momento.",
            somaticTendency: "Pausa breve na expiração e olhos vivos.",
          },
        ],
      },
      {
        id: "pertenca",
        label: "Pertença",
        description:
          "Sensação de ter um lugar legítimo no mundo, junto a um grupo, lugar ou momento.",
        somaticTendency:
          "Abaixamento dos ombros e sensação de chão firme sob os pés.",
        nuances: [
          {
            id: "acolhimento",
            label: "Acolhimento",
            description:
              "Percepção de ser recebido tal como se é, sem exigência de disfarce.",
            somaticTendency: "Soltura das costelas e liberação do ar contido.",
          },
          {
            id: "comunhao",
            label: "Comunhão",
            description:
              "Ressonância compartilhada onde as fronteiras individuais se tornam permeáveis.",
            somaticTendency: "Batimentos cardíacos em compasso partilhado.",
          },
          {
            id: "cumplicidade",
            label: "Cumplicidade",
            description:
              "Entendimento implícito e seguro tecido através do silêncio ou olhar.",
            somaticTendency:
              "Descontração nos olhos e sensação de intimidade segura.",
          },
          {
            id: "confianca",
            label: "Confiança",
            description:
              "Disposição para apoiar o próprio peso sobre a relação sem medo de queda.",
            somaticTendency:
              "Tônus muscular equilibrado, sem rigidez defensiva.",
          },
        ],
      },
      {
        id: "saudade",
        label: "Saudade",
        description:
          "Presença viva de algo ausente; uma ponte afetiva que une memória e afeição.",
        somaticTendency:
          "Vazio brando no peito tingido por um calor doce e reflexivo.",
        nuances: [
          {
            id: "nostalgia_doce",
            label: "Nostalgia Doce",
            description:
              "Evocação afetuosa de instantes idos com gratidão por terem existido.",
            somaticTendency: "Suspiro lento e olhar voltado para dentro.",
          },
          {
            id: "ausencia_viva",
            label: "Ausência Viva",
            description:
              "Percepção nítida do espaço deixado por alguém ou por um tempo passado.",
            somaticTendency: "Silêncio na garganta e recolhimento dos gestos.",
          },
          {
            id: "anseio",
            label: "Anseio",
            description:
              "Puxão interno suave na direção de um reencontro ou retorno.",
            somaticTendency:
              "Sensação de atração sutil para a frente no tórax.",
          },
          {
            id: "reverberacao",
            label: "Reverberação",
            description:
              "O eco contínuo de uma experiência marcante que ainda colore o presente.",
            somaticTendency:
              "Ondulações de atenção e desaceleração do ritmo mental.",
          },
        ],
      },
    ],
  },
  {
    id: "vitalidade_expansao",
    name: "Vitalidade & Expansão",
    subtitle: "Energia disponível, movimento e celebração do ser",
    description:
      "Sensação de vigor e prontidão dinâmica, onde o horizonte perceptivo se alarga e a vontade se conecta à ação criativa e expressiva.",
    accent: {
      color: "#B8822B", // Ocre / Âmbar solar
      border: "#8F611A",
      bg: "#FDF7EC",
      light: "#F4E7CE",
      text: "#583907",
    },
    relatedEmotions: [
      {
        id: "entusiasmo",
        label: "Entusiasmo",
        description:
          "Vibração interna que convida a engajar-se ativamente em um projeto, ideia ou encontro.",
        somaticTendency:
          "Elevação da postura, brilho nos olhos e agilidade nos pensamentos.",
        nuances: [
          {
            id: "inspiracao",
            label: "Inspiração",
            description:
              "Sensação de que imagens, ideias e soluções brotam com fluidez natural.",
            somaticTendency: "Respiração ampla e clara e cabeça erguida.",
          },
          {
            id: "vivacidade",
            label: "Vivacidade",
            description:
              "Aguçamento dos sentidos e resposta imediata aos estímulos do ambiente.",
            somaticTendency: "Sensação de formigamento leve nas extremidades.",
          },
          {
            id: "fervor",
            label: "Fervor",
            description:
              "Intensidade dedicada que sustenta o foco com calor apaixonado.",
            somaticTendency: "Aquecimento corporal uniforme e cadência firme.",
          },
          {
            id: "impeto",
            label: "Ímpeto",
            description:
              "Força motora inicial que rompe a inércia e impulsiona o primeiro passo.",
            somaticTendency: "Músculos das pernas preparados para o avanço.",
          },
        ],
      },
      {
        id: "jubilo",
        label: "Júbilo",
        description:
          "Estado de alegria transbordante que busca celebrar a existência e compartilhá-la.",
        somaticTendency:
          "Sensação de leveza no centro do corpo e impulso para riso ou dança.",
        nuances: [
          {
            id: "exultacao",
            label: "Exultação",
            description:
              "Pico de regozijo após uma conquista ou revelação preciosa.",
            somaticTendency:
              "Braços que se abrem e expansão súbita da caixa torácica.",
          },
          {
            id: "leveza",
            label: "Leveza",
            description:
              "Sensação de que o peso habitual da gravidade cotidiana diminuiu.",
            somaticTendency:
              "Pisar elástico e ausência de tensão nas articulações.",
          },
          {
            id: "espontaneidade",
            label: "Espontaneidade",
            description:
              "Expressão desimpedida sem filtros excessivos de autocensura.",
            somaticTendency: "Voz límpida e movimentos livres dos braços.",
          },
          {
            id: "festa_interna",
            label: "Festa Interna",
            description:
              "Celebração quieta e íntima que ilumina o diálogo interior.",
            somaticTendency:
              "Calor calmo no peito e sensação de contentamento.",
          },
        ],
      },
      {
        id: "curiosidade",
        label: "Curiosidade",
        description:
          "Inclinação aberta para explorar o desconhecido, questionar e perscrutar o mundo.",
        somaticTendency:
          "Cabeça levemente inclinada para frente e atenção focalizada.",
        nuances: [
          {
            id: "fascinio",
            label: "Fascínio",
            description:
              "Atração magnética por um detalhe, tema ou fenômeno cativante.",
            somaticTendency: "Pupilas dilatadas e silêncio contemplativo.",
          },
          {
            id: "investigacao",
            label: "Investigação",
            description:
              "Vontade metódica de desvendar como as coisas funcionam e se articulam.",
            somaticTendency: "Ritmo atento e mãos que procuram examinar.",
          },
          {
            id: "abertura_novo",
            label: "Abertura ao Novo",
            description:
              "Disposição receptiva para acolher o inusitado sem julgamento prévio.",
            somaticTendency:
              "Músculos faciais relaxados e respiração receptiva.",
          },
          {
            id: "inquiricao",
            label: "Inquirição",
            description:
              "Estado de pergunta viva que não se apressa em obter respostas prontas.",
            somaticTendency: "Atenção sustentada na fronte e olhar atento.",
          },
        ],
      },
      {
        id: "esperanca",
        label: "Esperança",
        description:
          "Abertura confiante em relação ao futuro, vislumbrando possibilidades férteis.",
        somaticTendency:
          "Elevação sutil da linha do olhar e sensação de ar renovado.",
        nuances: [
          {
            id: "alento",
            label: "Alento",
            description:
              "Sensação reconfortante que devolve o ânimo em meio à incerteza.",
            somaticTendency: "Expiração que descansa o diafragma.",
          },
          {
            id: "horizonte_aberto",
            label: "Horizonte Aberto",
            description:
              "Percepção de que os caminhos não estão esgotados nem definitivos.",
            somaticTendency: "Desobstrução do peito e postura erguida.",
          },
          {
            id: "confianca_devir",
            label: "Confiança no Devir",
            description:
              "Certeza tranquila de que os desdobramentos da vida trazem aprendizado.",
            somaticTendency:
              "Relaxamento da região lombar e equilíbrio do corpo.",
          },
          {
            id: "expectativa_luminosa",
            label: "Expectativa Luminosa",
            description:
              "Aguardar algo com alegria serena antes mesmo de sua chegada.",
            somaticTendency: "Pulso calmo e calor no centro do abdômen.",
          },
        ],
      },
    ],
  },
  {
    id: "recolhimento_resguardo",
    name: "Recolhimento & Resguardo",
    subtitle: "Pausa interna, assimilação de transições e escuta íntima",
    description:
      "Desaceleração do ritmo motor e recolhimento da atenção para o espaço interno, processando perdas, cansaço, transformações ou a necessidade de abrigo.",
    accent: {
      color: "#4B6B7C", // Sálvia azulada / Ardósia mineral
      border: "#334F5F",
      bg: "#EEF3F6",
      light: "#D7E3E9",
      text: "#1C313C",
    },
    relatedEmotions: [
      {
        id: "pesar",
        label: "Pesar",
        description:
          "Sensação de gravidade emocional diante do que se transformou ou encerrou.",
        somaticTendency:
          "Peso nos ombros, olhos pesados e ritmo respiratório mais lento.",
        nuances: [
          {
            id: "luto_simbolico",
            label: "Luto Simbólico",
            description:
              "Processamento gradual da despedida de uma fase, ideia ou vínculo.",
            somaticTendency: "Vazio solene no peito e necessidade de quietude.",
          },
          {
            id: "melancolia",
            label: "Melancolia",
            description:
              "Tristeza reflexiva e poética, que contempla a impermanência com doçura sóbria.",
            somaticTendency:
              "Respiração profunda e pausada com olhar distante.",
          },
          {
            id: "tristeza_serena",
            label: "Tristeza Serena",
            description:
              "Dor que já não luta contra si mesma, descansando na aceitação do fato.",
            somaticTendency: "Soltura das mãos e afrouxamento da mandíbula.",
          },
          {
            id: "vazio_reflexivo",
            label: "Vazio Reflexivo",
            description:
              "Espaço interior deixado em suspenso, sem pressa de ser preenchido.",
            somaticTendency:
              "Ausência de impulsos motores fortes e respiração quieta.",
          },
        ],
      },
      {
        id: "desamparo",
        label: "Desamparo",
        description:
          "Percepção da própria finitude e necessidade de cuidado ou amparo.",
        somaticTendency:
          "Encurvamento protetor do tronco e sensação de frio no centro do peito.",
        nuances: [
          {
            id: "fragilidade_sentida",
            label: "Fragilidade Sentida",
            description:
              "Consciência límpida dos próprios limites e vulnerabilidade momentânea.",
            somaticTendency: "Tônus muscular reduzido e pele sensível.",
          },
          {
            id: "solidao_intensa",
            label: "Solidão Sentida",
            description:
              "A sensação de estar consigo mesmo em uma travessia sem testemunhas imediatas.",
            somaticTendency: "Silêncio nas cordas vocais e olhar meditativo.",
          },
          {
            id: "busca_de_colo",
            label: "Busca de Colo",
            description:
              "Desejo espontâneo de ser envolvido por abrigo, coberta ou presença calma.",
            somaticTendency:
              "Mãos que buscam apoiar o rosto ou cruzar o peito.",
          },
          {
            id: "desarmamento",
            label: "Desarmamento",
            description:
              "O momento em que as defesas caem e a experiência se revela sem artifícios.",
            somaticTendency:
              "Lágrimas que brotam sem esforço e relaxamento forçado da testa.",
          },
        ],
      },
      {
        id: "desanimo",
        label: "Desânimo",
        description:
          "Exaustão do esforço habitual, convidando a uma trégua indispensável.",
        somaticTendency:
          "Sensação de peso nas pernas e baixa prontidão motora.",
        nuances: [
          {
            id: "pausa_involuntaria",
            label: "Pausa Involuntária",
            description:
              "O corpo pedindo expressamente para cessar a produtividade e repousar.",
            somaticTendency: "Pálpebras caídas e bocejo compassado.",
          },
          {
            id: "fadiga_do_querer",
            label: "Fadiga do Querer",
            description: "Cansaço temporário das intenções e ambições diárias.",
            somaticTendency:
              "Relaxamento dos punhos e desinteresse por estímulos rápidos.",
          },
          {
            id: "silencio_interno",
            label: "Silêncio Interno",
            description:
              "Ausência momentânea de planos, gerando um recuo restaurador.",
            somaticTendency:
              "Atenção que se acomoda no ritmo da própria respiração.",
          },
          {
            id: "recolhimento_motor",
            label: "Recolhimento Motor",
            description:
              "Redução natural dos gestos ao essencial para poupar energia vital.",
            somaticTendency:
              "Corpo que busca repousar sobre superfície acolchoada.",
          },
        ],
      },
      {
        id: "nostalgia",
        label: "Nostalgia",
        description:
          "Olhar retrospectivo sobre caminhos percorridos e memórias que habitam a alma.",
        somaticTendency: "Desaceleração do pensamento e calor no dorso.",
        nuances: [
          {
            id: "eco_do_passado",
            label: "Eco do Passado",
            description:
              "Sensação de que o presente é sutilmente tingido por algo que já foi.",
            somaticTendency: "Olhar perdido no horizonte ou por uma janela.",
          },
          {
            id: "sobriedade",
            label: "Sobriedade",
            description:
              "Reconhecimento lúcido de que certas estações já cumpriram seu papel.",
            somaticTendency: "Postura contida e pés firmes no chão.",
          },
          {
            id: "comovente_efemero",
            label: "Comovente Efêmero",
            description:
              "Tocar a brevidade das coisas belas sem desespero, com veneração.",
            somaticTendency:
              "Nó suave na garganta que se desfaz em expiração calma.",
          },
          {
            id: "memoria_afetuosa",
            label: "Memória Afetuosa",
            description:
              "Acolhimento íntimo de quem fomos em outro tempo ou lugar.",
            somaticTendency: "Sensação de calor que envolve o coração.",
          },
        ],
      },
    ],
  },
  {
    id: "alerta_cautela",
    name: "Alerta & Cautela",
    subtitle: "Aguçamento sensorial, proteção e avaliação do desconhecido",
    description:
      "Mobilização sensorial e atenção afinada diante do incerto, orientando o organismo a avaliar caminhos e preservar a integridade e bem-estar.",
    accent: {
      color: "#8C684F", // Cedro / Terracota neutro
      border: "#684831",
      bg: "#F7F2EE",
      light: "#EBE0D7",
      text: "#432C1D",
    },
    relatedEmotions: [
      {
        id: "apreensao",
        label: "Apreensão",
        description:
          "Vigilância antecipatória que rastreia sinais e cenários antes de prosseguir.",
        somaticTendency:
          "Tensão ligeira nos trapézios, olhos que circundam o espaço e respiração curta.",
        nuances: [
          {
            id: "inquietacao",
            label: "Inquietação",
            description:
              "Sensação de agitação interna que busca um ponto de estabilização.",
            somaticTendency: "Pequenos movimentos contínuos nas mãos ou pés.",
          },
          {
            id: "expectativa_vigilante",
            label: "Expectativa Vigilante",
            description:
              "Prontidão atenta para identificar qualquer alteração no ambiente.",
            somaticTendency: "Ouvido atento e pausa na deglutição.",
          },
          {
            id: "tensao_suspensa",
            label: "Tensão Suspensa",
            description:
              "Sensação de que algo está por se desenrolar, mantendo o corpo em compasso de espera.",
            somaticTendency: "Músculos abdominais levemente contraídos.",
          },
          {
            id: "cuidado_preventivo",
            label: "Cuidado Preventivo",
            description:
              "Deliberação cuidadosa para evitar passos em falso ou precipitações.",
            somaticTendency: "Movimentos calculados e marcha mais atenta.",
          },
        ],
      },
      {
        id: "inseguranca",
        label: "Insegurança",
        description:
          "Percepção de solo movediço ou dúvida sobre a própria capacidade de sustentação.",
        somaticTendency:
          "Frio leve no plexo solar e instabilidade na base dos pés.",
        nuances: [
          {
            id: "hesitacao",
            label: "Hesitação",
            description:
              "Pausa entre a intenção e o ato, buscando confirmação ou amparo adicional.",
            somaticTendency: "Gesto interrompido no ar e olhar indagador.",
          },
          {
            id: "descompasso",
            label: "Descompasso",
            description:
              "Sensação de não estar em sincronia com o ritmo ou expectativa externa.",
            somaticTendency:
              "Respiração descoordenada e calor nas maçãs do rosto.",
          },
          {
            id: "chao_instavel",
            label: "Chão Instável",
            description:
              "Sensação de que as referências habituais perderam temporariamente a firmeza.",
            somaticTendency:
              "Busca inconsciente de apoio com as mãos em mesas ou apoios.",
          },
          {
            id: "duvida_sensivel",
            label: "Dúvida Sensível",
            description:
              "Questionamento prudente que convida a rever premissas antes de decidir.",
            somaticTendency: "Franzir sutil das sobrancelhas e escuta atenta.",
          },
        ],
      },
      {
        id: "sobressalto",
        label: "Sobressalto",
        description:
          "Reação súbita de alarme corporal diante de uma interrupção inesperada.",
        somaticTendency:
          "Inspiração rápida, elevação dos ombros e aceleração momentânea do pulso.",
        nuances: [
          {
            id: "temor_subito",
            label: "Temor Súbito",
            description:
              "Impacto instantâneo de um estímulo que interrompe a continuidade da mente.",
            somaticTendency: "Parada momentânea do movimento físico.",
          },
          {
            id: "alarme_corporal",
            label: "Alarme Corporal",
            description:
              "Disparo de energia neural voltada para a defesa ou proteção imediata.",
            somaticTendency: "Calafrio pela coluna espinhal.",
          },
          {
            id: "prontidao_defensiva",
            label: "Prontidão Defensiva",
            description:
              "Organização rápida dos membros para cobrir áreas vitais ou recuar.",
            somaticTendency: "Braços erguidos instintivamente diante do peito.",
          },
          {
            id: "aperto_urgencia",
            label: "Aperto de Urgência",
            description:
              "Sensação concentrada de que uma resposta rápida precisa ser articulada.",
            somaticTendency:
              "Contração do estômago e foco estrito no ponto de alarme.",
          },
        ],
      },
      {
        id: "vulnerabilidade",
        label: "Vulnerabilidade",
        description:
          "Exposição sincera da própria fragilidade na ausência de armaduras.",
        somaticTendency:
          "Pele sensível à temperatura e sensação de transparência.",
        nuances: [
          {
            id: "sensibilidade_exposta",
            label: "Sensibilidade Exposta",
            description:
              "Percepção de que qualquer estímulo ressoa diretamente no centro emocional.",
            somaticTendency: "Pálpebras delicadas e respiração suave.",
          },
          {
            id: "desnudamento",
            label: "Desnudamento",
            description:
              "Estar diante do outro sem as máscaras ou defesas habituais.",
            somaticTendency: "Olhar desarmado e postura desprotegida.",
          },
          {
            id: "cautela_terna",
            label: "Cautela Terna",
            description:
              "Cuidar de si como se cuida de uma planta jovem após o transplante.",
            somaticTendency:
              "Gestos delicados consigo mesmo e recolhimento aconchegante.",
          },
          {
            id: "medo_de_ferir_se",
            label: "Medo de Ferir-se",
            description:
              "Proteção cautelosa de uma ferida ainda recente em processo de cicatrização.",
            somaticTendency:
              "Recuo terno do contato abrupto e preferência por silêncio.",
          },
        ],
      },
    ],
  },
  {
    id: "afirmacao_limite",
    name: "Afirmação & Limite",
    subtitle: "Firmeza, proteção de valores e demarcação de espaço",
    description:
      "Afluxo de calor e tônus firme orientado à proteção do que é digno, demarcação de fronteiras claras e mobilização contra desrespeito ou obstruções.",
    accent: {
      color: "#9C4E41", // Tijolo queimado / Argila vigorosa
      border: "#78352A",
      bg: "#F9F1EF",
      light: "#EDD6D2",
      text: "#4C1F17",
    },
    relatedEmotions: [
      {
        id: "indignacao",
        label: "Indignação",
        description:
          "Reação vigorosa perante a injustiça, o desrespeito ou a violação de um princípio caro.",
        somaticTendency:
          "Calor subindo pelo pescoço, maxilar firme e voz com peso.",
        nuances: [
          {
            id: "inconformismo",
            label: "Inconformismo",
            description:
              "Recusa visceral em aceitar como normal algo que fere a dignidade.",
            somaticTendency: "Postura ereta e queixo levemente erguido.",
          },
          {
            id: "protesto_etico",
            label: "Protesto Ético",
            description:
              "Manifestação deliberada de discordância pautada em valores humanos.",
            somaticTendency: "Olhar direto e firmeza no tom respiratório.",
          },
          {
            id: "tensao_reparadora",
            label: "Tensão Reparadora",
            description:
              "Energia que busca reequilibrar uma balança que pendeu para a desigualdade.",
            somaticTendency:
              "Mãos fechadas em prontidão e tônus torácico forte.",
          },
          {
            id: "contestacao",
            label: "Contestação",
            description:
              "Interrupção consciente de um discurso ou prática que desumaniza.",
            somaticTendency: "Respiração profunda antes da fala articulada.",
          },
        ],
      },
      {
        id: "frustracao",
        label: "Frustração",
        description:
          "Sensação de barreira ou atrito quando a energia investida encontra um obstáculo rígido.",
        somaticTendency:
          "Tensão entre as sobrancelhas e aperto momentâneo nos dentes.",
        nuances: [
          {
            id: "obstrucao_sentida",
            label: "Obstrução Sentida",
            description:
              "O impacto de constatar que o caminho planejado está bloqueado.",
            somaticTendency: "Suspiro pesado e soltura brusca do ar.",
          },
          {
            id: "impaciencia",
            label: "Impaciência",
            description:
              "Atrito entre a velocidade interna do desejo e o tempo real das coisas.",
            somaticTendency:
              "Bater de dedos ritmado e sensação de formigamento nas pernas.",
          },
          {
            id: "contrariedade",
            label: "Contrariedade",
            description:
              "Desconforto gerado por circunstâncias que contrariam o que se desejava.",
            somaticTendency: "Tensão no músculo temporal e olhar sério.",
          },
          {
            id: "desejo_barrado",
            label: "Desejo Barrado",
            description:
              "Energia que permaneceu contida sem encontrar seu canal de expressão.",
            somaticTendency:
              "Sensação de pressão interna no peito que busca vazão.",
          },
        ],
      },
      {
        id: "determinacao",
        label: "Determinação",
        description:
          "Concentração resoluta da vontade em torno de um objetivo claro, sustentando o esforço.",
        somaticTendency:
          "Centro de gravidade rebaixado, respiração contínua e foco inabalável.",
        nuances: [
          {
            id: "firmeza_calma",
            label: "Firmeza Calma",
            description:
              "Segurança interna que não precisa de gritos nem gestos ruidosos para se afirmar.",
            somaticTendency:
              "Coluna alinhada e olhar fixo no ponto de destino.",
          },
          {
            id: "vontade_resoluta",
            label: "Vontade Resoluta",
            description:
              "Decisão madura que já calculou o preço e assume a responsabilidade da marcha.",
            somaticTendency: "Pés plantados como raízes profundas na terra.",
          },
          {
            id: "bravura",
            label: "Bravura",
            description:
              "Avançar mesmo sentindo tremor, honrando o compromisso assumido.",
            somaticTendency:
              "Inspiração ampla que preenche o peito e dá sustentação.",
          },
          {
            id: "recusa_em_recuar",
            label: "Recusa em Recuar",
            description:
              "Não abrir mão de um limite saudável quando pressionado a ceder.",
            somaticTendency: "Mandíbula alinhada e mãos firmes e calmas.",
          },
        ],
      },
      {
        id: "irritabilidade",
        label: "Irritabilidade",
        description:
          "Hipersensibilidade do sistema nervoso quando sobrecarregado por excesso de estímulos.",
        somaticTendency:
          "Sensação de pele eriçada, ruídos externos sentidos como invasivos.",
        nuances: [
          {
            id: "aspereza",
            label: "Aspereza",
            description:
              "Sensação de que o contato com o mundo está pontiagudo ou abrasivo.",
            somaticTendency: "Necessidade de isolamento acústico e visual.",
          },
          {
            id: "cansaco_reativo",
            label: "Cansaço Reativo",
            description:
              "Exaustão acumulada que reduz a margem de paciência para detalhes.",
            somaticTendency: "Dor ligeira na nuca e olhos secos.",
          },
          {
            id: "sobrecarga_sensorial",
            label: "Sobrecarga Sensorial",
            description:
              "Saturação de luzes, demandas e sons, pedindo esvaziamento imediato.",
            somaticTendency: "Desejo de fechar os olhos e cobrir os ouvidos.",
          },
          {
            id: "necessidade_de_espaco",
            label: "Necessidade de Espaço",
            description:
              "Apelo vital do corpo por uma zona de silêncio e distanciamento físico.",
            somaticTendency: "Passo para trás e abertura do próprio perímetro.",
          },
        ],
      },
    ],
  },
  {
    id: "quietude_equilibrio",
    name: "Quietude & Equilíbrio",
    subtitle: "Presença repousada, sintonia e desobstrução interior",
    description:
      "Harmonia límpida entre a respiração e a presença, onde cessa a urgência de consertar, intervir ou acelerar, e o instante repousa em sua própria clareza.",
    accent: {
      color: "#5E7857", // Musgo suave / Verde folha seca
      border: "#43583E",
      bg: "#F2F6F1",
      light: "#DCE6DA",
      text: "#243521",
    },
    relatedEmotions: [
      {
        id: "serenidade",
        label: "Serenidade",
        description:
          "Tranquilidade desobstruída em que o pensamento se aquieta como água transparente.",
        somaticTendency:
          "Músculos faciais distendidos, respiração ritmada pelo abdômen e pulso suave.",
        nuances: [
          {
            id: "paz_lucida",
            label: "Paz Lúcida",
            description:
              "Calmaria acompanhada de presença alerta, sem sonolência ou anestesia.",
            somaticTendency: "Clareza na visão periférica e mente arejada.",
          },
          {
            id: "desprendimento",
            label: "Desprendimento",
            description:
              "Soltura das amarras do controle excessivo sobre resultados.",
            somaticTendency: "Mãos abertas voltadas para cima sobre as pernas.",
          },
          {
            id: "compostura",
            label: "Compostura",
            description:
              "Equilíbrio elegante diante das oscilações naturais da vida cotidiana.",
            somaticTendency:
              "Eixo da coluna sustentado sem esforço ou rigidez.",
          },
          {
            id: "tranquilidade_limpida",
            label: "Tranquilidade Límpida",
            description:
              "Sensação de um lago calmo no peito refletindo o céu sem ondulações.",
            somaticTendency:
              "Calor brando no centro torácico e silêncio vocal.",
          },
        ],
      },
      {
        id: "alivio",
        label: "Alívio",
        description:
          "Descompressão orgânica após a superação ou dissolução de um peso ou ameaça.",
        somaticTendency:
          "Grande expiração que relaxa subitamente ombros, diafragma e estômago.",
        nuances: [
          {
            id: "descompressao",
            label: "Descompressão",
            description:
              "Retorno gradual dos tecidos musculares ao seu estado natural de repouso.",
            somaticTendency:
              "Ondulação de soltura que desce da cabeça até os pés.",
          },
          {
            id: "termino_de_peso",
            label: "Término de um Peso",
            description:
              "A certeza de que uma carga difícil de carregar foi finalmente depositada.",
            somaticTendency:
              "Sensação de que o corpo flutua alguns centímetros acima da terra.",
          },
          {
            id: "reassentamento",
            label: "Reassentamento",
            description:
              "O retorno à normalidade segura e ao abrigo cotidiano.",
            somaticTendency: "Bocejo relaxante e sensação de aconchego.",
          },
          {
            id: "respiro_restaurador",
            label: "Respiro Restaurador",
            description:
              "Uma inspiração pura que celebra o espaço recuperado para existir.",
            somaticTendency: "Dilatação completa dos pulmões sem bloqueios.",
          },
        ],
      },
      {
        id: "paciencia",
        label: "Paciência",
        description:
          "Capacidade de acompanhar o ritmo intrínseco dos processos sem exigir atalhos.",
        somaticTendency:
          "Tempo dilatado internamente, ausência de urgência nos passos.",
        nuances: [
          {
            id: "tempo_dilatado",
            label: "Tempo Dilatado",
            description:
              "Habitar o presente com a convicção de que cada etapa amadurece a seu tempo.",
            somaticTendency: "Respiração cadenciada sem aceleração.",
          },
          {
            id: "aceitacao_do_ritmo",
            label: "Aceitação do Ritmo",
            description:
              "Reconhecer que certas coisas não respondem à nossa vontade imediata.",
            somaticTendency:
              "Ombros caídos no alinhamento correto e olhar paciente.",
          },
          {
            id: "tolerancia_amorosa",
            label: "Tolerância Amorosa",
            description:
              "Espaço interno generoso para acolher as demoras e tropeços alheios ou próprios.",
            somaticTendency: "Sensação de almofada suave ao redor do coração.",
          },
          {
            id: "espera_habitada",
            label: "Espera Habitada",
            description:
              "Aguardar sem ansiedade, preenchendo a espera com presença viva.",
            somaticTendency: "Postura confortável em repouso digno.",
          },
        ],
      },
      {
        id: "centramento",
        label: "Centramento",
        description:
          "Retorno ao eixo interior de coerência, onde as opiniões e tempestades externas não nos desviam.",
        somaticTendency:
          "Sensação de peso agradável na pelve e respiração que toca a base.",
        nuances: [
          {
            id: "enraizamento",
            label: "Enraizamento",
            description:
              "Conexão visceral com o solo que ancora e sustenta qualquer balanço.",
            somaticTendency:
              "Pés pesados e firmes, sentindo a textura do chão.",
          },
          {
            id: "coerencia_interna",
            label: "Coerência Interna",
            description:
              "Alinhamento entre o sentir, o pensar e o agir, sem fraturas internas.",
            somaticTendency: "Voz clara que brota do abdômen sem esforço.",
          },
          {
            id: "silencio_habitado",
            label: "Silêncio Habitado",
            description:
              "Quietude que não é ausência, mas abundância de presença concentrada.",
            somaticTendency:
              "Desaceleração das ondas mentais e calma sensorial.",
          },
          {
            id: "estabilidade_sobria",
            label: "Estabilidade Sóbria",
            description:
              "Solidez que acolhe o movimento sem perder sua integridade estrutural.",
            somaticTendency: "Corpo estável como montanha serena.",
          },
        ],
      },
    ],
  },
  {
    id: "assombro_enigma",
    name: "Assombro & Enigma",
    subtitle: "Pausa no ordinário, mistério, estranheza e deslumbramento",
    description:
      "Interrupção temporária dos esquemas habituais da mente diante do vasto, do desconcertante ou do insólito, abrindo espaço para a humildade contemplativa.",
    accent: {
      color: "#646788", // Índigo lavado / Crepúsculo sóbrio
      border: "#464969",
      bg: "#F2F2F7",
      light: "#DDDDEB",
      text: "#27293E",
    },
    relatedEmotions: [
      {
        id: "deslumbramento",
        label: "Deslumbramento",
        description:
          "Parada da mente discursiva diante da imensidão, beleza vertiginosa ou genialidade da vida.",
        somaticTendency:
          "Queixo ligeiramente solto, olhos dilatados e sensação de expansão nos limites do corpo.",
        nuances: [
          {
            id: "fascinio_mudo",
            label: "Fascínio Mudo",
            description:
              "Quando as palavras habituais calam para dar lugar ao assombro puro.",
            somaticTendency: "Silêncio total na garganta e atenção arrebatada.",
          },
          {
            id: "reverencia",
            label: "Reverência",
            description:
              "Sentimento de pequenez honrosa diante da vastidão do cosmos ou da natureza.",
            somaticTendency: "Inclinação suave do tronco e respiração pausada.",
          },
          {
            id: "surpresa_poetica",
            label: "Surpresa Poética",
            description:
              "Encontrar um relance inesperado de sentido e harmonia no ordinário.",
            somaticTendency:
              "Calafrio suave pelos braços e leveza no topo da cabeça.",
          },
          {
            id: "vertigem_da_beleza",
            label: "Vertigem da Beleza",
            description:
              "Sensação de que o peito mal é capaz de conter tanta harmonia sentida.",
            somaticTendency:
              "Pausa involuntária na respiração com peito dilatado.",
          },
        ],
      },
      {
        id: "perplexidade",
        label: "Perplexidade",
        description:
          "Estado em que as explicações prévias falham, provocando uma pausa fértil no raciocínio.",
        somaticTendency: "Testa ligeiramente franzida e mãos suspensas no ar.",
        nuances: [
          {
            id: "desconcerto",
            label: "Desconcerto",
            description:
              "O momento em que os fatos desafiam a lógica esperada, gerando hesitação.",
            somaticTendency: "Olhar que busca novos pontos de fixação.",
          },
          {
            id: "duvida_fertil",
            label: "Dúvida Fértil",
            description:
              "Perder as velhas certezas e perceber que isso abre campos inéditos de descoberta.",
            somaticTendency:
              "Sorriso contido diante da própria ignorância reconhecida.",
          },
          {
            id: "interrupcao",
            label: "Interrupção",
            description:
              "Corte súbito no fio da narrativa interna, revelando o vazio do presente.",
            somaticTendency: "Parada motora completa por alguns segundos.",
          },
          {
            id: "suspensao_juizo",
            label: "Suspensão do Juízo",
            description:
              "Abster-se de concluir precocemente sobre algo ainda em revelação.",
            somaticTendency:
              "Músculos da boca relaxados, sem formar opiniões rápidas.",
          },
        ],
      },
      {
        id: "estranheza",
        label: "Estranheza",
        description:
          "Percepção de que o familiar se tornou subitamente insólito ou distante.",
        somaticTendency:
          "Sensação de distanciamento perceptivo, como olhar através de uma lente nova.",
        nuances: [
          {
            id: "desfamiliaridade",
            label: "Desfamiliaridade",
            description:
              "Olhar para um objeto ou rotina conhecida e vê-la como se fosse pela primeira vez.",
            somaticTendency:
              "Visão atenta com foco nos detalhes nunca antes notados.",
          },
          {
            id: "olhar_estrangeiro",
            label: "Olhar Estrangeiro",
            description:
              "Sentir-se um observador desapegado das convenções imediatas do ambiente.",
            somaticTendency:
              "Postura neutra e respiração independente do entorno.",
          },
          {
            id: "espaco_em_branco",
            label: "Espaço em Branco",
            description:
              "Sensação de que o significado ainda não foi atribuído e tudo está por ser nomeado.",
            somaticTendency:
              "Desobstrução do campo auditivo e silêncio interior.",
          },
          {
            id: "sensacao_de_limiar",
            label: "Sensação de Limiar",
            description:
              "Estar no umbral entre duas compreensões, sem pertencer totalmente a nenhuma.",
            somaticTendency: "Sensação de leveza nos pés e cabeça limpa.",
          },
        ],
      },
      {
        id: "reverberacao_misterio",
        label: "Reverência ao Mistério",
        description:
          "Acolher aquilo que não se deixa apreender por fórmulas ou palavras definitivas.",
        somaticTendency: "Pausa reverente e quietude do corpo inteiro.",
        nuances: [
          {
            id: "silencio_contemplativo",
            label: "Silêncio Contemplativo",
            description:
              "Descansar no fato de que nem tudo precisa de explicação para ser sentido.",
            somaticTendency: "Respiração natural e olhos serenos.",
          },
          {
            id: "humildade_perceptiva",
            label: "Humildade Perceptiva",
            description:
              "Reconhecer que somos parte de um tecido infinito maior que nosso entendimento.",
            somaticTendency: "Abaixamento leve da cabeça em sinal de paz.",
          },
          {
            id: "abertura_ao_insondavel",
            label: "Abertura ao Insondável",
            description:
              "Não temer o escuro ou o não-sabido, acolhendo-o como fertilidade.",
            somaticTendency: "Mãos descontraídas e peito aberto.",
          },
          {
            id: "vislumbre",
            label: "Vislumbre",
            description:
              "Um relance efêmero de totalidade que ilumina sem cegar.",
            somaticTendency: "Pequeno estremecimento agradável na espinha.",
          },
        ],
      },
    ],
  },
];
