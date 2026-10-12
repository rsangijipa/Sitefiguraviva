"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { verifyEmailOtpAction } from "@/app/actions/verify-email";
import { resendConfirmationEmailAction } from "@/app/actions/signup";

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash") || "";
  const type = searchParams.get("type") || "email";
  const courseId = searchParams.get("courseId") || "";

  const [status, setStatus] = useState<"idle" | "success" | "error">(
    tokenHash ? "idle" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(
    tokenHash
      ? ""
      : "Link de verificação incompleto. Verifique se copiou o endereço por completo da mensagem recebida.",
  );
  const [isPending, startTransition] = useTransition();

  // Resend state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, startResendTransition] = useTransition();
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const handleVerify = () => {
    if (!tokenHash) return;
    startTransition(async () => {
      const result = await verifyEmailOtpAction(tokenHash, type);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          result.error ||
            "Não foi possível confirmar o e-mail. O link pode ter expirado ou já ter sido utilizado.",
        );
      }
    });
  };

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    startResendTransition(async () => {
      const result = await resendConfirmationEmailAction(resendEmail);
      setResendFeedback(result.message);
    });
  };

  return (
    <PageShell variant="auth" className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-paper p-6 sm:p-10 shadow-sm text-center">
        {/* Brand header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white p-1 shadow-sm">
            <img
              src="/assets/logo.jpeg"
              alt="Instituto Figura Viva"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <span className="fv-eyebrow text-xs uppercase tracking-widest text-primary/80">
            Instituto Figura Viva
          </span>
        </div>

        {/* State 1: Idle - explicit confirmation button */}
        {status === "idle" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                Confirme seu e-mail
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Para garantir a segurança do seu cadastro, confirme a posse do seu
                endereço clicando no botão abaixo.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-areia/40 p-4 text-xs text-stone-600 leading-relaxed text-left">
              <div className="flex items-start gap-2">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <strong className="block font-semibold text-primary">
                    Etapa de segurança
                  </strong>
                  Esta verificação protege sua conta contra acessos indevidos. Após a
                  confirmação, seu cadastro será analisado pela equipe do Instituto.
                </div>
              </div>
            </div>

            <button
              type="button"
              id="confirm-email-button"
              onClick={handleVerify}
              disabled={isPending}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Confirmando seu e-mail…
                </>
              ) : (
                <>
                  Confirmar meu e-mail
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-xs text-stone-400">
              Caso você não tenha solicitado este cadastro, simplesmente desconsidere esta página.
            </p>
          </div>
        )}

        {/* State 2: Success */}
        {status === "success" && (
          <div className="space-y-6" role="status">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                E-mail confirmado com sucesso!
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Seu endereço de e-mail foi confirmado. Seu cadastro agora aguarda a
                aprovação da equipe do Instituto Figura Viva. Você poderá acessar a
                plataforma quando a solicitação for aprovada.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-areia/50 p-4 text-xs text-stone-600 text-left">
              <strong className="block font-semibold text-primary mb-1">
                O que acontece a seguir?
              </strong>
              Nossa equipe de coordenação analisará as informações do cadastro e a
              turma selecionada. Você receberá a liberação para login assim que a
              solicitação for deferida.
            </div>

            <Link
              href={courseId ? `/auth?courseId=${encodeURIComponent(courseId)}` : "/auth"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ir para o login
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* State 3: Error */}
        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terra/10 text-terra border border-terra/20">
              <AlertTriangle size={30} />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                Não foi possível confirmar o e-mail
              </h1>
              <p role="alert" className="text-sm text-stone-600 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-stone-50 p-4 text-xs text-stone-600 text-left space-y-1">
              <p>
                • <strong>Já confirmou antes?</strong> Seu cadastro pode já estar na fila de análise da administração.
              </p>
              <p>
                • <strong>Link expirado?</strong> Solicite um novo link de confirmação abaixo.
              </p>
            </div>

            {!showResend ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowResend(true)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-paper px-4 text-sm font-semibold text-primary transition-colors hover:bg-areia"
                >
                  <Mail size={16} />
                  Solicitar novo link de confirmação
                </button>
                <Link
                  href="/auth"
                  className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-stone-500 hover:text-primary transition-colors"
                >
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-4 text-left">
                <div>
                  <label htmlFor="resend-email" className="block text-xs font-bold text-stone-700 mb-1">
                    Seu endereço de e-mail:
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {resendFeedback && (
                  <p role="status" className="rounded-lg bg-areia p-3 text-xs text-stone-700 font-medium">
                    {resendFeedback}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResend(false)}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-paper text-sm font-semibold text-stone-600 hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resendPending}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {resendPending ? <Loader2 size={16} className="animate-spin" /> : "Reenviar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
