"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, User, Clock } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { createEnrollmentPending } from "@/app/actions/enrollment-pix";
import QRCode from "qrcode";

// --- AUTH HELPER (Robust P0 Fix) ---
const getIdToken = async (): Promise<string> => {
  const { auth } = await import("@/lib/firebase/client");
  if (auth.currentUser) return auth.currentUser.getIdToken();

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      settled = true;
      clearTimeout(timeoutId);
      unsubscribe();
    };

    const timeoutId = setTimeout(() => {
      if (settled) return;
      cleanup();
      reject(new Error("Timeout de autenticação"));
    }, 5000);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (settled) return;

      if (user) {
        // Ensure we clean up immediately to prevent race conditions
        cleanup();
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (e) {
          reject(e);
        }
      } else {
        // Determine if we should wait or reject immediately.
        // Standard: wait for initial load. If null comes after load, then reject.
        // But onAuthStateChanged fires immediately. If null, we might want to wait.
        // However, without logic to know "auth initialized", we rely on timeout for "not logged in" case.
      }
    });
  });
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

      // Random mock PIX Payload for visual purposes
      const pixPayload = `00020101021226580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2)}520400005303986540510.005802BR5915INSTITUTO FIGURA VIVA6009SAO PAULO62140510FIGURA${courseId}6304`;

      const qrDataUrl = await QRCode.toDataURL(pixPayload, {
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
    enrollment?.status === "pending_approval" || pixDataUrl !== "";
  const isCanceled = enrollment?.status === "canceled";
  const isRefunded = enrollment?.status === "refunded";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <Link
          href="/"
          className="text-primary/80 text-xs font-bold uppercase tracking-widest hover:text-primary mb-4 block transition-colors"
          aria-label="Voltar"
        >
          &larr; Voltar para Home
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {course.courseTitle || course.title}
        </h1>
        <p className="text-stone-500">
          Complete sua inscrição para garantir sua vaga.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-12 relative px-4">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-stone-200 -z-10" />
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-[#FDFCF9] ${
              step <= currentStep
                ? "bg-primary text-white"
                : "bg-stone-200 text-stone-400"
            }`}
          >
            {step < currentStep ? <Check size={16} /> : step}
          </div>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-soft-xl border border-white/60">
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
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-soft-md border border-stone-100">
                  <User size={32} />
                </div>
                <h2 className="font-serif text-3xl text-primary mb-4">
                  Primeiro, identifique-se
                </h2>
                <p className="text-stone-500 mb-10 max-w-md mx-auto leading-relaxed">
                  Para se inscrever, você precisa entrar com sua conta ou criar
                  uma nova.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleLogin}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    Já possuo conta <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-8 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
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
                    className="bg-white/50"
                  />
                  <Input
                    label="Telefone / WhatsApp"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-white/50"
                  />
                </div>
                <Input
                  label="Profissão / Área de Atuação"
                  required
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  className="bg-white/50"
                />

                <div className="pt-8 border-t border-stone-200/50 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
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
                <p className="text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Escaneie o QR Code abaixo para confirmar a sua matrícula. A
                  liberação será feita após a confirmação pela nossa equipe.
                </p>

                {!pixDataUrl ? (
                  <button
                    onClick={handleGeneratePix}
                    disabled={pixLoading}
                    className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 max-w-sm mx-auto uppercase tracking-widest text-sm"
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
                    className="flex flex-col items-center bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-inner max-w-md mx-auto"
                  >
                    <img
                      src={pixDataUrl}
                      alt="PIX QR Code"
                      className="w-56 h-56 rounded-lg shadow-sm mb-4"
                    />
                    <p className="text-xs text-stone-400 mb-6 px-4">
                      Utilize o aplicativo do seu banco para ler o QR Code ou
                      copie o código Pix Copia e Cola.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep(4);
                        router.refresh();
                      }}
                      className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all uppercase tracking-widest text-xs"
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
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                      <Clock size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição em Análise
                    </h2>
                    <p className="text-stone-500 mb-8">
                      Pagamento confirmado! Nossa equipe está revisando sua
                      inscrição.
                    </p>
                    <Link
                      href="/portal"
                      className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                    >
                      Ir para o Portal <ArrowRight size={18} />
                    </Link>
                  </>
                ) : isCanceled || isRefunded ? (
                  <>
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                      <Clock size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição não ativa
                    </h2>
                    <p className="text-stone-500 mb-8">
                      {isRefunded
                        ? "Sua matrícula foi reembolsada."
                        : "Sua matrícula foi cancelada."}
                    </p>
                    <Link
                      href={`/curso/${courseId}`}
                      className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                    >
                      Ver curso <ArrowRight size={18} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                      <Check size={32} />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-4">
                      Inscrição Confirmada!
                    </h2>
                    <p className="text-stone-500 mb-8">
                      Sua assinatura está ativa e o acesso liberado.
                    </p>
                    <Link
                      href={`/portal/course/${courseId}`}
                      className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
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
