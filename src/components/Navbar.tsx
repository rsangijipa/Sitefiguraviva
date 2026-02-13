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
    <nav
      aria-label="Navegação principal"
      className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg py-3"
          : "bg-white/60 backdrop-blur-md shadow-sm py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
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

        {/* Desktop Menu (only on wide screens to avoid tablet clipping) */}
        <div className="hidden xl:flex items-center gap-1 font-sans text-[11px] 2xl:text-xs font-bold tracking-[0.18em] uppercase text-text/80">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-primary transition-all duration-200 hover:bg-primary/5 px-4 py-2 rounded-xl min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.display || item.label}
            </a>
          ))}

          <div className="h-6 w-[1px] bg-gray-200 mx-2" />

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
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
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
              className="shadow-sm ml-2"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-primary/20 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-4 right-4 bottom-4 left-4 z-[70] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white flex flex-col overflow-hidden xl:hidden"
            >
              {/* Mobile Header Inside Menu */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100">
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
                  className="w-10 h-10 flex items-center justify-center text-primary rounded-full bg-stone-50 hover:bg-stone-100 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
                <div className="space-y-1 mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/30 px-4 mb-4 block">
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
                      className="flex items-center justify-between w-full px-6 py-4 rounded-2xl hover:bg-primary/5 active:bg-primary/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-gold group-hover:text-white transition-all">
                          <item.icon size={18} />
                        </div>
                        <span className="text-xl font-serif text-primary">
                          {item.display || item.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-stone-300 group-hover:text-gold group-hover:translate-x-1 transition-all"
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
                      className="flex items-center gap-3 text-stone-400 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <Instagram size={14} />
                      </div>
                      Siga o Instituto
                    </a>
                  </div>

                  <div className="p-1 bg-stone-50 rounded-[2rem] border border-stone-100">
                    {user ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-6 py-4">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10">
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
                            <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
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
                            "w-full py-5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-[1.8rem] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                            role === "admin"
                              ? "bg-white border border-gold text-gold shadow-gold/5"
                              : "bg-primary text-white shadow-primary/20",
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
                          className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
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
                        className="w-full py-6 text-[11px] font-bold uppercase tracking-[0.2em] bg-primary text-white rounded-[1.8rem] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <UserIcon size={14} />
                        Acessar Plataforma
                      </button>
                    )}
                  </div>

                  <p className="text-center text-[9px] text-stone-300 font-bold tracking-[0.3em] uppercase pb-2">
                    © 2024 Figura Viva
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
