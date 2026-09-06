import {
  Award,
  BookOpen,
  Image as ImageIcon,
  PenTool,
  Sparkles,
  Users,
} from "lucide-react";

export const PUBLIC_NAV_ITEMS = [
  { label: "Instituto", href: "/instituto", icon: Users },
  { label: "Fundadora", href: "/instituto/fundadora", icon: Award },
  { label: "Formações", href: "/formacoes", icon: Sparkles },
  { label: "Biblioteca", href: "/public-library", icon: BookOpen },
  { label: "Galeria", href: "/public-gallery", icon: ImageIcon },
  { label: "Blog", href: "/blog", icon: PenTool },
  { label: "Recursos", href: "/recursos", icon: Sparkles },
] as const;
