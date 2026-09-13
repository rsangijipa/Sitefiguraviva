import { MicroCase } from "../types";

export const cases: MicroCase[] = [
  {
    id: "014",
    title: "Quando o silêncio parece pedir uma resposta",
    theme: "Silêncio",
    level: "Intermediário",
    summary:
      "Durante alguns minutos, Marina permanece em silêncio e olha repetidamente para o chão.",
    minutes: 6,
    vignette:
      "Marina está no terceiro encontro. Após falar sobre uma mudança recente de cidade, reduz o ritmo da fala e permanece em silêncio.",
    context: [
      "29 anos",
      "Terceiro encontro",
      "Mudança recente de cidade",
      "Relata dificuldade em pedir ajuda",
    ],
    quote: "Você não vai dizer nada?",
    steps: [
      {
        title: "O que chama sua atenção?",
        type: "observe",
        prompt:
          "Antes de pensar em uma explicação, escolha os elementos que você observaria primeiro.",
        options: [
          "Permanece em silêncio",
          "Olha para o chão",
          "Reduz ritmo da fala",
          "Pede uma resposta imediata",
        ],
      },
      {
        title: "Observação ou interpretação?",
        type: "differentiate",
        prompt: "Organize entre dado observável e hipótese interpretativa.",
        options: [
          "Olha para o chão (Observação)",
          "Está com vergonha (Interpretação)",
          "Mudança de tom (Observação)",
          "Medo de abandono (Interpretação)",
        ],
      },
      {
        title: "Formule uma pergunta",
        type: "question",
        prompt:
          "Que pergunta poderia aproximar você da experiência sem pressupor uma explicação?",
      },
      {
        title: "Compare intervenções",
        type: "interventions",
        prompt: "Qual intervenção preserva maior abertura para a experiência?",
        options: [
          "A: 'Você parece estar esperando algo de mim.'",
          "B: 'Como é esse silêncio agora?'",
        ],
      },
      {
        title: "Mudar o campo",
        type: "context_shift",
        prompt:
          "E se esta cena ocorresse após um ano de acompanhamento e após a terapeuta precisar remarcar encontros? O que muda na leitura?",
      },
    ],
    closure: {
      question: "Como o silêncio atua como figura no campo terapêutico?",
      observables: [
        "Mudança no ritmo respiratório",
        "Postura corporal recolhida",
        "Tempo de latência nas respostas",
      ],
      readings: [
        "O silêncio como interrupção do contato",
        "A expectativa de direcionamento externo",
      ],
      concepts: ["Awareness", "Campo", "Contato", "Fronteiras"],
      questionsRemaining: [
        "O que o silêncio protege neste momento?",
        "Como a cliente experimenta a presença da terapeuta?",
      ],
      references: [
        "Polster, E. & M. - Gestalt-terapia integrada",
        "Robine, J.-M. - O campo do contato",
      ],
    },
  },
  {
    id: "021",
    title: "A urgência de encontrar uma explicação",
    theme: "Awareness",
    level: "Introdutório",
    summary:
      "Depois de uma pausa, a pessoa pergunta: ‘Você não vai dizer nada?’",
    minutes: 4,
    vignette:
      "Em um momento de impasse sobre uma decisão profissional, o cliente cessa a fala, olha fixamente e demanda uma posição da terapeuta.",
    context: [
      "34 anos",
      "Sétimo encontro",
      "Histórico de decisões sob pressão familiar",
    ],
    quote: "Me diz o que você faria no meu lugar.",
    steps: [
      {
        title: "O que chama sua atenção?",
        type: "observe",
        prompt: "Identifique os marcadores de urgência na fala e na postura.",
        options: [
          "Demanda diretividade",
          "Fixação do olhar",
          "Aceleração do ritmo",
        ],
      },
      {
        title: "Formule uma pergunta",
        type: "question",
        prompt:
          "Como convidar o cliente a retornar à própria percepção sem recusar o pedido?",
      },
    ],
    closure: {
      question:
        "Como lidar com a demanda por respostas prontas sem fechar o campo de investigação?",
      observables: [
        "Apressamento da respiração",
        "Projeção da autoridade decisória",
      ],
      readings: ["Fechamento prematuro por ansiedade de desempenho"],
      concepts: ["Awareness", "Confluência"],
      questionsRemaining: ["O que acontece quando a urgência é suspensa?"],
      references: ["Yontef, G. - Awareness, Diálogo e Processo"],
    },
  },
  {
    id: "032",
    title: "O corpo que muda antes da narrativa",
    theme: "Corpo",
    level: "Avançado",
    summary:
      "Ao falar sobre a mudança de cidade, seus ombros se contraem e a fala diminui.",
    minutes: 7,
    vignette:
      "A narrativa verbal relata tranquilidade, mas a tonicidade corporal e o padrão respiratório revelam forte contenção.",
    context: ["41 anos", "Primeiro mês", "Migração recente"],
    quote: "Está tudo bem, foi uma escolha planejada.",
    steps: [
      {
        title: "O que chama sua atenção?",
        type: "observe",
        prompt:
          "Observe a contradição entre relato verbal e expressão corporal.",
        options: [
          "Contração de ombros",
          "Resistência torácica",
          "Discrepância verbal-corporal",
        ],
      },
      {
        title: "Mudar o campo",
        type: "context_shift",
        prompt:
          "Considerando que a mudança foi involuntária, como a expressão corporal se reorganiza?",
      },
    ],
    closure: {
      question:
        "Quando o corpo conta uma história diferente da palavra, onde repousa a intervenção?",
      observables: ["Rigidez escapular", "Voz sussurrada"],
      readings: ["A dissociação entre afeto e suporte somático"],
      concepts: ["Corpo", "Experimentação", "Contato"],
      questionsRemaining: ["Como apoiar a integração da experiência corporal?"],
      references: ["Kepner, J. - O Processo Corporal na Gestalt-terapia"],
    },
  },
];

export const themes = [
  "Awareness",
  "Contato",
  "Figura e Fundo",
  "Teoria de Campo",
  "Relação Terapêutica",
  "Fenomenologia",
  "Corpo",
  "Silêncio",
  "Ética",
];
