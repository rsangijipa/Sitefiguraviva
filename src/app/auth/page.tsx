"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCourses } from "@/hooks/useContent";
import { Input } from "@/components/ui/Input";
import PageShell from "@/components/ui/PageShell";
import { signInWithGoogle } from "@/lib/firebase/client";
import { ensureUserProfileAction } from "@/app/actions/auth";
import { getRedirectPathForRole } from "@/lib/auth/authService";

// Error mapping
const getFriendlyErrorMessage = (code: string) => {
  switch (code) {
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso.";
    case "auth/weak-password":
      return "A senha é muito fraca.";
    case "auth/popup-closed-by-user":
      return "Login com Google cancelado.";
    case "auth/cancelled-popup-request":
      return null; // Ignore overlap
    case "auth/account-exists-with-different-credential":
      return "Conta já existe com outro método de login.";
    default:
      return "Ocorreu um erro. Tente novamente.";
  }
};

function AuthContent() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Helper hook for content (if used)
  const { data: courses = [] } = useCourses();

  const mode = searchParams.get("mode");
  const next = searchParams.get("next") || "";
  const intent = searchParams.get("intent");
  const courseId = searchParams.get("courseId");

  // 1. Initial State
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2. Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courseId || "");

  // Toggle Mode
  useEffect(() => {
    setIsSignup(mode === "signup");
    setError("");
  }, [mode]);

  const handleSuccess = async (user: any) => {
    try {
      // A. Sync Profile
      const token = await user.getIdToken();
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      // B. Enforce Profile Sync (SSoT)
      const syncResult = await ensureUserProfileAction();
      if (!syncResult.success) {
        console.error("Profile Sync Failed:", syncResult.error);
      }

      // Get role from sync result or default
      const userRole = syncResult.user?.role || "student";

      // D. Redirect Logic
      // Priority 1: Use role-based redirect as default
      let targetPath = getRedirectPathForRole(userRole);

      // Priority 2: If we have an explicit 'next' param (not the default /portal), check if it's safe
      const hasExplicitNext = searchParams.has("next") && next !== "/portal";
      if (hasExplicitNext && next.startsWith("/") && !next.startsWith("//")) {
        // Security: Only admin can go to /admin
        if (next.startsWith("/admin") && userRole !== "admin") {
          console.warn(
            `Redirect blocked: User ${user.uid} (role: ${userRole}) tried to access ${next}`,
          );
          // Keep role-based targetPath
        } else {
          targetPath = next;
        }
      }

      router.push(targetPath);
    } catch (err) {
      console.error("Post-Auth Error", err);
      setError("Erro ao finalizar autenticação.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;
      if (isSignup) {
        userCredential = await signUp(email, password);
        // Update basic profile logic if needed (e.g. displayName)
      } else {
        userCredential = await signIn(email, password);
      }
      await handleSuccess(userCredential.user);
    } catch (err: any) {
      console.error(err);
      const msg = getFriendlyErrorMessage(err.code);
      if (msg) setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    const { user, error: googleError } = await signInWithGoogle();

    if (googleError) {
      const msg = getFriendlyErrorMessage(googleError) || googleError;
      if (msg) setError(msg);
      setLoading(false);
      return;
    }

    if (user) {
      await handleSuccess(user);
    } else {
      setLoading(false);
    }
  };

  return (
    <PageShell variant="auth" className="p-4 md:p-8 min-h-screen">
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ArrowRight className="rotate-180" size={16} /> Voltar ao Início
      </Link>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/auth-bg.jpg"
          alt="Background"
          fill
          className="object-cover blur-[3px] opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
      </div>

      <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-[480px] relative z-10 border border-white/60"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center p-1 border border-primary/10 bg-white shadow-soft-md">
              <img
                src="/assets/logo.jpeg"
                alt="Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h1 className="font-serif text-3xl text-primary font-bold mb-1">
              {isSignup ? "Criar Conta" : "Bem-vindo(a)"}
            </h1>
            <p className="text-stone-500 text-xs uppercase tracking-widest font-semibold">
              Instituto Figura Viva
            </p>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-700 font-bold py-3.5 rounded-xl hover:bg-stone-50 transition-all shadow-sm active:scale-[0.98] mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400">Ou</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input
                    id="full-name"
                    name="name"
                    label="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <Input
                    id="phone"
                    name="phone"
                    label="Telefone (WhatsApp)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                  />
                  {courses.length > 0 && (
                    <div className="space-y-1">
                      <label
                        htmlFor="course-interest"
                        className="text-[10px] uppercase font-bold text-stone-500 ml-1"
                      >
                        Interesse
                      </label>
                      <div className="relative">
                        <select
                          id="course-interest"
                          name="course-interest"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                        >
                          <option value="">Selecione um curso...</option>
                          {courses.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="email"
              name="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-1">
              <Input
                id="password"
                name="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              {!isSignup && (
                <div className="text-right">
                  <Link
                    href="/auth/reset-password"
                    className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isSignup ? (
                "Criar Conta"
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-stone-100 pt-6">
            <button
              onClick={() =>
                router.push(isSignup ? "/auth" : "/auth?mode=signup")
              }
              className="text-stone-500 hover:text-primary transition-colors text-sm"
            >
              {isSignup ? (
                <>
                  Já tem conta?{" "}
                  <span className="font-bold underline">Faça Login</span>
                </>
              ) : (
                <>
                  Não tem conta?{" "}
                  <span className="font-bold underline">Cadastre-se</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/admin"
              className="text-[10px] text-stone-400/50 hover:text-stone-500 transition-all uppercase tracking-widest font-medium"
            >
              Admin
            </Link>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
