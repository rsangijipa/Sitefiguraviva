"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  PenTool,
  Award,
  Users,
  Instagram,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { getRedirectPathForRole } from "@/lib/auth/authService";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construct safe next URL
  const getCurrentUrl = () => {
    const params = searchParams.toString();
    return `${pathname}${params ? `?${params}` : ""}`;
  };

  const handleLogin = () => {
    const currentUrl = getCurrentUrl();
    // Don't create redirect loops if already on auth page
    if (pathname.startsWith("/auth")) return;

    const nextParam =
      currentUrl === "/" ? "" : `?next=${encodeURIComponent(currentUrl)}`;
    router.push(`/auth${nextParam}`);
  };

  const handleDashboard = () => {
    // If role is not yet loaded, default to portal
    const target = getRedirectPathForRole(role || "student");
    router.push(target);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

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

  const navItems = [
    { label: "Instituto", href: "/#instituto-sobre", icon: Users },
    { label: "Fundadora", href: "/#fundadora", icon: Award },
    {
      label: "Formações",
      href: "/#instituto",
      display: "Formações",
      icon: Sparkles,
    },
    { label: "Biblioteca", href: "/public-library", icon: BookOpen },
    { label: "Galeria", href: "/public-gallery", icon: ImageIcon },
    { label: "Blog", href: "/#blog", icon: PenTool },
  ];

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
                {item.display || item.label}
              </a>
            ))}

            <div className="h-6 w-px bg-border mx-2" />

            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDashboard}
                  variant={role === "admin" ? "outline" : "primary"}
                  size="sm"
                  className={cn(
                    "shadow-sm flex items-center gap-2 transition-all duration-300",
                    role === "admin" &&
                      "border-gold text-gold hover:bg-gold hover:text-white",
                  )}
                >
                  <LayoutDashboard size={14} />
                  {role === "admin" ? "Administração" : "Área do Aluno"}
                </Button>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-muted transition-colors hover:text-error"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                variant="primary"
                size="sm"
                className="ml-2 shadow-none"
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile/Tablet Toggle */}
          <button
            className="xl:hidden text-primary w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary"
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
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-text/45 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-2 right-2 bottom-2 left-2 z-[70] bg-paper/97 backdrop-blur-2xl rounded-md border border-border flex flex-col overflow-hidden xl:hidden"
            >
              {/* Mobile Header Inside Menu */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-border/70">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-areia text-primary transition-colors hover:bg-nevoa"
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
                  {navItems.map((item, idx) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      onClick={() => setMobileOpen(false)}
                      className="group flex w-full items-center justify-between rounded-md px-6 py-4 transition-colors hover:bg-areia active:bg-nevoa"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-areia p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          <item.icon size={18} />
                        </div>
                        <span className="text-xl font-serif text-primary">
                          {item.display || item.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-nevoa transition-all group-hover:translate-x-1 group-hover:text-primary"
                      />
                    </motion.a>
                  ))}
                </div>

                <div className="mt-auto space-y-6">
                  {/* Social proof/Links */}
                  <div className="px-4 flex items-center justify-between">
                    <a
                      href="https://instagram.com/institutofiguraviva"
                      target="_blank"
                      className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted transition-colors hover:text-primary"
                    >
                      <div className="rounded-md bg-areia p-2">
                        <Instagram size={14} />
                      </div>
                      Siga o Instituto
                    </a>
                  </div>

                  <div className="rounded-md border border-border bg-areia p-1">
                    {user ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-6 py-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-paper font-bold text-primary">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.displayName?.[0] || <UserIcon size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-primary truncate">
                              {user.displayName || "Aluno"}
                            </p>
                            <p className="text-[10px] uppercase tracking-tighter text-muted">
                              Matrícula Ativa
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            handleDashboard();
                          }}
                          className={cn(
                            "flex w-full items-center justify-center gap-2 rounded-md py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors active:scale-[0.98]",
                            role === "admin"
                              ? "border border-gold-dark bg-paper text-gold-dark hover:bg-areia"
                              : "bg-primary text-white hover:bg-primary-dark",
                          )}
                        >
                          <LayoutDashboard size={14} />
                          {role === "admin" ? "Administração" : "Área do Aluno"}
                        </button>

                        <button
                          onClick={() => {
                            signOut();
                            setMobileOpen(false);
                          }}
                          className="flex w-full items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-muted transition-colors hover:text-error"
                        >
                          <LogOut size={14} /> Sair da Conta
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogin();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
                      >
                        <UserIcon size={14} />
                        Acessar Plataforma
                      </button>
                    )}
                  </div>

                  <p className="pb-2 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-muted">
                    &copy; {new Date().getFullYear()} Figura Viva
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
