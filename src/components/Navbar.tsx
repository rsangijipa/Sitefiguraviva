"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  User as UserIcon,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  PenTool,
  Award,
  Users,
  Heart,
  Instagram,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_ITEMS } from "@/features/public-site/content/navigation";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const NAV_ICONS: Record<string, LucideIcon> = {
  Instituto: Users,
  "Laura Perls": Heart,
  Formações: Award,
  Recursos: Sparkles,
  Biblioteca: BookOpen,
  Galeria: ImageIcon,
  Blog: PenTool,
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Contador global de locks — evita que o fechamento do menu libere o
  // scroll enquanto um modal de recurso ainda estiver aberto.
  useBodyScrollLock(mobileOpen);

  // Focus trap + devolução de foco ao gatilho ao fechar.
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(mobileOpen);

  // Fecha o menu com Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Fecha o menu ao navegar para outra rota.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detect if scrolled past threshold
      setScrolled(currentScrollY > 10);

      // Smart hide/show based on scroll direction
      // Only hide after scrolling down 100px
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide navbar
          setHidden(true);
        } else {
          // Scrolling up - show navbar
          setHidden(false);
        }
      } else {
        // Always show when near top
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = PUBLIC_NAV_ITEMS.map((item) => ({
    ...item,
    icon: NAV_ICONS[item.label] || ChevronRight,
  }));

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className={cn(
          // Faixa inteira, sempre no topo. A pílula flutuante que existia aqui
          // era um objeto de aplicativo: recortava o cabeçalho do papel e
          // trocava o traço Névoa por uma sombra. O cabeçalho institucional do
          // Design System é horizontal, apoiado no Creme e separado por linha.
          "fixed top-0 left-0 w-full z-50 border-b transition-all duration-500 ease-in-out",
          "bg-paper/90 backdrop-blur-md border-border/70 supports-[backdrop-filter]:bg-paper/75",
          hidden ? "-translate-y-full" : "translate-y-0",
          // Único efeito de rolagem: a faixa se contrai. Sem troca de forma.
          scrolled ? "py-3" : "py-5",
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            aria-label="Ir para a página inicial"
          >
            <div className="relative w-10 h-10 overflow-hidden">
              <Image
                src="/assets/logo.jpeg"
                alt="Logo Instituto Figura Viva"
                fill
                className="rounded-full object-cover border border-primary/10"
                sizes="40px"
                priority
                fetchPriority="high"
              />
            </div>
            <span className="text-xl font-serif text-primary tracking-tight font-bold">
              Figura <span className="font-light text-gold italic">Viva</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-1 font-sans text-[11px] 2xl:text-xs font-bold tracking-[0.18em] uppercase text-text/80">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-primary transition-colors duration-200 hover:bg-areia px-4 py-2 rounded-md min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary"
              >
                {item.label}
              </a>
            ))}

            <div className="h-6 w-px bg-border mx-2" />

            <Link
              href="/portal"
              className="ml-2 inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-primary-dark"
            >
              Área do aluno
            </Link>
          </div>

          {/* Mobile/Tablet Toggle */}
          <button
            className="xl:hidden text-primary w-12 h-12 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-fv-areia rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Outside nav to avoid transform coordinate space issues */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[60] bg-mata/80 backdrop-blur-sm xl:hidden dark:bg-black/75"
            aria-hidden="true"
          />
          <div
            className="fixed top-2 right-2 bottom-2 left-2 z-[70] flex flex-col overflow-hidden rounded-[2rem] border border-nevoa bg-paper backdrop-blur-2xl xl:hidden dark:border-border dark:bg-surface"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            ref={mobileMenuRef}
            tabIndex={-1}
          >
            {/* Mobile Header Inside Menu */}
            <div className="flex items-center justify-between border-b border-border/70 px-8 py-6 dark:border-border">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10">
                  <Image
                    src="/assets/logo.jpeg"
                    alt=""
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-serif text-primary font-bold">
                  Figura <span className="italic text-gold">Viva</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-border bg-areia text-primary transition-colors hover:bg-nevoa/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-border dark:hover:bg-surface-raised"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 py-8 flex flex-col"
              data-lenis-prevent
            >
              <div className="space-y-1 mb-8">
                <span className="mb-4 block px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
                  Navegação principal
                </span>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="group flex w-full items-center justify-between rounded-md px-6 py-4 text-primary transition-colors hover:bg-areia active:bg-nevoa dark:hover:bg-surface-raised dark:active:bg-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-areia p-2.5 text-primary transition-colors group-hover:bg-primary-solid group-hover:text-white dark:bg-surface-raised dark:group-hover:bg-primary-solid">
                        <item.icon size={18} />
                      </div>
                      <span className="text-xl font-serif text-primary">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-pedra transition-all group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                {/* Social proof/Links */}
                <div className="px-4 flex items-center justify-between">
                  <a
                    href="https://instagram.com/institutofiguraviva"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted transition-colors hover:text-primary"
                  >
                    <div className="rounded-md bg-areia p-2">
                      <Instagram size={14} />
                    </div>
                    Siga o Instituto
                  </a>
                </div>

                <div className="rounded-md border border-border bg-areia p-1">
                  <Link
                    href="/portal"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
                  >
                    <UserIcon size={14} />
                    Acessar plataforma
                  </Link>
                </div>

                <p className="pb-2 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-muted">
                  &copy; {new Date().getFullYear()} Figura Viva
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
