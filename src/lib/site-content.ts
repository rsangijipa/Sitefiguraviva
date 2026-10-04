export interface HomeSettings {
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  coursesTitle: string;
  coursesDescription: string;
  blogTitle: string;
  libraryTitle: string;
  blogDescription: string;
  faqTitle: string;
  faqs: { question: string; answer: string }[];
}

export const DEFAULT_HOME: HomeSettings = {
  heroTitle: "Instituto de Gestalt-terapia de Rondônia",
  heroAccent: "Figura Viva",
  heroDescription:
    "Transforme sua percepção e prática através da Gestalt-Terapia. Um espaço de estudo dedicado à profundidade da relação.",
  coursesTitle: "Ciclos de Aprendizagem",
  coursesDescription:
    "Nossos percursos formativos são convites para habitar a Gestalt-terapia com rigor ético, densidade teórica e sensibilidade clínica.",
  blogTitle: "Blog Figura Viva",
  libraryTitle: "Biblioteca Figura Viva",
  blogDescription:
    "Reflexões, leituras e conhecimentos para ampliar a prática e o encontro.",
  faqTitle: "Perguntas Frequentes",
  faqs: [
    {
      question: "Os cursos possuem certificado?",
      answer:
        "Consulte as condições de certificação na descrição de cada formação ou entre em contato com o instituto.",
    },
    {
      question: "As aulas são ao vivo ou gravadas?",
      answer:
        "O formato varia conforme o curso. Confira a proposta e o cronograma na página da formação desejada.",
    },
    {
      question: "Preciso ser psicólogo para participar?",
      answer:
        "O público de cada curso é informado na sua proposta. Fale com o instituto para confirmar os pré-requisitos da formação que deseja realizar.",
    },
    {
      question: "Como funciona o acesso à plataforma?",
      answer:
        "Depois de se cadastrar, acompanhe sua inscrição na Área do Aluno. O acesso ao curso é liberado após a aprovação da matrícula.",
    },
    {
      question: "Como esclarecer dúvidas sobre a inscrição?",
      answer:
        "Entre em contato pelo WhatsApp do instituto para conversar sobre a proposta, os valores e as condições de participação.",
    },
  ],
};

export const DEFAULT_MANIFESTO_BODY =
  "Na Gestalt, a vida acontece na fronteira entre organismo e ambiente, entre o que sinto e o que digo, entre o que foi e o que pode nascer agora.\n\nNo Figura Viva, levamos esse encontro a sério — com rigor, ética e humanidade. Não oferecemos fórmulas para caber em pessoas. Criamos condições para que cada pessoa perceba como está no mundo e reconheça novas possibilidades de escolha.\n\nAprender, para nós, é uma experiência inteira. O corpo participa. A história participa. O território participa. A diferença participa. Teoria e prática se encontram quando o conhecimento transforma a qualidade da presença.\n\nSustentamos uma clínica situada, atenta às relações de poder e comprometida com modos de cuidado que não apagam singularidades. Acolher não é suavizar a realidade: é criar apoio para atravessá-la com consciência.";
