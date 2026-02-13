"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Settings,
  LogOut,
  Globe,
  Home,
  X,
  FileText,
  Users,
  Check,
  UserPlus,
  Activity,
  Shield,
  Calendar,
  Trophy,
  ClipboardList,
  Search,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useFounderSettings } from "@/hooks/useSiteSettings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut, user, role } = useAuth(); // Get current user and role
  const { data: founderData } = useFounderSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Fallback photo: use user's photo or founder's photo (if it's Lilian)
  const profilePhoto = user?.photoURL || founderData?.image;

  // Note: Auth checking is now done Server-Side in layout.tsx.
  // UseClient is only for UI state (Sidebar, Animations).

  const isLoginPage = pathname?.startsWith("/admin/login");

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
    { icon: Shield, label: "Usuários & Permissões", path: "/admin/users" },
    { icon: UserPlus, label: "Interessados", path: "/admin/applications" },
    { icon: BookOpen, label: "Cursos", path: "/admin/courses" },
    { icon: Check, label: "Aprovações", path: "/admin/approvals" },
    {
      icon: FileText,
      label: "Avaliações (Provas)",
      path: "/admin/assessments",
    },
    {
      icon: ClipboardList,
      label: "Correções (Provas)",
      path: "/admin/assessments/submissions",
    },
    { icon: Calendar, label: "Eventos Ao Vivo", path: "/admin/events" },
    { icon: Users, label: "Alunos & Matrículas", path: "/admin/enrollments" },
    { icon: Trophy, label: "Gamificação", path: "/admin/gamification" },
    { icon: Globe, label: "Google Suite", path: "/admin/google" },
    { icon: PenTool, label: "Diário Visual", path: "/admin/blog" },
    { icon: BookOpen, label: "Galeria", path: "/admin/gallery" },
    { icon: FileText, label: "Documentos", path: "/admin/public-docs" },
    { icon: Activity, label: "Logs de Sistema", path: "/admin/logs" },
    { icon: Settings, label: "Utilidades (Dev)", path: "/admin/utilities" },
    { icon: Settings, label: "Configurações", path: "/admin/settings" },
  ];

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navItems.slice(0, 6);
    return navItems
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const goTo = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  return (
    <PageShell
      variant="admin"
      className="flex min-h-screen selection:bg-gold/20"
    >
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl transition-transform active:scale-90"
      >
        {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
                w-80 bg-white/60 backdrop-blur-2xl border-r border-stone-200/60 flex flex-col fixed h-full z-40 transition-all duration-500
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
      >
        <div className="p-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/assets/logo.jpeg"
                alt="Logo"
                fill
                className="rounded-full object-cover border border-primary/10"
                sizes="40px"
              />
            </div>
            <h1 className="font-serif text-2xl text-primary tracking-tight">
              Figura <span className="font-light text-gold italic">Viva</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-stone-400">
              Admin Panel v2.0
            </span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-2"
                    : "text-stone-500 hover:text-primary hover:bg-stone-100/80 hover:translate-x-1"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-transform duration-300 ${isActive ? "text-gold-light" : "group-hover:scale-110 group-hover:text-gold"}`}
                />
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-80"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-stone-200/60 space-y-3 bg-white/40">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-stone-200 text-stone-600 hover:border-gold hover:text-gold rounded-xl transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] group shadow-sm hover:shadow-md"
          >
            <Home
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Ir para o Site
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-xl transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] group"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Sair
          </button>

          <p className="text-center text-[9px] text-stone-300 font-bold tracking-widest pt-2 opacity-60">
            © 2024 INSTITUTO FIGURA VIVA
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-4 md:p-6 lg:p-8 min-h-screen relative overflow-y-auto custom-scrollbar">
        {/* Sticky Mobile Tracker/Header background */}
        <div className="lg:hidden sticky top-0 z-30 bg-paper/80 backdrop-blur-md -mx-4 px-4 py-2 mb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.jpeg"
              alt="Logo"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-xs font-serif font-bold text-primary italic">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[8px] font-bold text-primary">
              {user?.displayName?.[0] || "L"}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto animate-fade-in-up">
          <Breadcrumbs />
          <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <h2 className="font-serif text-xl md:text-2xl text-primary mb-0.5 tracking-tight">
                  Painel de Controle
                </h2>
                <p className="text-stone-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em]">
                  Gestão Institucional
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="relative flex-1 md:flex-none md:w-64">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-xl">
                  <Search size={14} className="text-stone-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                    placeholder="Pesquisar..."
                    className="w-full bg-transparent text-xs text-stone-700 outline-none placeholder:text-stone-400"
                  />
                </div>

                {searchOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-stone-100 rounded-xl shadow-lg overflow-hidden z-30">
                    {suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => goTo(item.path)}
                          className="w-full px-3 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <ArrowRight size={12} className="text-stone-400" />
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-[10px] text-stone-500">
                        Nenhuma seção encontrada.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1 pr-1.5 rounded-full border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-xs font-bold text-primary leading-tight">
                      {user?.displayName || "Lilian"}
                    </span>
                    <span className="text-[9px] text-stone-400 font-medium leading-tight">
                      {user?.email}
                    </span>
                  </div>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-100 shadow-inner bg-stone-100 flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold text-[10px]">
                        {user?.displayName?.[0] || "L"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-4 w-px bg-stone-200 mx-0.5" />

                <Link
                  href="/admin/settings"
                  title="Configurações"
                  className="w-8 h-8 rounded-full bg-white hover:bg-gold/10 transition-all flex items-center justify-center text-stone-400 hover:text-gold shadow-sm group"
                >
                  <Settings
                    size={14}
                    className="group-hover:rotate-45 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </header>

          {children}
        </div>
      </main>
    </PageShell>
  );
}
