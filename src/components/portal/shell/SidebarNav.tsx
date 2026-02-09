import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Calendar,
  MessageSquare,
  Award,
  FileText,
  LifeBuoy,
  User,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Assuming context exists
import { ROUTES } from "@/lib/routes";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isHighlight?: boolean;
}

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  isHighlight,
}: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
      isActive
        ? "bg-stone-100 text-stone-900 font-medium"
        : isHighlight
          ? "text-gold hover:bg-gold/5"
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
    )}
  >
    <Icon
      size={18}
      className={cn(
        "transition-colors",
        isActive
          ? "text-primary"
          : isHighlight
            ? "text-gold"
            : "text-stone-400 group-hover:text-stone-600",
      )}
    />
    <span className="text-sm">{label}</span>
    {isHighlight && (
      <span className="absolute right-3 w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(180,147,75,0.8)]" />
    )}
  </Link>
);

export const SidebarNav = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const NAV_ITEMS = [
    { label: "Visão Geral", icon: LayoutDashboard, href: ROUTES.portal },
    { label: "Meus Cursos", icon: BookOpen, href: ROUTES.courses },
    { label: "Certificados", icon: Award, href: ROUTES.certificates },
    { label: "Comunidade", icon: MessageSquare, href: ROUTES.community },
    { label: "Materiais", icon: FileText, href: ROUTES.materials },
    { label: "Ao Vivo", icon: Calendar, href: ROUTES.events },
  ];

  const { role } = useAuth();
  const adminItem = {
    label: "Administração",
    icon: ShieldAlert,
    href: "/admin",
    isHighlight: true,
  };

  const isPathActive = (href: string) => {
    if (href === ROUTES.portal && pathname === ROUTES.portal) return true;
    if (href !== ROUTES.portal && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "w-64 border-r border-stone-100 bg-white h-screen flex flex-col sticky top-0",
        className,
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-stone-50">
        <span className="font-serif text-xl font-bold text-stone-900">
          Figura Viva
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isPathActive(item.href)}
          />
        ))}

        {role === "admin" && (
          <div className="pt-4 mt-4 border-t border-stone-100">
            <NavItem {...adminItem} isActive={pathname.startsWith("/admin")} />
          </div>
        )}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-stone-50 space-y-2">
        <Link
          href={ROUTES.settings}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
            pathname.startsWith(ROUTES.settings)
              ? "bg-stone-100 text-stone-900 font-medium"
              : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
          )}
        >
          {user?.photoURL ? (
            <div className="w-[18px] h-[18px] rounded-full overflow-hidden relative">
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <User
              size={18}
              className={cn(
                "transition-colors",
                pathname.startsWith(ROUTES.settings)
                  ? "text-primary"
                  : "text-stone-400 group-hover:text-stone-600",
              )}
            />
          )}
          <span className="text-sm">Minha Conta</span>
        </Link>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};
