import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Award,
  FileText,
  Calendar,
  User,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

/**
 * Fonte única de navegação do portal do aluno.
 * Consumida por SidebarNav (menu lateral) e DashboardShell (busca rápida) —
 * nunca duplicar listas de links na mão.
 */
export interface PortalNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  {
    label: "Visão Geral",
    icon: LayoutDashboard,
    href: ROUTES.portal,
    keywords: ["home", "inicio"],
  },
  {
    label: "Meus Cursos",
    icon: BookOpen,
    href: ROUTES.courses,
    keywords: ["curso", "aula", "conteudo"],
  },
  {
    label: "Certificados",
    icon: Award,
    href: ROUTES.certificates,
    keywords: ["certificado", "conclusao"],
  },
  {
    label: "Comunidade",
    icon: MessageSquare,
    href: ROUTES.community,
    keywords: ["forum", "discussao"],
  },
  {
    label: "Materiais",
    icon: FileText,
    href: ROUTES.materials,
    keywords: ["pdf", "arquivo", "material"],
  },
  {
    label: "Ao Vivo",
    icon: Calendar,
    href: ROUTES.events,
    keywords: ["evento", "aovivo", "mentoria", "agenda"],
  },
];

/** Itens extras da busca rápida (não entram no menu lateral). */
export const PORTAL_UTILITY_NAV_ITEMS: PortalNavItem[] = [
  {
    label: "Minha Conta",
    icon: User,
    href: ROUTES.settings,
    keywords: ["perfil", "configuracao", "senha"],
  },
];

/** Lista completa usada pela busca global do topbar. */
export const PORTAL_SEARCH_ITEMS: PortalNavItem[] = [
  ...PORTAL_NAV_ITEMS,
  ...PORTAL_UTILITY_NAV_ITEMS,
];
