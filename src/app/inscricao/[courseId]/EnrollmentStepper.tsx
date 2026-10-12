"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, User, Clock, ShieldCheck, Copy } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { generatePixPayload } from "@/app/actions/enrollment-pix";
import QRCode from "qrcode";
import type { PixOrderRow } from "@/infrastructure/supabase/database.types";

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
  const { user } = useAuth();

  // Derived Data
  const { course, enrollment, application, uid, userProfile } = initialData;
  const effectiveUid = uid || user?.uid || null;
  const enrollmentStatus = enrollment?.status;
  const appStatus = application?.status;

  // --- STEP DERIVATION (P0 Fix) ---
  const derivedStep = useMemo(() => {
    if (!effectiveUid) return 1;

    if (enrollmentStatus === "pending_approval")
      return initialData.pixOrder?.declared_at
        ? 4
        : application?.status === "submitted"
          ? 3
          : 2;
    // Step 4: Established enrollment status
    if (
      ["active", "completed", "canceled", "refunded"].includes(enrollmentStatus)
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
  }, [
    effectiveUid,
    enrollmentStatus,
    appStatus,
    initialData.pixOrder?.declared_at,
    application?.status,
  ]);

  const [currentStep, setCurrentStep] = useState(derivedStep);
  const [loading, setLoading] = useState(false);
  const [pixDataUrl, setPixDataUrl] = useState("");
  const [pixOrder, setPixOrder] = useState<PixOrderRow | null>(
    initialData.pixOrder || null,
  );
  const [receipt, setReceipt] = useState<File | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(() => {
    return Boolean(application?.consent?.lgpd || userProfile?.is_active || user);
  });
  useEffect(() => {
    setPixOrder(initialData.pixOrder || null);
  }, [initialData.pixOrder]);
  useEffect(() => {
    if (!pixOrder?.payload) return;
    let cancelled = false;
    void QRCode.toDataURL(pixOrder.payload, { width: 250, margin: 2 })
      .then((url) => {
        if (!cancelled) setPixDataUrl(url);
      })
      .catch(() => {
        if (!cancelled)
          addToast(
            "Não foi possível exibir o QR. Use o código Copia e Cola.",
            "error",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [pixOrder?.payload, addToast]);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixUnavailable, setPixUnavailable] = useState(false);

  // Sync state with prop changes (e.g. after router.refresh)
  useEffect(() => {
    // Only auto-advance/sync if the derived step implies progress (or regression in auth)
    // But mainly to catch up with backend state.
    setCurrentStep(derivedStep);
  }, [derivedStep]);

  // Form State - pre-filled from existing profile or application answers
  const [formData, setFormData] = useState({
    fullName:
      application?.answers?.fullName ||
      userProfile?.display_name ||
      user?.displayName ||
      "",
    phone:
      application?.answers?.phone ||
      userProfile?.phone_number ||
      (user?.user_metadata?.phone as string) ||
      "",
    profession:
      application?.answers?.profession ||
      userProfile?.profession ||
      "",
  });

  // --- FORM DATA SYNC (P1 Fix) ---
  // Populate form if server or auth profile data arrives
  useEffect(() => {
    if (currentStep === 2) {
      setFormData((prev) => {
        const nextFullName =
          prev.fullName ||
          application?.answers?.fullName ||
          userProfile?.display_name ||
          user?.displayName ||
          "";
        const nextPhone =
          prev.phone ||
          application?.answers?.phone ||
          userProfile?.phone_number ||
          (user?.user_metadata?.phone as string) ||
          "";
        const nextProfession =
          prev.profession ||
          application?.answers?.profession ||
          userProfile?.profession ||
          "";

        if (
          nextFullName !== prev.fullName ||
          nextPhone !== prev.phone ||
          nextProfession !== prev.profession
        ) {
          return {
            fullName: nextFullName,
            phone: nextPhone,
            profession: nextProfession,
          };
        }
        return prev;
      });
    }
  }, [currentStep, application?.answers, userProfile, user]);

  // Handlers
  const handleLogin = () => {
    router.push(`/auth?courseId=${encodeURIComponent(courseId)}&next=${encodeURIComponent(`/inscricao/${courseId}`)}`);
  };

  const handleSignup = () => {
    router.push(
      "/auth?mode=signup&courseId=" +
        encodeURIComponent(courseId) +
        "&next=" +
        encodeURIComponent("/inscricao/" + courseId),
    );
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
          consent: { lgpd: lgpdConsent },
        }),
      });

      // P0: 401 Handling. This used to redirect silently — if the Supabase
      // session hadn't finished propagating to the browser client yet (a
      // race right after signup/login), the visitor's form data vanished
      // with no explanation and no application row was ever created.
      if (res.status === 401) {
        setLoading(false);
        addToast(
          "Sua sessão expirou. Faça login novamente para confirmar seu interesse.",
          "error",
        );
        router.push(`/auth?courseId=${encodeURIComponent(courseId)}&next=${encodeURIComponent(`/inscricao/${courseId}`)}`);
        return;
      }

      if (!res.ok) throw new Error("Falha ao salvar formulário");
      setLoading(false);

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
        addToast(
          "Sua sessão expirou. Faça login novamente para continuar.",
          "error",
        );
        router.push(`/auth?courseId=${encodeURIComponent(courseId)}&next=${encodeURIComponent(`/inscricao/${courseId}`)}`);
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

      setPixOrder(pixResult.order || null);
    } catch (err: any) {
      addToast(err.message || "Erro ao gerar PIX", "error");
    } finally {
      setPixLoading(false);
    }
  };

  const submitReceipt = async () => {
    if (!pixOrder || !receipt) {
      addToast("Selecione o comprovante.", "error");
      return;
    }
    setLoading(true);
    try {
      const body = new FormData();
      body.set("orderId", pixOrder.id);
      body.set("receipt", receipt);
      const token = await getIdToken();
      const response = await fetch("/api/pix/receipt", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCurrentStep(4);
      router.refresh();
      addToast(
        "Comprovante enviado para conferência. O pagamento ainda não está confirmado.",
        "success",
      );
    } catch (error: any) {
      addToast(error.message || "Falha ao enviar comprovante.", "error");
    } finally {
      setLoading(false);
    }
  };
  // Derived Status Flags for Render
  const isPendingApproval =
    !["active", "completed", "canceled", "refunded"].includes(
      enrollmentStatus,
    ) &&
    (enrollmentStatus === "pending_approval" || pixOrder?.status === "pending");
  const isCanceled = enrollment?.status === "canceled";
  const isRefunded = enrollment?.status === "refunded";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[20px] sm:rounded-[24px] border border-border/80 bg-paper/95 p-6 sm:p-8 md:p-9 shadow-[0_16px_50px_-24px_rgba(38,58,58,0.30)] backdrop-blur-sm"
    >
      {/* Brand Header padronizado com a página de login */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-paper p-1 shadow-xs">
          <img
            src="/assets/logo.jpeg"
            alt="Instituto Figura Viva"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <h2 className="mb-1 font-serif text-2xl font-bold leading-tight text-primary sm:text-3xl">
          Inscrição na Turma
        </h2>
        <p className="text-xs font-semibold uppercase tracking-widest text-text/70">
          Instituto Figura Viva
        </p>
      </div>

      {/* Steps Indicator padronizado com as tabs/etapas de login */}
      <div
        role="tablist"
        aria-label="Etapas da inscrição"
        className="mb-8 flex gap-2 border-b border-border/60 pb-3"
      >
        {[
          { num: 1, label: "Identificação" },
          { num: 2, label: "Seus dados" },
          { num: 3, label: "Pagamento" },
          { num: 4, label: "Confirmação" },
        ].map((step) => {
          const isCurrent = step.num === currentStep;
          const isPast = step.num < currentStep;
          return (
            <div
              key={step.num}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex-1 flex flex-col items-center sm:items-start transition-colors ${
                isCurrent
                  ? "text-primary font-bold"
                  : isPast
                    ? "text-emerald-700 font-semibold"
                    : "text-text/50 font-medium"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-primary text-white"
                      : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-areia text-text/60 border border-border"
                  }`}
                >
                  {isPast ? <Check size={11} /> : step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              <div
                className={`mt-2 h-1 w-full rounded-full transition-colors ${
                  isCurrent
                    ? "bg-primary"
                    : isPast
                      ? "bg-emerald-600"
                      : "bg-border/60"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Content Form / Steps */}
      <div>
        <AnimatePresence mode="wait">
          {/* STEP 1: LOGIN */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-areia text-primary shadow-xs">
                <User size={30} />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-primary">
                  Primeiro, identifique-se
                </h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-text/75">
                  Para se inscrever nesta turma, entre com sua conta de aluno ou crie um novo cadastro no Instituto.
                </p>
              </div>
              <div className="grid gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.99]"
                >
                  Já possuo conta <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-paper px-6 text-xs font-bold uppercase tracking-widest text-text transition-colors hover:border-primary/40 hover:bg-areia hover:text-primary active:scale-[0.99]"
                >
                  Criar nova conta <User size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORM */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {effectiveUid && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Identificado na plataforma
                    </p>
                    <p className="text-sm font-semibold text-text">
                      {formData.fullName || userProfile?.display_name || user?.displayName || "Aluno(a)"}
                    </p>
                    <p className="text-xs text-text/60">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>
                  <div className="self-start sm:self-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <Check size={12} /> Conta Conectada
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-serif text-2xl font-bold text-primary">
                  Confirmação dos seus dados
                </h3>
                <p className="mt-1 text-xs text-text/75 leading-relaxed">
                  {effectiveUid
                    ? "Seus dados cadastrais foram pré-preenchidos automaticamente. Revise ou complemente para confirmar a inscrição."
                    : "Preencha seus dados para solicitar sua inscrição nesta formação."}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
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
                <Input
                  label="Profissão / Área de Atuação"
                  required
                  placeholder="Ex: Psicólogo(a), Terapeuta, Estudante..."
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                />

                <label className="flex items-start gap-3 text-xs text-text/80 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    Autorizo o uso dos dados informados para processar e
                    acompanhar minha inscrição. Consulte a política de privacidade
                    do Instituto.
                  </span>
                </label>

                <div className="pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50 active:scale-[0.99]"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 text-center"
            >
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary">
                  Pagamento via PIX
                </h3>
                <p className="mt-1 text-xs text-text/75 leading-relaxed">
                  Escaneie o QR Code abaixo ou utilize o código Copia e Cola para realizar o pagamento.
                </p>
              </div>

              {pixUnavailable ? (
                <div className="rounded-2xl border border-border/80 bg-areia/60 p-6 text-center space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    Pagamento via PIX indisponível no momento
                  </p>
                  <p className="text-xs text-text/75 leading-relaxed">
                    Nossa equipe entrará em contato com as instruções complementares de pagamento para liberar seu acesso.
                  </p>
                </div>
              ) : !pixOrder ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePix}
                    disabled={pixLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50 active:scale-[0.99]"
                  >
                    {pixLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Gerar QR Code PIX"
                    )}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-border/80 bg-areia/40 p-6 space-y-5"
                >
                  {pixDataUrl && (
                    <div className="flex justify-center">
                      <div className="rounded-xl border border-border bg-paper p-3 shadow-xs">
                        <img
                          src={pixDataUrl}
                          alt="PIX QR Code"
                          className="h-48 w-48 rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-serif text-xl font-bold text-primary">
                      Matrícula ou primeira parcela:{" "}
                      {(pixOrder.amount_cents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <p className="text-xs text-text/70">
                      Favorecido: <strong className="font-semibold text-text">{pixOrder.merchant_name}</strong>
                      <br />
                      Referência: <span className="font-mono">{pixOrder.txid}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-left text-xs font-bold uppercase tracking-wider text-text/70">
                      Código Pix Copia e Cola
                    </label>
                    <textarea
                      aria-label="Pix Copia e Cola"
                      readOnly
                      value={pixOrder.payload}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-paper p-3 font-mono text-[11px] text-text/80 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(pixOrder.payload);
                          addToast("Código Pix copiado.", "success");
                        } catch {
                          addToast(
                            "Selecione e copie o código acima.",
                            "error",
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-primary shadow-xs hover:bg-areia transition-colors"
                    >
                      <Copy size={13} /> Copiar código Pix
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border/60 text-left space-y-3">
                    <label htmlFor="pix-receipt" className="block text-xs font-bold uppercase tracking-wider text-text/80">
                      Após pagar, envie o comprovante (PDF, JPG ou PNG, até 5 MB)
                    </label>
                    <input
                      id="pix-receipt"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-text/70 file:mr-3 file:rounded-lg file:border file:border-border file:bg-paper file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary file:transition-colors hover:file:bg-areia cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={submitReceipt}
                      disabled={loading || !receipt}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Enviar para conferência"
                      )}
                    </button>
                    <p className="text-[11px] text-text/60 leading-relaxed text-center">
                      O envio do comprovante não confirma o recebimento. O
                      acesso será liberado após a conferência do crédito pelo
                      administrador.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: STATUS */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center space-y-6"
            >
              {isPendingApproval ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      Inscrição em Análise
                    </h3>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-text/75">
                      Comprovante recebido para conferência. O pagamento ainda
                      não está confirmado e o acesso aguarda aprovação.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-areia/50 p-4 text-xs text-text/70 max-w-sm mx-auto text-left space-y-1">
                    <p>• Nossa equipe administrativa irá validar seu comprovante.</p>
                    <p>• Você receberá um aviso assim que a vaga for confirmada.</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/portal"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Ir para o Portal <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              ) : isCanceled || isRefunded ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    <Clock size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      Inscrição não ativa
                    </h3>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-text/75">
                      {isRefunded
                        ? "Sua matrícula foi reembolsada."
                        : "Sua matrícula foi cancelada."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/curso/${courseId}`}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Ver curso <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Check size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      Inscrição Confirmada!
                    </h3>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-text/75">
                      Sua matrícula está ativa e o acesso liberado.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/portal/course/${courseId}`}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Acessar Curso <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
