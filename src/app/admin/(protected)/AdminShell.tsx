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
  LogOut,
  Home,
  X,
  Search,
  ArrowRight,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useFounderSettings } from "@/hooks/useSiteSettings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  ADMIN_NAVIGATION_GROUPS,
  isAdminRouteActive,
} from "@/config/admin-navigation";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const navItems = ADMIN_NAVIGATION_GROUPS.flatMap((group) => group.items);

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
      className="fv-admin flex min-h-screen selection:bg-gold/20"
    >
      {/* Sidebar */}
      <aside
        className={`
                fixed z-40 flex h-full w-72 flex-col border-r border-border bg-areia transition-[width,transform] duration-200
                ${isSidebarCollapsed ? "lg:w-20" : "lg:w-72"}
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
      >
        <div className="p-5">
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
            <h1 className={`font-serif text-xl text-primary tracking-tight ${isSidebarCollapsed ? "lg:hidden" : ""}`}>
              Figura <span className="font-light text-gold italic">Viva</span>
            </h1>
          </div>
          <button onClick={() => setIsSidebarCollapsed((value) => !value)} className="hidden lg:grid h-8 w-8 place-items-center rounded-md text-stone-500 hover:bg-stone-100" aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}>{isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-stone-400">
              Admin Panel v2.0
            </span>
          </div>
        </div>

        <nav
          className="flex-1 min-h-0 pb-4 px-3 space-y-1 overflow-y-auto"
          data-lenis-prevent
        >
          {ADMIN_NAVIGATION_GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className={`px-3 pb-1 pt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 ${isSidebarCollapsed ? "lg:hidden" : ""}`}>
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const isActive = isAdminRouteActive(pathname, item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-stone-500 hover:text-primary hover:bg-stone-100/80"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`transition-transform duration-300 ${isActive ? "text-gold-light" : "group-hover:scale-110 group-hover:text-gold"}`}
                      />
                      <span
                        className={`text-[11px] font-bold uppercase tracking-widest ${isSidebarCollapsed ? "lg:hidden" : ""} ${isActive ? "opacity-100" : "opacity-80"}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="space-y-3 border-t border-border p-6">
          <Link
            href="/"
            className="group flex w-full items-center justify-center gap-3 rounded-md border border-border bg-paper px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-text transition-colors hover:border-igarape hover:text-primary"
          >
            <Home
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Ir para o Site
          </Link>

          <button
            onClick={() => signOut()}
            className="group flex w-full items-center justify-center gap-3 rounded-md px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:bg-error/10 hover:text-error"
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
            className="fixed inset-0 z-30 bg-text/45 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`panel-surface flex-1 p-4 md:p-6 lg:p-7 min-h-screen relative ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
      >
        {/* Sticky Mobile Tracker/Header background */}
        <div className="lg:hidden sticky top-0 z-30 bg-paper/80 backdrop-blur-md -mx-4 px-4 py-2 mb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
              className="p-1.5 -ml-1.5 text-stone-500 hover:bg-stone-100 rounded-lg active:scale-95 transition-transform"
            >
              {isSidebarOpen ? <X size={20} /> : <LayoutDashboard size={20} />}
            </button>
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
          <header className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
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
                <div className="flex items-center gap-2 rounded-md border border-border bg-paper px-3 py-1.5">
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
                  <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-md border border-border bg-paper">
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
