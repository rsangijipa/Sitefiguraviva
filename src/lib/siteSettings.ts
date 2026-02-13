import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

// --- Types ---

export interface FounderSettings {
  name: string;
  role: string;
  bio: string;
  image: string;
  link: string; // Link Lattes
  signature?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export interface InstituteSettings {
  title: string;
  subtitle: string;
  manifesto_title: string;
  manifesto_text: string;
  quote: string;
  address: string;
  phone: string;
  whatsapp?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export interface ConfigSettings {
  enableParticles?: boolean;
  visualMode?: "modern" | "classic";
  showAudioControl?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  updatedAt?: any;
}

export interface SEOSettings {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  keywords: string[];
  updatedAt?: any;
  updatedBy?: string;
}

// --- Defaults (Fallbacks) ---

export const DEFAULT_FOUNDER: FounderSettings = {
  name: "Lilian Vanessa Nicacio Gusmão Vianei",
  role: "Psicóloga e Gestalt-terapeuta",
  bio: "Psicóloga, gestalt-terapeuta e pesquisadora, com trajetória que integra clínica, docência e estudos em trauma, psicoterapia corporal e neurodiversidades, além de perspectivas feministas e decoloniais.",
  image: "/assets/lilian-vanessa.jpeg",
  link: "http://lattes.cnpq.br/",
};

export const DEFAULT_INSTITUTE: InstituteSettings = {
  title: "O Instituto Figura Viva",
  subtitle:
    "Um espaço vivo de acolhimento clínico e formação profissional — onde o encontro transforma.",
  manifesto_title: "Habitar a Fronteira",
  manifesto_text:
    "Na Gestalt, a vida acontece no contato: na fronteira entre organismo e ambiente, entre o que sinto e o que digo, entre o que foi e o que pode nascer agora. No Figura Viva, a gente leva isso a sério — com rigor, com ética e com humanidade.",
  quote: "O encontro é a fronteira onde a vida se renova.",
  address:
    "Rua Santos Dumont, 156 - Uniao, Ouro Preto D'Oeste - RO - CEP 76920-000",
  phone: "(69) 99248-1585",
  whatsapp: "556992481585",
};

export const DEFAULT_CONFIG: ConfigSettings = {
  enableParticles: true,
  visualMode: "modern",
  showAudioControl: true,
  whatsappNumber: "556992481585",
  whatsappMessage:
    "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.",
};

export const DEFAULT_SEO: SEOSettings = {
  defaultTitle: "Instituto Figura Viva | Formação em Gestalt-Terapia",
  defaultDescription:
    "O Instituto Figura Viva é um espaço de excelência em formação, clínica e pesquisa em Gestalt-terapia.",
  ogImage: "/assets/og-image.jpg",
  keywords: ["Gestalt", "Psicologia", "Formação", "Terapia", "Rondônia"],
};

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  order: number;
}

export interface TeamSettings {
  members: TeamMember[];
}

export const DEFAULT_TEAM: TeamSettings = {
  members: [],
};

export interface LegalSettings {
  privacy: {
    title: string;
    lastUpdated: string;
    content: { heading: string; text: string }[];
  };
  terms: {
    title: string;
    lastUpdated: string;
    content: { heading: string; text: string }[];
  };
}

export const DEFAULT_LEGAL: LegalSettings = {
  privacy: {
    title: "Política de Privacidade",
    lastUpdated: "Janeiro de 2026",
    content: [
      {
        heading: "1. Introdução",
        text: "O Instituto Figura Viva respeita a sua privacidade e compromete-se a proteger os dados pessoais que você compartilha conosco. Esta política explica como coletamos, usamos e protegemos suas informações.",
      },
      {
        heading: "2. Coleta de Dados",
        text: "Coletamos informações essenciais para a prestação de nossos serviços educacionais e terapêuticos, incluindo: nome completo, e-mail, telefone e, quando necessário para matrícula, dados de pagamento e endereço. O uso de cookies no site limita-se a garantir a funcionalidade técnica e melhorar sua experiência de navegação.",
      },
      {
        heading: "3. Uso das Informações",
        text: "Seus dados são utilizados exclusivamente para: processar inscrições em cursos e grupos de estudos; enviar comunicações institucionais relevantes; emitir certificados; e cumprir obrigações legais.",
      },
      {
        heading: "4. Compartilhamento de Dados",
        text: "Não vendemos nem comercializamos seus dados. O compartilhamento ocorre apenas com parceiros estritamente necessários para a operação (ex: processadores de pagamento) ou por obrigação legal.",
      },
      {
        heading: "5. Seus Direitos (LGPD)",
        text: "Conforme a Lei Geral de Proteção de Dados, você tem direito a solicitar o acesso, correção, anonimização ou exclusão de seus dados pessoais a qualquer momento, entrando em contato através de nossos canais oficiais.",
      },
    ],
  },
  terms: {
    title: "Termos de Uso",
    lastUpdated: "Janeiro de 2026",
    content: [
      {
        heading: "1. Aceite dos Termos",
        text: "Ao acessar o site e utilizar os serviços do Instituto Figura Viva, você concorda com estes termos. Se não concordar, pedimos que não utilize nossos serviços.",
      },
      {
        heading: "2. Uso do Conteúdo",
        text: "Todo o conteúdo disponibilizado neste site (textos, imagens, vídeos, materiais didáticos) é de propriedade intelectual do Instituto Figura Viva ou de seus parceiros. É proibida a reprodução, distribuição ou uso comercial sem autorização prévia por escrito.",
      },
      {
        heading: "3. Inscrições e Cancelamentos",
        text: "As inscrições para cursos e grupos estão sujeitas à disponibilidade de vagas. Políticas de cancelamento e reembolso são especificadas no ato da contratação de cada serviço.",
      },
      {
        heading: "4. Conduta do Usuário",
        text: "Espera-se que os usuários mantenham uma conduta respeitosa e ética nos espaços digitais do Instituto, incluindo áreas de comentários e aulas ao vivo.",
      },
      {
        heading: "5. Alterações",
        text: "O Instituto Figura Viva reserva-se o direito de alterar estes termos a qualquer momento. Recomendamos a consulta periódica desta página.",
      },
    ],
  },
};

// --- Fetchers (Client-Safe) ---

export async function getSiteSettings<T>(
  key: "founder" | "institute" | "seo" | "team" | "legal" | "config",
  fallback: T,
): Promise<T> {
  try {
    const snap = await getDoc(doc(db, "siteSettings", key));
    if (snap.exists()) {
      return { ...fallback, ...snap.data() } as T;
    }
    return fallback;
  } catch (error) {
    console.error(`Error fetching siteSettings/${key}:`, error);
    return fallback;
  }
}
