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
  googleAnalyticsId?: string;
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
  // Empty by default so the generated card in src/app/opengraph-image.tsx is
  // used. Set this in Admin → Settings only to override with a custom image.
  ogImage: "",
  keywords: ["Gestalt", "Psicologia", "Formação", "Terapia", "Rondônia"],
  googleAnalyticsId: "",
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

// Legal copy lives in a dependency-free module (./legal) so Server
// Components can render it without pulling in the client Firebase SDK
// imported at the top of this file. Re-exported here for existing callers.
export { DEFAULT_LEGAL, LEGAL_ROUTES } from "./legal";
export type {
  LegalSettings,
  LegalSection,
  LegalDocumentContent,
  LegalDocumentType,
} from "./legal";

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
