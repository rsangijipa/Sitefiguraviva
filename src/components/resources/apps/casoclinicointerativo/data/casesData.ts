import { ClinicalCase } from "../types";

export const CASES_DATA: ClinicalCase[] = [
  {
    id: 1,
    theme: "ansiedade",
    title: "O Peso do Amanhã",
    subtitle: "Ansiedade antecipatória e o corpo em alerta constante",
    patientProfile: {
      name: "Marina",
      age: 28,
      occupation: "Designer gráfica",
      context:
        "Vive sozinha em grande centro urbano, relacionamento estável há 3 anos",
    },
    presentingIssue:
      'Marina relata "uma sensação constante de que algo ruim vai acontecer". Acorda com taquicardia, tem dificuldade para dormir e evita situações novas no trabalho por medo de falhar. Nos últimos 6 meses, começou a recusar convites sociais e projetos desafiadores.',
    background:
      'Filha única, pais superprotetores. Mãe com histórico de transtorno de ansiedade generalizada. Na adolescência, sofreu bullying por 2 anos. Formou-se com excelência, mas sempre atribuiu conquistas à sorte. Relata "síndrome do impostor" desde o primeiro emprego.',
    keyObservations: [
      "Linguagem corporal: ombros elevados, respiração superficial, mãos frias",
      'Discurso permeado por "e se..." e cenários catastróficos',
      'Dificuldade em nomear emoções além de "medo" e "preocupação"',
      "Corpo como palco da ansiedade: tensão mandibular, bruxismo, dor lombar crônica",
      "Evitação como estratégia principal de regulação",
    ],
    therapeuticApproach:
      'Abordagem integrativa: psicoeducação sobre o ciclo da ansiedade + técnicas de grounding corporal (respiração diafragmática, varredura corporal) + reestruturação cognitiva de pensamentos catastróficos + exposição graduada a situações evitadas + trabalho com a criança interior e crenças de base ("não sou capaz", "o mundo é perigoso").',
    learningPoints: [
      "A ansiedade não é o inimigo — é um sistema de alarme hiperativo tentando proteger",
      "O corpo sabe antes da mente: sinais somáticos precedem pensamentos ansiosos",
      'Evitação mantém o ciclo: cada vez que evita, o cérebro confirma "era perigoso"',
      'Pequenas exposições criam nova aprendizagem: "consegui lidar"',
      "A relação terapêutica como base segura para experimentar vulnerabilidade",
    ],
    reflectionQuestions: [
      "Quais situações Marina evita e o que isso lhe custa?",
      "Como o corpo de Marina comunica o que suas palavras não dizem?",
      'Que crenças de base sustentam "algo ruim vai acontecer"?',
      "Como a história familiar influencia sua resposta ao estresse?",
      "Que pequenos passos de exposição poderiam ser propostos esta semana?",
    ],
    estimatedTimeMinutes: 12,
  },
  {
    id: 2,
    theme: "depressao",
    title: "A Cor que Se Apagou",
    subtitle: "Depressão maior recorrente e a perda de sentido",
    patientProfile: {
      name: "Roberto",
      age: 42,
      occupation: "Professor de história do ensino médio",
      context: "Casado, dois filhos (10 e 13 anos), licença médica há 3 meses",
    },
    presentingIssue:
      'Roberto descreve "um vazio que não passa". Perdeu interesse pela docência — antes sua paixão. Acorda exausto, passa horas na cama, negligencia higiene básica. Sente-se "um fardo" para a família. Pensamentos passivos de morte ("melhor não estar aqui"), sem plano ativo.',
    background:
      'Segundo de 4 irmãos, pai alcoolista ausente, mãe depressiva. Assumiu papel de "filho forte" aos 12 anos. Sempre foi o "resolvedor" da família. Dois episódios depressivos anteriores (aos 22 e 31 anos), tratados apenas com medicação. Relata "nunca ter tido tempo para sentir".',
    keyObservations: [
      "Voz monótona, olhar baixo, movimentos lentificados",
      'Autocrítica feroz: "sou fraco", "deveria aguentar", "estou decepcionando todos"',
      "Anedonia generalizada: nem música, nem filhos, nem leitura trazem prazer",
      "Culpa como emoção central — não tristeza, mas culpa por estar doente",
      "Isolamento progressivo: parou de responder mensagens, recusou visitas",
    ],
    therapeuticApproach:
      'Fase 1: Estabilização e aliança — validação da dor, psicoeducação, rede de apoio, avaliação de risco. Fase 2: Ativação comportamental graduada (micro-metras: banho, caminhada 5 min, ler 1 parágrafo). Fase 3: Trabalho cognitivo com crenças de base ("sou um fardo", "preciso ser forte", "minhas necessidades não importam"). Fase 4: Luto pelo "eu forte" e integração da vulnerabilidade. Fase 5: Prevenção de recaída e construção de sentido.',
    learningPoints: [
      "Depressão não é fraqueza — é uma resposta adaptativa esgotada",
      "A ativação comportamental precede a motivação: age-se para sentir, não sente-se para agir",
      'Culpa depressiva mascara luto não processado: pelo pai, pela infância, pelo "eu ideal"',
      'A relação terapêutica pode ser a primeira experiência de "ser testemunhado sem julgamento"',
      "Recaídas não apagam o progresso — são parte do processo de aprendizagem",
    ],
    reflectionQuestions: [
      "Que papel Roberto desempenhou na família e qual o custo disso?",
      "Como a anedonia difere de tristeza e por que isso importa clinicamente?",
      "Que micro-passos de ativação seriam possíveis hoje?",
      "O que a culpa protege Roberto de sentir?",
      "Como construir sentido quando nada parece importar?",
    ],
    estimatedTimeMinutes: 15,
  },
  {
    id: 3,
    theme: "trauma",
    title: "O Eco do Silêncio",
    subtitle: "Trauma complexo na infância e dissociação na vida adulta",
    patientProfile: {
      name: "Aline",
      age: 35,
      occupation: "Enfermeira de UTI",
      context:
        "Solteira, mora com gato, poucos amigos próximos, contato esporádico com família",
    },
    presentingIssue:
      'Aline busca terapia por "lacunas de memória" e "sensação de irrealidade". Relata episódios de "assistir a si mesma de fora" durante plantões estressantes. Tem pesadelos recorrentes sem conteúdo nítido. Evita filmes/séries com violência médica. Sente-se "quebrada por dentro" mas funcionalmente competente.',
    background:
      'Infância marcada por negligência emocional severa e abuso físico intermitente do pai (até os 14 anos). Mãe depressiva, não protegia. Aline "desaparecia" mentalmente durante abusos. Aos 16, fugiu de casa. Construiu vida sozinha. Escolheu enfermagem "para cuidar do que não foi cuidado". Nunca falou do passado até agora.',
    keyObservations: [
      "Narrativa fragmentada: salta no tempo, lacunas, mudanças de tom de voz",
      "Dissociação como estratégia de sobrevivência: despersonalização, desrealização, amnésia dissociativa",
      'Hipervigilância disfarçada de competência profissional: "sempre alerta, sempre pronta"',
      "Dificuldade em tolerar afeto positivo: elogios geram vergonha ou ansiedade",
      "Corpo como arquivo do trauma: dores crônicas sem causa médica, sobressalto excessivo",
    ],
    therapeuticApproach:
      "Modelo trifásico (Herman/van der Kolk): Fase 1 — Estabilização e segurança: psicoeducação sobre trauma e dissociação, janela de tolerância, recursos de grounding, regulação autonômica. Fase 2 — Processamento: EMDR ou exposição narrativa graduada, trabalho com partes (IFS/ego states), reprocessamento de memórias traumáticas. Fase 3 — Integração e reconexão: reconstrução da identidade, relações íntimas, projeto de vida. Ritmo ditado pela paciente.",
    learningPoints: [
      "Trauma complexo ≠ PTSD simples: afeta organização da personalidade, não apenas memória",
      "Dissociação é criativa: a mente protege quando não há fuga nem luta possíveis",
      "Sintomas são adaptações: hipervigilância salvou a vida, agora limita",
      "O corpo guarda a conta: abordagens somáticas são essenciais, não opcionais",
      'Relação terapêutica como "laboratório de apego seguro" — reparação relacional',
    ],
    reflectionQuestions: [
      "Como a dissociação serviu Aline na infância e como a limita hoje?",
      "Por que a competência profissional pode mascarar sofrimento profundo?",
      "Que recursos de grounding seriam mais adequados para seu perfil?",
      'Como trabalhar com "partes" sem patologizar a multiplicidade?',
      'O que "integração" significa para alguém que nunca se sentiu inteira?',
    ],
    estimatedTimeMinutes: 18,
  },
  {
    id: 4,
    theme: "relacionamento",
    title: "A Dança dos Dois Passos",
    subtitle: "Padrão ansioso-evitativo e o medo da intimidade",
    patientProfile: {
      name: "Casal: Lucas (34) e Fernanda (32)",
      age: 34,
      occupation: "Lucas: Engenheiro civil / Fernanda: Psicóloga escolar",
      context:
        "Juntos há 4 anos, moram juntos há 2, sem filhos, decidiram terapia de casal",
    },
    presentingIssue:
      'Ciclo repetitivo: Fernanda busca proximidade (liga, quer conversar, precisa de confirmação) → Lucas sente pressão, recolhe-se (silêncio, sai de casa, "preciso de espaço") → Fernanda entra em pânico, intensifica busca → Lucas sente-se sufocado, afasta-se mais. Ambos se sentem incompreendidos e sozinhos.',
    background:
      'Lucas: filho único, pais emocionalmente distantes, aprendeu "necessidades são fraqueza". Histórico de relacionamentos curtos, termina quando "fica sério". Fernanda: caçula de 3, mãe ansiosa, pai ausente. Aprendeu "amor = ansiedade, preciso ganhar atenção". Relacionamentos anteriores com parceiros evitativos.',
    keyObservations: [
      "Padrão perseguição-distanciamento (demand-withdraw) clássico",
      "Emoções primárias mascaradas: Fernanda sente medo de abandono → expressa raiva/cobrança. Lucas sente inadequação/vergonha → expressa frieza/evitação",
      "Ambos têm apego inseguro: ela ansioso, ele evitativo — se atraem e se reativam",
      'Momentos de conexão genuína existem mas são "engolidos" pelo ciclo',
      "Fernanda intelectualiza (usa jargão terapêutico); Lucas racionaliza (foca em soluções práticas)",
    ],
    therapeuticApproach:
      'EFT (Terapia Focada na Emoção) para casais: 1) Desescalada do ciclo negativo — identificar gatilhos, emoções secundárias vs. primárias, necessidades de apego não ditas. 2) Reestruturação da interação — acessar vulnerabilidade, expressar necessidades diretamente, responder ao outro. 3) Consolidação — novos ciclos de segurança, rituais de conexão, narrativa compartilhada de "nós contra o ciclo". Trabalho individual paralelo recomendado.',
    learningPoints: [
      "O problema não é um nem o outro — é o ciclo que os captura",
      "Raiva protege medo; frieza protege vergonha — olhar por trás da defesa",
      "Apego inseguro se atrai: o ansioso persegue o evitativo, confirmando medos de ambos",
      'Segurança emocional se constrói em micro-momentos: "estou aqui", "você importa"',
      'Terapia de casal não é "consertar o outro" — é mudar a dança juntos',
    ],
    reflectionQuestions: [
      "Qual o ciclo específico deste casal e quais os gatilhos de cada um?",
      "Que emoções primárias estão por trás das reações defensivas?",
      "Como cada um aprendeu a lidar com necessidades de apego na infância?",
      "Que novo ciclo de interação poderia ser ensaiado esta semana?",
      "Como o terapeuta evita aliar-se a um lado e mantém a aliança com ambos?",
    ],
    estimatedTimeMinutes: 14,
  },
  {
    id: 5,
    theme: "identidade",
    title: "Quem Sou Eu Quando Ninguém Olha",
    subtitle: "Crise de identidade na transição de meia-idade",
    patientProfile: {
      name: "Paulo",
      age: 48,
      occupation: "Executivo de marketing (recém-demissionário)",
      context:
        "Divorciado há 2 anos, filha de 16 anos (guarda compartilhada), mora sozinho",
    },
    presentingIssue:
      'Após 22 anos na mesma empresa, foi desligado em reestruturação. Desde então, "não sei quem sou sem o cargo". Relata vazio, insônia, irritabilidade. Filha diz "pai está estranho". Tentou consultoria, não sustentou. Sente que "a vida passou e eu não vivi". Questiona escolhas, valores, legado.',
    background:
      'Filho mais velho, "orgulho da família". Carreira escolhida pelo pai ("marketing dá dinheiro"). Casou cedo, "era o esperado". Sempre performou: aluno nota 10, funcionário modelo, pai provedor. Nunca perguntou "o que eu quero?". Divórcio foi iniciativa da esposa ("você não está aqui"). Desde então, vazio progressivo.',
    keyObservations: [
      "Identidade totalmente fundida ao papel profissional e expectativas externas",
      'Luto não processado: pelo casamento, pelo cargo, pelo "eu idealizado"',
      'Vergonha de "não estar bem" — "tenho tudo para ser feliz"',
      'Dificuldade em acessar desejos autênticos: "nunca aprendi a querer"',
      "Corpo somatizando: hipertensão recente, refluxo, cefaleia tensional",
    ],
    therapeuticApproach:
      'Abordagem existencial-humanista + narrativa: 1) Acolhimento e validação do luto múltiplo. 2) Desconstrução da "história oficial" — separar "eu deveria" de "eu quero". 3) Exploração de valores autênticos (exercícios de legado, carta ao eu mais jovem, linha da vida). 4) Experimentação: pequenos atos de autonomia (hobby esquecido, dizer não, pedir ajuda). 5) Reconstrução narrativa: integrar passado, aceitar finitude, autorar próximo capítulo.',
    learningPoints: [
      "Crise de meia-idade não é patologia — é convite à autenticidade",
      "Identidade baseada em papéis externos é frágil: quando o papel cai, o eu cai junto",
      'Luto por "vidas não vividas" é real e necessário',
      "Autonomia se constrói em atos pequenos e cotidianos, não em grandes gestos",
      'O terapeuta como "testemunha compassiva" da emergência do self verdadeiro',
    ],
    reflectionQuestions: [
      "Que partes da vida de Paulo foram escolhidas por ele e quais foram herdadas?",
      'Como o luto pelo cargo se entrelaça com luto pelo casamento e pelo "eu ideal"?',
      "Que experimentos de autonomia seriam possíveis e significativos agora?",
      'Como trabalhar com a vergonha de "não estar bem apesar de ter tudo"?',
      'O que "legado" significa para Paulo além de conquistas profissionais?',
    ],
    estimatedTimeMinutes: 16,
  },
];
