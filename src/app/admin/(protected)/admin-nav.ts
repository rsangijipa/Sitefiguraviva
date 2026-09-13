import {
  LayoutDashboard,
  Shield,
  UserPlus,
  BookOpen,
  Check,
  FileText,
  ClipboardList,
  Calendar,
  Users,
  Trophy,
  Globe,
  PenTool,
  Headphones,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Fonte única de navegação do painel admin.
 * Consumida por AdminShell (sidebar + busca) — nunca duplicar listas na mão.
 */
export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  keywords?: string[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Visão Geral", icon: LayoutDashboard, path: "/admin" },
  {
    label: "Usuários & Permissões",
    icon: Shield,
    path: "/admin/users",
    keywords: ["usuarios", "permissoes", "papeis"],
  },
  {
    label: "Interessados",
    icon: UserPlus,
    path: "/admin/applications",
    keywords: ["candidatos", "inscricoes"],
  },
  { label: "Cursos", icon: BookOpen, path: "/admin/courses" },
  {
    label: "Aprovações",
    icon: Check,
    path: "/admin/approvals",
    keywords: ["deferimento"],
  },
  {
    label: "Avaliações (Provas)",
    icon: FileText,
    path: "/admin/assessments",
  },
  {
    label: "Correções (Provas)",
    icon: ClipboardList,
    path: "/admin/assessments/submissions",
  },
  {
    label: "Eventos Ao Vivo",
    icon: Calendar,
    path: "/admin/events",
    keywords: ["agenda", "aovivo"],
  },
  {
    label: "Alunos & Matrículas",
    icon: Users,
    path: "/admin/enrollments",
    keywords: ["matriculas", "turmas"],
  },
  {
    label: "Gamificação",
    icon: Trophy,
    path: "/admin/gamification",
    keywords: ["xp", "conquistas"],
  },
  {
    label: "Google Suite",
    icon: Globe,
    path: "/admin/google",
    keywords: ["integração"],
  },
  {
    label: "Diário Visual",
    icon: PenTool,
    path: "/admin/blog",
    keywords: ["posts", "artigos"],
  },
  { label: "Galeria", icon: BookOpen, path: "/admin/gallery" },
  {
    label: "Documentos",
    icon: FileText,
    path: "/admin/public-docs",
    keywords: ["termos", "privacidade"],
  },
  {
    label: "Sala de Pausa",
    icon: Headphones,
    path: "/admin/pause-rooms",
  },
  {
    label: "Sons para Awareness",
    icon: Headphones,
    path: "/admin/awareness-sounds",
  },
  {
    label: "Logs de Sistema",
    icon: Activity,
    path: "/admin/logs",
    keywords: ["auditoria"],
  },
  {
    label: "Utilidades (Dev)",
    icon: Settings,
    path: "/admin/utilities",
    keywords: ["dev", "ferramentas"],
  },
  {
    label: "Configurações",
    icon: Settings,
    path: "/admin/settings",
    keywords: ["fundador", "site"],
  },
];
