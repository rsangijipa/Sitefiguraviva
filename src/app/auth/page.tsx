"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCourses } from "@/hooks/useContent";
import { Input } from "@/components/ui/Input";
import PageShell from "@/components/ui/PageShell";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { ensureUserProfileAction } from "@/app/actions/auth";
import { registerForCourseAction } from "@/app/actions/signup";
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
  const { signIn, user } = useAuth();
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
  const completedOAuthRedirect = useRef(false);

  // Toggle Mode
  useEffect(() => {
    setIsSignup(mode === "signup");
    setError("");
  }, [mode]);

  const handleSuccess = async (user: any, preferredPath?: string) => {
    try {
      // The httpOnly session cookie is already synced by this point: signIn()
      // (email/password) and finishGoogleSignIn() (OAuth) both await the
      // Supabase-token POST to /api/auth/login before calling handleSuccess.
      // Enforce Profile Sync (SSoT)
      const syncResult = await ensureUserProfileAction();
      if (!syncResult.success) {
        console.error("Profile Sync Failed:", syncResult.error);
      }

      // Get role from sync result or default
      const userRole = syncResult.user?.role || "student";

      // D. Redirect Logic
      // Priority 0: Continue the enrollment the account was created for.
      if (preferredPath) {
        router.push(preferredPath);
        return;
      }

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

  useEffect(() => {
    if (
      searchParams.get("oauth") !== "google" ||
      !user ||
      completedOAuthRedirect.current
    ) {
      return;
    }

    completedOAuthRedirect.current = true;

    const finishGoogleSignIn = async () => {
      setLoading(true);
      try {
        // OAuth returns to the browser with a Supabase session, but server
        // actions need its httpOnly mirror before we create/sync the profile.
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Sessão Google não encontrada.");
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.access_token }),
        });

        if (!response.ok) {
          throw new Error("Não foi possível concluir a autenticação.");
        }

        await handleSuccess(
          user,
          isSignup && selectedCourse
            ? `/inscricao/${selectedCourse}`
            : undefined,
        );
      } catch (err) {
        console.error("Google sign-in completion failed", err);
        setError("Não foi possível concluir a autenticação com Google.");
        setLoading(false);
      }
    };

    void finishGoogleSignIn();
  }, [isSignup, searchParams, selectedCourse, user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // Accounts are created server-side and only in the context of a
        // course, so name/phone are persisted and the request is rate limited.
        const result = await registerForCourseAction({
          fullName,
          phone,
          email,
          password,
          courseId: selectedCourse,
        });

        if (!result.success) {
          setError(result.error || "Não foi possível concluir o cadastro.");
          setLoading(false);
          return;
        }

        const credential = await signIn(email, password);
        await handleSuccess(
          credential.user,
          `/inscricao/${result.courseId || selectedCourse}`,
        );
        return;
      }

      const userCredential = await signIn(email, password);
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

    // Same rule as the e-mail form: new accounts exist because of a course.
    if (isSignup && !selectedCourse) {
      setError("Selecione o curso que deseja cursar para criar sua conta.");
      return;
    }

    setLoading(true);
    const callbackUrl = new URL("/auth", window.location.origin);
    callbackUrl.searchParams.set("oauth", "google");
    if (isSignup) {
      callbackUrl.searchParams.set("mode", "signup");
      callbackUrl.searchParams.set("courseId", selectedCourse);
    }
    if (next.startsWith("/") && !next.startsWith("//")) {
      callbackUrl.searchParams.set("next", next);
    }

    const supabase = createSupabaseBrowserClient();
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: { prompt: "select_account" },
      },
    });

    if (googleError) {
      const msg =
        getFriendlyErrorMessage(googleError.code) || googleError.message;
      if (msg) setError(msg);
      setLoading(false);
    }
  };

  return (
    <PageShell variant="auth" className="p-4 md:p-8 min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 z-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text/70 transition-colors hover:text-primary"
      >
        <ArrowRight className="rotate-180" size={16} /> Voltar ao Início
      </Link>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-12 py-20 lg:grid-cols-[1fr_480px] lg:gap-20">
        {/* Coluna editorial. Vem depois do formulario na ordem do documento,
            para que no telefone o campo de e-mail seja a primeira coisa sob o
            polegar; no desktop `lg:order-first` a devolve para a esquerda. */}
        <aside className="fv-bg fv-bg-login hidden rounded-md lg:order-first lg:block lg:p-12">
          <span className="fv-eyebrow mb-6">Instituto Figura Viva</span>
          <p className="font-serif text-4xl font-semibold leading-[1.15] text-primary xl:text-5xl">
            Um espaço de estudo dedicado à profundidade da relação.
          </p>
          <p className="fv-lead mt-8">
            Sua área de aluno reúne as formações em andamento, o material de
            cada encontro, os certificados e a comunidade do Instituto.
          </p>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full rounded-md border border-border bg-paper p-8 md:p-12"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-paper p-1">
              <img
                src="/assets/logo.jpeg"
                alt="Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h1 className="font-serif text-3xl text-primary font-bold mb-1">
              {isSignup ? "Criar Conta" : "Bem-vindo(a)"}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-text/70">
              Instituto Figura Viva
            </p>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-md border border-border bg-paper py-3.5 font-bold text-text transition-colors hover:border-igarape hover:bg-areia active:scale-[0.98]"
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
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper px-2 text-muted">Ou</span>
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
                  <div className="space-y-1">
                    <label
                      htmlFor="course-interest"
                      className="ml-1 text-[10px] font-bold uppercase text-text/80"
                    >
                      Curso desejado
                    </label>
                    {courses.length > 0 ? (
                      <>
                        <div className="relative">
                          <select
                            id="course-interest"
                            name="course-interest"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                            className="h-12 w-full appearance-none rounded-md border border-border bg-paper px-4 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                          />
                        </div>
                        <p className="ml-1 pt-1 text-[10px] text-muted">
                          A conta é criada junto com a sua inscrição no curso.
                        </p>
                      </>
                    ) : (
                      <p className="rounded-md border border-border bg-areia p-3 text-xs text-text/80">
                        Não há turmas abertas no momento. Assim que uma nova
                        turma for anunciada, a inscrição ficará disponível aqui.
                      </p>
                    )}
                  </div>
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
                    className="text-[10px] font-bold uppercase text-primary underline-offset-4 hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-terra/40 bg-terra/5 p-3 text-center text-xs font-medium text-terra"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignup && !selectedCourse)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mt-8 border-t border-border/70 pt-6 text-center">
            <button
              onClick={() =>
                router.push(isSignup ? "/auth" : "/auth?mode=signup")
              }
              className="text-sm text-text/80 transition-colors hover:text-primary"
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
              className="text-[10px] font-medium uppercase tracking-widest text-muted transition-colors hover:text-text"
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
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
