"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
// import { useApp } from '@/context/AppContext';
import { useToast } from "@/context/ToastContext";
import { ArrowLeft } from "lucide-react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const isAuthenticated = !!user;

  // Auto-redirect to dashboard if authenticated AND admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      router.push("/admin");
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      addToast("Acesso negado: Você não é administrador.", "error");
      // Optionally logout
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    setLoading(true);
    try {
      // 1. Client-side Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();

      // 2. Server-side Session Creation
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        addToast("Login realizado com sucesso!", "success");
        // Force router refresh to ensure cookies are seen by Server Components
        router.refresh();
        router.push("/admin");
      } else {
        addToast("Falha ao criar sessão segura.", "error");
        console.error("Session creation failed");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      addToast(`Falha no login: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden">
      {/* Navigation Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft size={16} /> Voltar ao Início
      </button>

      {/* Artistic background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white/40 backdrop-blur-3xl p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_80px_150px_-30px_rgba(38,58,58,0.15)] w-full max-w-md relative z-10 border border-white/60 text-center mx-4"
      >
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-primary/40 text-[10px] uppercase tracking-widest font-bold">
              Verificando acesso...
            </p>
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-col items-center mb-8 animate-fade-in-up">
            {isAdmin ? (
              <>
                <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center bg-green-100 text-green-600 border border-green-200 shadow-sm">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="font-serif text-2xl text-primary mb-2">
                  Acesso Autorizado
                </h2>
                <p className="text-primary/60 mb-8 text-sm">
                  Você está logado como administrador.
                </p>

                <button
                  onClick={() => router.push("/admin")}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl"
                >
                  Ir para o Painel
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center bg-amber-100 text-amber-600 border border-amber-200 shadow-sm">
                  <span className="text-2xl">!</span>
                </div>
                <h2 className="font-serif text-2xl text-primary mb-2">
                  Acesso Negado
                </h2>
                <p className="text-primary/60 mb-8 text-sm px-4">
                  Você está logado como <strong>{user?.email}</strong>, mas esta
                  conta não tem permissões de administrador.
                </p>

                <div className="space-y-4 w-full">
                  <button
                    onClick={async () => {
                      await signOut();
                    }}
                    className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-red-100 transition-all border border-red-100"
                  >
                    Sair e Trocar de Conta
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full text-primary/40 hover:text-primary py-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Voltar ao Site
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-12">
              <div className="w-24 h-24 rounded-full mb-8 flex items-center justify-center p-1 border border-primary/10 shadow-xl bg-paper overflow-hidden">
                <img
                  src="/assets/logo.jpeg"
                  alt="Instituto Figura Viva"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h1 className="font-serif text-4xl text-primary mb-3">
                Figura <span className="font-light text-gold italic">Viva</span>
              </h1>
              <p className="text-primary/40 text-[10px] uppercase tracking-[0.4em] font-bold">
                Ecossistema Digital
              </p>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-1"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemplo@figuraviva.com"
                    required
                    autoComplete="email"
                    className="w-full bg-white/80 border border-gray-200 p-4 rounded-xl text-primary font-medium focus:ring-2 focus:ring-gold outline-none transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-1"
                  >
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/80 border border-gray-200 p-4 rounded-xl text-primary font-medium focus:ring-2 focus:ring-gold outline-none transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl mt-4 ${loading ? "opacity-50 cursor-wait" : ""}`}
                >
                  {loading ? "Verificando..." : "Acessar Painel"}
                </button>
              </form>

              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="w-8 h-[1px] bg-primary/10" />
                <p className="text-[9px] text-primary/30 uppercase font-bold tracking-[0.3em] leading-relaxed max-w-[200px]">
                  Acesso restrito para administradores.
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
