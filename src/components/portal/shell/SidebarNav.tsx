import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MessageSquare,
  Award,
  FileText,
  LifeBuoy,
  User,
  LogOut,
  ShieldAlert,
  Flame,
  Star,
  Headphones,
  Compass,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/lib/routes";
import { gamificationService } from "@/services/gamificationService";
import type { ClientGamificationProfile } from "@/services/gamificationService";
import { motion } from "framer-motion";

const UserGamificationSummary = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientGamificationProfile | null>(
    null,
  );

  useEffect(() => {
    if (user?.uid) {
      gamificationService.getProfile(user.uid).then(setProfile);
    }
  }, [user?.uid]);

  if (!profile) return null;

  // XP Progress toward next level
  const xpInCurrentLevel = profile.totalXp % 500;
  const progressPercent = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="px-4 py-3 bg-stone-50 rounded-xl mb-6 border border-stone-100 mx-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Star size={10} className="text-primary fill-primary" />
          </div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
            Nível {profile.level}
          </span>
        </div>
        <span className="text-xs font-bold text-primary">
          {profile.totalXp} XP
        </span>
      </div>
      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-primary"
        />
      </div>
      {profile.currentStreak > 0 && (
        <div className="flex items-center gap-1.5 mt-2.5 text-orange-600">
          <Flame size={12} fill="currentColor" className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {profile.currentStreak} dias ativos
          </span>
        </div>
      )}
    </div>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ComponentType<any>;
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
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "portal-nav-item flex min-h-12 items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group relative touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      isActive
        ? "bg-emerald-100 text-emerald-950 font-semibold"
        : isHighlight
          ? "text-gold hover:bg-gold/5"
          : "text-stone-700 hover:bg-emerald-50 hover:text-emerald-950",
    )}
  >
    <Icon
      size={21}
      aria-hidden="true"
      className={cn(
        "transition-colors",
        isActive
          ? "text-primary"
          : isHighlight
            ? "text-gold"
            : "text-stone-400 group-hover:text-stone-600",
      )}
    />
    <span className="text-base leading-snug">{label}</span>
    {isHighlight && (
      <span className="absolute right-3 w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(180,147,75,0.8)]" />
    )}
  </Link>
);

export const SidebarNav = ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) => {
  const [closed,setClosed]=useState<string[]>([]);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();

  const groups = [
    { label:"Formação", items:[
      {label:"Meus Cursos",icon:BookOpen,href:ROUTES.courses},
      {label:"Certificados",icon:Award,href:ROUTES.certificates},
      {label:"Comunidade",icon:MessageSquare,href:ROUTES.community},
      {label:"Materiais",icon:FileText,href:ROUTES.materials},
      {label:"Ao Vivo",icon:Calendar,href:ROUTES.events},
    ]},
    { label:"Práticas e recursos",items:[
      {label:"Recursos",icon:Compass,href:"/portal/recursos"},
      {label:"Meditação e áudio",icon:Headphones,href:ROUTES.audio},
      {label:"Meus registros",icon:FileText,href:"/portal/recursos/meus-registros"},
    ]},
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
    if (href === ROUTES.courses && pathname.startsWith("/portal/course/")) return true;
    if (href === "/portal/recursos" && pathname.startsWith("/portal/recursos/meus-registros")) return false;
    if (href !== ROUTES.portal && (pathname === href || pathname.startsWith(`${href}/`))) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "portal-sidebar w-72 border-r border-emerald-100 bg-white h-dvh flex flex-col sticky top-0",
        className,
      )}
    >
      <div className="min-h-20 flex flex-col justify-center items-start px-6 border-b border-emerald-100 bg-emerald-50/60">
        <span className="font-serif text-xl font-bold text-stone-900">
          Figura Viva
        </span>
        <span className="mt-1 text-xs font-semibold tracking-wide text-emerald-700">Área do aluno</span>
      </div>

      <UserGamificationSummary />

      {/* Nav Items */}
      <nav
        aria-label="Navegação do aluno"
        className="flex-1 min-h-0 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar"
        data-lenis-prevent
      >
        <div onClick={onNavigate}><NavItem href={ROUTES.portal} icon={LayoutDashboard} label="Visão Geral" isActive={isPathActive(ROUTES.portal)}/></div>
        {groups.map((group,index)=><section key={group.label} className="pt-4"><h2><button type="button" aria-expanded={!closed.includes(group.label)} aria-controls={`portal-nav-${index}`} onClick={()=>setClosed(values=>values.includes(group.label) ? values.filter(value=>value!==group.label) : [...values,group.label])} className="flex w-full min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm font-bold tracking-wide text-emerald-800 hover:bg-stone-50">{group.label}<ChevronDown size={16} className={closed.includes(group.label) ? "-rotate-90" : ""}/></button></h2><div id={`portal-nav-${index}`} hidden={closed.includes(group.label)} onClick={onNavigate}>{group.items.map(item=><NavItem key={item.href} {...item} isActive={isPathActive(item.href)}/>)}</div></section>)}

        {role === "admin" && (
          <div className="pt-4 mt-4 border-t border-stone-100">
            <NavItem {...adminItem} isActive={pathname.startsWith("/admin")} />
          </div>
        )}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-stone-50 space-y-2 shrink-0">
        <div onClick={onNavigate}><NavItem href={ROUTES.support} icon={LifeBuoy} label="Ajuda e suporte" isActive={isPathActive(ROUTES.support)} /></div>
        <Link
          href={ROUTES.settings}
          onClick={onNavigate}
          aria-current={isPathActive(ROUTES.settings) ? "page" : undefined}
          className={cn(
            "flex min-h-12 items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group touch-manipulation",
            pathname.startsWith(ROUTES.settings)
              ? "bg-emerald-100 text-emerald-950 font-semibold"
              : "text-stone-700 hover:bg-emerald-50 hover:text-emerald-950",
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
          <span className="text-base font-semibold">Minha Conta</span>
        </Link>

        <button
          onClick={() =>
            void signOut().catch((error) =>
              addToast(
                error instanceof Error
                  ? error.message
                  : "Não foi possível sair. Tente novamente.",
                "error",
              ),
            )
          }
          className="w-full flex min-h-12 items-center gap-3 px-3 py-3 rounded-xl text-stone-700 touch-manipulation hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-base">Sair</span>
        </button>
      </div>
    </aside>
  );
};
