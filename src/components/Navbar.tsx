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
    { label: "Instituto", href: "/#instituto-sobre" },
    { label: "Fundadora", href: "/#fundadora" },
    { label: "Formações", href: "/#instituto", display: "Formações e Grupos" },
    { label: "Biblioteca", href: "/public-library" },
    { label: "Galeria", href: "/public-gallery" },
    { label: "Blog", href: "/#blog" },
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 font-sans text-[10px] lg:text-xs font-bold tracking-[0.2em] uppercase text-text/80">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-primary transition-colors hover:bg-black/5 px-3 py-2 rounded-lg min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary"
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-primary w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary"
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
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden"
          >
            {/* Mobile Header Inside Menu */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-stone-100">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/assets/logo.jpeg"
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-lg font-serif text-primary font-bold">
                  Figura <span className="italic text-gold">Viva</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-primary rounded-full bg-stone-50"
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30 mb-4 px-4">
                Navegação
              </span>
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-6 py-4 rounded-2xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-2xl font-serif text-primary border border-transparent active:border-primary/10"
                >
                  {item.display || item.label}
                </motion.a>
              ))}

              <div className="h-px bg-stone-100 my-8 mx-4" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary font-bold">
                        {user.displayName?.[0] || <UserIcon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary truncate">
                          {user.displayName || "Usuário"}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setMobileOpen(false);
                        handleDashboard();
                      }}
                      variant={role === "admin" ? "outline" : "primary"}
                      className={cn(
                        "w-full py-6 text-sm uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all",
                        role === "admin"
                          ? "border-gold text-gold shadow-gold/5"
                          : "shadow-primary/10",
                      )}
                    >
                      <LayoutDashboard size={18} />
                      {role === "admin" ? "Administração" : "Área do Aluno"}
                    </Button>

                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Sair da Conta
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogin();
                    }}
                    className="w-full py-6 text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10"
                  >
                    Entrar na Plataforma
                  </Button>
                )}

                <p className="text-center text-[10px] text-stone-300 font-bold tracking-widest uppercase py-4">
                  © 2024 INSTITUTO FIGURA VIVA
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
