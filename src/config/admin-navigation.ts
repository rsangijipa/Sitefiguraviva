import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Calendar,
  Check,
  ClipboardList,
  FileText,
  Globe,
  LayoutDashboard,
  Library,
  PenTool,
  Settings,
  Shield,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

export interface AdminNavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export interface AdminNavigationGroup {
  label:
    | "Visão geral"
    | "Pessoas"
    | "Aprendizagem"
    | "Conteúdo"
    | "Operação"
    | "Sistema";
  items: AdminNavigationItem[];
}

export const ADMIN_NAVIGATION_GROUPS: AdminNavigationGroup[] = [
  {
    label: "Visão geral",
    items: [{ icon: LayoutDashboard, label: "Visão Geral", path: "/admin" }],
  },
  {
    label: "Pessoas",
    items: [
      { icon: Shield, label: "Usuários e permissões", path: "/admin/users" },
      { icon: UserPlus, label: "Interessados", path: "/admin/applications" },
      { icon: Users, label: "Matrículas", path: "/admin/enrollments" },
    ],
  },
  {
    label: "Aprendizagem",
    items: [
      { icon: BookOpen, label: "Cursos", path: "/admin/courses" },
      { icon: Check, label: "Aprovações", path: "/admin/approvals" },
      {
        icon: FileText,
        label: "Avaliações",
        path: "/admin/assessments",
      },
      {
        icon: ClipboardList,
        label: "Correções",
        path: "/admin/assessments/submissions",
      },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { icon: PenTool, label: "Diário Visual", path: "/admin/blog" },
      { icon: BookOpen, label: "Galeria", path: "/admin/gallery" },
      { icon: FileText, label: "Documentos", path: "/admin/public-docs" },
      { icon: Library, label: "Livros", path: "/admin/books" },
    ],
  },
  {
    label: "Operação",
    items: [
      { icon: Calendar, label: "Calendário", path: "/admin/calendar" },
      { icon: Calendar, label: "Eventos Ao Vivo", path: "/admin/events" },
      { icon: Trophy, label: "Gamificação", path: "/admin/gamification" },
      { icon: Globe, label: "Google Suite", path: "/admin/google" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: Activity, label: "Histórico do sistema", path: "/admin/logs" },
      { icon: Settings, label: "Utilidades", path: "/admin/utilities" },
      { icon: Settings, label: "Configurações", path: "/admin/settings" },
    ],
  },
];

export function isAdminRouteActive(pathname: string | null, itemPath: string) {
  if (!pathname) return false;
  if (itemPath === "/admin") return pathname === itemPath;

  const matches = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  const hasMoreSpecificMatch = ADMIN_NAVIGATION_GROUPS.some((group) =>
    group.items.some(
      (item) =>
        item.path !== itemPath &&
        item.path.startsWith(`${itemPath}/`) &&
        (pathname === item.path || pathname.startsWith(`${item.path}/`)),
    ),
  );
  return matches && !hasMoreSpecificMatch;
}
