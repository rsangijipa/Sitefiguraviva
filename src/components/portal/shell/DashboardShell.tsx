import { SidebarNav } from "./SidebarNav";
import { Menu, Search, ArrowRight } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import NotificationBell from "@/components/layout/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

import { UserXPBadge } from "@/components/gamification/UserXPBadge";

const QUICK_LINKS = [
  { label: "Visão Geral", href: ROUTES.portal, keywords: ["home", "inicio"] },
  {
    label: "Meus Cursos",
    href: ROUTES.courses,
    keywords: ["curso", "aula", "conteudo"],
  },
  {
    label: "Certificados",
    href: ROUTES.certificates,
    keywords: ["certificado", "conclusao"],
  },
  {
    label: "Comunidade",
    href: ROUTES.community,
    keywords: ["forum", "discussao"],
  },
  {
    label: "Materiais",
    href: ROUTES.materials,
    keywords: ["pdf", "arquivo", "material"],
  },
  {
    label: "Agenda Ao Vivo",
    href: ROUTES.events,
    keywords: ["evento", "aovivo", "mentoria"],
  },
  {
    label: "Minha Conta",
    href: ROUTES.settings,
    keywords: ["perfil", "configuracao", "senha"],
  },
];

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return QUICK_LINKS.slice(0, 5);

    return QUICK_LINKS.filter((item) => {
      const haystack = `${item.label} ${item.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 6);
  }, [searchQuery]);

  const goTo = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      goTo(suggestions[0].href);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex font-sans">
      {/* Desktop Sidebar */}
      <SidebarNav className="hidden lg:flex shrink-0 z-30" />

      {/* Mobile Sidebar Overlay with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 lg:hidden shadow-2xl"
            >
              <SidebarNav className="h-full w-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-stone-500 hover:bg-stone-50 rounded-lg active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            {/* Search Bar */}
            <div className="hidden md:block relative w-72">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all"
              >
                <Search size={16} className="text-stone-400" />
                <label htmlFor="global-search" className="sr-only">
                  Buscar no portal
                </label>
                <input
                  id="global-search"
                  name="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                  placeholder="Buscar página..."
                  className="bg-transparent border-none outline-none text-sm placeholder:text-stone-400 w-full text-stone-700"
                />
              </form>

              {searchOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border border-stone-100 rounded-xl shadow-lg overflow-hidden z-30">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => goTo(item.href)}
                        className="w-full px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <ArrowRight size={14} className="text-stone-400" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-stone-500">
                      Nenhum resultado para essa busca.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserXPBadge />
            <NotificationBell />

            {/* Avatar / User Dropdown Placeholder */}
            <div className="w-8 h-8 bg-stone-100 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-stone-500 border border-stone-200">
              FV
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
