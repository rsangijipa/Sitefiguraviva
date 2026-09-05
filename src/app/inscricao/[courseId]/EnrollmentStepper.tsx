"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, User, Clock } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import {
  createEnrollmentPending,
  generatePixPayload,
} from "@/app/actions/enrollment-pix";
import QRCode from "qrcode";

// --- AUTH HELPER (Robust P0 Fix) ---
const getIdToken = async (): Promise<string> => {
  try {
    const { createSupabaseBrowserClient } =
      await import("@/infrastructure/supabase/client");
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch (e) {
    // Ignore
  }
  return "";
};

export default function EnrollmentStepper({
  courseId,
  initialData,
}: {
  courseId: string;
  initialData: any;
}) {
  const router = useRouter();
  const { addToast } = useToast();

  // Derived Data
  const { course, enrollment, application, uid } = initialData;
  const enrollmentStatus = enrollment?.status;
  const appStatus = application?.status;

  // --- STEP DERIVATION (P0 Fix) ---
  const derivedStep = useMemo(() => {
    if (!uid) return 1;

    // Step 4: Any established enrollment status
    if (
      [
        "pending_approval",
        "active",
        "completed",
        "canceled",
        "refunded",
      ].includes(enrollmentStatus)
    ) {
      return 4;
    }

    // Step 3: Application submitted BUT no enrollment status yet (implies need to pay/finalize)
    // If enrollmentStatus exists, logic above overrides.
    if (appStatus === "submitted") {
      return 3;
    }

    // Step 2: Default for authenticated user (Fill Form)
    return 2;
  }, [uid, enrollmentStatus, appStatus]);

  const [currentStep, setCurrentStep] = useState(derivedStep);
  const [loading, setLoading] = useState(false);
  const [pixDataUrl, setPixDataUrl] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [pixUnavailable, setPixUnavailable] = useState(false);

  // Sync state with prop changes (e.g. after router.refresh)
  useEffect(() => {
    // Only auto-advance/sync if the derived step implies progress (or regression in auth)
    // But mainly to catch up with backend state.
    setCurrentStep(derivedStep);
  }, [derivedStep]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    profession: "",
  });

  // --- FORM DATA SYNC (P1 Fix) ---
  // Populate form if server data arrives and form is pristine
  useEffect(() => {
    if (currentStep === 2 && application?.answers) {
      setFormData((prev) => {
        // "Pristine" check: if fields are empty, safe to fill.
        const isPristine = !prev.fullName && !prev.phone && !prev.profession;
        if (isPristine) {
          return {
            fullName: application.answers.fullName || "",
            phone: application.answers.phone || "",
            profession: application.answers.profession || "",
          };
        }
        return prev;
      });
    }
  }, [currentStep, application?.answers]);

  // Handlers
  const handleLogin = () => {
    router.push(`/auth?next=/inscricao/${courseId}`);
  };

  const handleSignup = () => {
    router.push(`/auth?mode=signup&next=/inscricao/${courseId}`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          answers: formData,
          consent: { lgpd: true, acceptedAt: new Date().toISOString() },
        }),
      });

      // P0: 401 Handling
      if (res.status === 401) {
        setLoading(false);
        router.push(`/auth?next=/inscricao/${courseId}`);
        return;
      }

      if (!res.ok) throw new Error("Falha ao salvar formulário");

      // P1: Optimistic Update
      setCurrentStep(3);
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast("Ocorreu um erro ao salvar sua inscrição.", "error");
      setLoading(false); // Only stop loading on error (success moves step or refreshes)
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/billing/checkout-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      // P0: 401 Handling
      if (res.status === 401) {
        setLoading(false);
        router.push(`/auth?next=/inscricao/${courseId}`);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro no checkout");
      }
    } catch (err) {
      console.error(err);
      addToast("Não foi possível iniciar o pagamento.", "error");
      setLoading(false);
    }
  };

  const handleGeneratePix = async () => {
    setPixLoading(true);
    try {
      // Create pending enrollment in DB
      const result = await createEnrollmentPending(courseId);
      if (!result.success && result.error) throw new Error(result.error);

      // The QR is built server-side from the operator's real PIX key
      // (PIX_MERCHANT_KEY). If that key isn't configured, we show the
      // request as pending and tell the student to contact the team instead
      // of fabricating a code that doesn't point anywhere.
      const pixResult = await generatePixPayload(courseId);
      if (!pixResult.success) {
        throw new Error(pixResult.error || "Erro ao gerar PIX");
      }

      if (!pixResult.configured || !pixResult.payload) {
        setPixUnavailable(true);
        return;
      }

      const qrDataUrl = await QRCode.toDataURL(pixResult.payload, {
        width: 250,
        margin: 2,
      });
      setPixDataUrl(qrDataUrl);
    } catch (err: any) {
      addToast(err.message || "Erro ao gerar PIX", "error");
    } finally {
      setPixLoading(false);
    }
  };

  // Derived Status Flags for Render
  const isPendingApproval =
    enrollment?.status === "pending_approval" ||
    pixDataUrl !== "" ||
    pixUnavailable;
  const isCanceled = enrollment?.status === "canceled";
  const isRefunded = enrollment?.status === "refunded";

  return (
    <div className="fv-bg fv-bg-enrollment mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <Link
          href="/"
          className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:underline"
          aria-label="Voltar"
        >
          &larr; Voltar para Home
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {course.courseTitle || course.title}
        </h1>
        <p className="text-text/75">
          Complete sua inscrição para garantir sua vaga.
        </p>
      </div>

      {/* Steps Indicator */}
      <ol
        aria-label="Etapas da inscrição"
        className="relative mb-12 flex items-center justify-between px-4"
      >
        <div
          className="absolute left-0 top-1/2 -z-10 h-px w-full bg-border"
          aria-hidden
        />
        {[1, 2, 3, 4].map((step) => (
          <li
            key={step}
            aria-current={step === currentStep ? "step" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-paper text-sm font-bold transition-colors ${
              step <= currentStep
                ? "bg-primary text-white"
                : "bg-areia text-muted"
            }`}
          >
            <span className="sr-only">
              Etapa {step} de 4
              {step < currentStep
                ? " (concluída)"
                : step === currentStep
                  ? " (atual)"
                  : ""}
            </span>
            <span aria-hidden>
              {step < currentStep ? <Check size={16} /> : step}
            </span>
          </li>
        ))}
      </ol>

      {/* Content Card */}
      <div className="rounded-md border border-border bg-paper p-8 md:p-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: LOGIN */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-areia text-primary">
                  <User size={32} />
                </div>
                <h2 className="font-serif text-3xl text-primary mb-4">
                  Primeiro, identifique-se
                </h2>
                <p className="text-text/75 mb-10 max-w-md mx-auto leading-relaxed">
                  Para se inscrever, você precisa entrar com sua conta ou criar
                  uma nova.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
                  >
                    Já possuo conta <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleSignup}
                    className="flex items-center justify-center gap-2 rounded-md border border-border bg-paper px-8 py-4 text-xs font-bold uppercase tracking-widest text-text transition-colors hover:border-igarape hover:bg-areia hover:text-primary"
                  >
                    Criar nova conta <User size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORM */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-serif text-3xl text-primary mb-8">
                Seus Dados
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Nome Completo"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  <Input
                    label="Telefone / WhatsApp"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Profissão / Área de Atuação"
                  required
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                />

                <div className="flex justify-end border-t border-border pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        Confirmar Interesse <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: PAGAMENTO PIX */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h2 className="font-serif text-3xl text-primary mb-4">
                  Pagamento via PIX
                </h2>
                <p className="text-text/75 mb-8 max-w-md mx-auto leading-relaxed">
                  Escaneie o QR Code abaixo para confirmar a sua matrícula. A
                  liberação será feita após a confirmação pela nossa equipe.
                </p>

                {pixUnavailable ? (
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-border bg-areia p-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">
                      Pagamento via PIX indisponível no momento
                    </p>
                    <p className="text-sm text-text/70 leading-relaxed">
                      Sua solicitação de matrícula foi registrada. Nossa equipe
                      entrará em contato com as instruções de pagamento para
                      confirmar seu acesso.
                    </p>
                  </div>
                ) : !pixDataUrl ? (
                  <button
                    onClick={handleGeneratePix}
                    disabled={pixLoading}
                    className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
                  >
                    {pixLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Gerar QR Code PIX"
                    )}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto flex max-w-md flex-col items-center rounded-md border border-border bg-areia p-8"
                  >
                    <img
                      src={pixDataUrl}
                      alt="PIX QR Code"
                      className="mb-4 h-56 w-56 rounded-md border border-border bg-paper"
                    />
                    <p className="mb-6 px-4 text-xs text-text/70">
                      Utilize o aplicativo do seu banco para ler o QR Code ou
                      copie o código Pix Copia e Cola.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep(4);
                        router.refresh();
                      }}
                      className="w-full rounded-md bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
                    >
                      Já realizei o pagamento
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: STATUS */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                {isPendingApproval ? (
                  <>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                      <Clock size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição em Análise
                    </h2>
                    <p className="text-text/75 mb-8">
                      Pagamento confirmado! Nossa equipe está revisando sua
                      inscrição.
                    </p>
                    <Link
                      href="/portal"
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                      Ir para o Portal <ArrowRight size={18} />
                    </Link>
                  </>
                ) : isCanceled || isRefunded ? (
                  <>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
                      <Clock size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição não ativa
                    </h2>
                    <p className="text-text/75 mb-8">
                      {isRefunded
                        ? "Sua matrícula foi reembolsada."
                        : "Sua matrícula foi cancelada."}
                    </p>
                    <Link
                      href={`/curso/${courseId}`}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                      Ver curso <ArrowRight size={18} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição Confirmada!
                    </h2>
                    <p className="text-text/75 mb-8">
                      Sua assinatura está ativa e o acesso liberado.
                    </p>
                    <Link
                      href={`/portal/course/${courseId}`}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                      Acessar Curso <ArrowRight size={18} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
