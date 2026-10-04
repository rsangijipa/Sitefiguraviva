"use client";

import { parseAmountCents } from "@/features/courses/domain/course-offer";
import { setCourseCommercialState } from "@/app/actions/admin-publishing";
import { useState } from "react";
import { adminCourseService } from "@/services/adminCourseService";
import { CourseDoc } from "@/types/lms";
import { Save, Trash2, Shield, Award, MessageSquare, List } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CourseSettingsTab({
  course,
  onCourseChanged,
}: {
  course: CourseDoc;
  onCourseChanged?: (updates: Partial<CourseDoc>) => void;
}) {
  const { addToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [pixAmount, setPixAmount] = useState(
    course.pixPriceCents ? (course.pixPriceCents / 100).toFixed(2) : "",
  );
  // Local State
  const [totalAmount, setTotalAmount] = useState(
    course.totalPriceCents != null
      ? (course.totalPriceCents / 100).toFixed(2)
      : "",
  );
  const [installments, setInstallments] = useState(course.installments ?? 1);
  const [billingType, setBillingType] = useState(
    course.billing?.type ?? "one_time",
  );
  const [communityEnabled, setCommunityEnabled] = useState(
    course.communityEnabled !== false,
  ); // Default true
  const [certEnabled, setCertEnabled] = useState(
    course.certificateRules?.enabled || false,
  );
  const [minProgress, setMinProgress] = useState(
    course.certificateRules?.minProgressPercent || 100,
  );

  const handleSave = async () => {
    let cents: number | null, total: number | null;
    try {
      cents = parseAmountCents(pixAmount);
      total = parseAmountCents(totalAmount);
      if (
        cents === 0 ||
        !Number.isInteger(installments) ||
        installments < 1 ||
        installments > 120
      )
        throw new Error("Valor Pix ou número de parcelas inválido.");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Valor inválido.",
        "error",
      );
      return;
    }
    setIsLoading(true);
    try {
      await adminCourseService.updateCourse(course.id, {
        pixPriceCents: cents,
        totalPriceCents: total,
        installments,
        billing: { ...course.billing, type: billingType },
        communityEnabled,
        certificateRules: {
          enabled: certEnabled,
          minProgressPercent: minProgress,
        },
      });
      onCourseChanged?.({
        pixPriceCents: cents,
        totalPriceCents: total,
        installments,
        billing: { ...course.billing, type: billingType },
        communityEnabled,
        certificateRules: {
          enabled: certEnabled,
          minProgressPercent: minProgress,
        },
      });
      addToast("Configurações salvas", "success");
      router.refresh();
    } catch (error) {
      addToast("Erro ao salvar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    const confirm1 = confirm(
      "Tem certeza que deseja EXCLUIR este curso permanentemente?",
    );
    if (!confirm1) return;

    const confirm2 = prompt(
      "Para confirmar, digite o nome do curso exatamente como está:",
    );
    if (confirm2 !== course.title) {
      addToast("O nome digitado não coincide.", "error");
      return;
    }

    try {
      setIsLoading(true);
      await adminCourseService.deleteCourse(course.id);
      addToast("Curso excluído com sucesso", "success");
      router.push("/admin/courses");
    } catch (error) {
      addToast("Erro ao excluir", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-3xl pb-20">
      {/* Visibility Card */}
      <section className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
            <Shield size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800 text-lg mb-1">
              Visibilidade e Acesso
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              Controle quem pode ver e acessar este curso.
            </p>

            <div className="space-y-3 rounded-lg border p-4">
              <p>
                Oferta: {course.isPublished ? "Publicada" : "Oculta"}.
                Inscrições:{" "}
                {course.status === "open" && course.isPublished
                  ? "Abertas"
                  : "Encerradas"}
                .
              </p>
              <p className="text-xs text-stone-500">
                Publicar a oferta não libera aulas nem abre inscrições. Encerrar
                inscrições preserva a página pública e as matrículas existentes.
                Ocultar o curso também bloqueia seu acesso no portal.
              </p>
              {(
                [
                  course.isPublished ? "unpublish" : "publish",
                  course.status === "open" ? "close" : "open",
                ] as const
              ).map((command) => (
                <Button
                  key={command}
                  size="sm"
                  disabled={
                    isLoading || (command === "open" && !course.isPublished)
                  }
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const result = await setCourseCommercialState(
                        course.id,
                        command,
                      );
                      if (!result.success) {
                        addToast(
                          result.error || "Erro ao atualizar oferta",
                          "error",
                        );
                        return;
                      }
                      onCourseChanged?.({
                        status: result.newStatus,
                        isPublished: result.isPublished,
                        contentRevision: result.contentRevision,
                      });
                      addToast("Oferta atualizada", "success");
                      router.refresh();
                    } catch {
                      addToast("Erro ao atualizar oferta", "error");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  {command === "publish"
                    ? "Publicar oferta"
                    : command === "unpublish"
                      ? "Ocultar oferta"
                      : command === "open"
                        ? "Abrir inscrições"
                        : "Encerrar inscrições"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Card */}
      <section className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
            <Award size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800 text-lg mb-1">
              Funcionalidades
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              Ative ou desative recursos específicos para este curso.
            </p>

            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border border-stone-100 p-4">
                <label htmlFor="pix-initial-amount" className="font-bold">
                  Pix inicial — matrícula ou primeira parcela (R$)
                </label>
                <input
                  id="pix-initial-amount"
                  type="text"
                  inputMode="decimal"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(e.target.value)}
                  className="block w-full rounded-md border p-3"
                  placeholder="Ex.: 250,00"
                />
                <p className="text-xs text-stone-500">
                  Este valor será cobrado na inscrição. As parcelas seguintes
                  não são cobradas por este Pix. Deixe vazio para desabilitar
                  novas cobranças; pedidos existentes mantêm seu valor.
                </p>
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <label className="block">
                  Valor integral do curso (R$)
                  <input
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    inputMode="decimal"
                    className="block w-full rounded border p-3"
                  />
                </label>
                <label className="block">
                  Número máximo de parcelas
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="block w-full rounded border p-3"
                  />
                </label>
                <label className="block">
                  Modelo financeiro
                  <select
                    value={billingType}
                    onChange={(e) =>
                      setBillingType(e.target.value as typeof billingType)
                    }
                    className="block w-full rounded border p-3"
                  >
                    <option value="one_time">
                      Valor integral / parcelamento
                    </option>
                    <option value="subscription">Recorrente</option>
                    <option value="free">Gratuito</option>
                  </select>
                </label>
                <p className="text-xs text-stone-500">
                  O Pix inicial é independente do valor integral. Estes dados
                  não geram cobranças das parcelas seguintes nem uma assinatura
                  automática. Deixe o valor integral vazio enquanto estiver em
                  definição.
                </p>
              </div>
              {/* Community Toggle */}
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-stone-400" />
                  <div>
                    <p className="font-bold text-stone-700">Comunidade</p>
                    <p className="text-xs text-stone-400">
                      Habilita a aba de discussões.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCommunityEnabled(!communityEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    communityEnabled ? "bg-primary" : "bg-stone-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                      communityEnabled ? "right-1" : "left-1",
                    )}
                  />
                </button>
              </div>

              {/* Certificate Toggle */}
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-stone-400" />
                    <div>
                      <p className="font-bold text-stone-700">Certificados</p>
                      <p className="text-xs text-stone-400">
                        Emissão automática.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCertEnabled(!certEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      certEnabled ? "bg-primary" : "bg-stone-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                        certEnabled ? "right-1" : "left-1",
                      )}
                    />
                  </button>
                </div>

                {certEnabled && (
                  <div className="pl-8 animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">
                      Progresso Mínimo (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={minProgress}
                      onChange={(e) => setMinProgress(Number(e.target.value))}
                      className="w-24 p-2 rounded border border-stone-200 text-sm font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Versions Card */}
      <section className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
            <List size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-stone-800 text-lg">
                Versões Acadêmicas
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Revisão: {course.contentRevision || 1}
              </span>
            </div>
            <p className="text-sm text-stone-500 mb-6">
              Controle o versionamento acadêmico para emissão de certificados.
            </p>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-primary mb-2 text-sm">
                Incrementar Revisão
              </h4>
              <p className="text-xs text-primary/60 mb-4 leading-relaxed">
                Use esta função quando houver mudanças significativas na ementa
                ou carga horária. Novos certificados emitidos a partir de agora
                exibirão a revisão{" "}
                <span className="font-bold">
                  v{(course.contentRevision || 1) + 1}
                </span>
                .
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (
                    !confirm(
                      "Deseja incrementar a revisão acadêmica? Isso afetará todos os novos certificados.",
                    )
                  )
                    return;
                  setIsLoading(true);
                  try {
                    const { bumpCourseRevision } =
                      await import("@/app/actions/admin-publishing");
                    const res = await bumpCourseRevision(course.id);
                    if (res.success) {
                      addToast(
                        `Revisão atualizada para v${res.newRevision}`,
                        "success",
                      );
                      router.refresh();
                    } else {
                      addToast(res.error || "Erro ao atualizar", "error");
                    }
                  } catch (e) {
                    addToast("Erro interno", "error");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
                className="bg-white border-primary/20 text-primary hover:bg-primary/10"
              >
                Criar Nova Revisão Academicas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-bold text-red-800 mb-2">Zona de Perigo</h3>
        <p className="text-sm text-red-600/80 mb-6">Ações irreversíveis.</p>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 hover:border-red-300 bg-white"
            onClick={handleDeleteCourse}
            leftIcon={<Trash2 size={16} />}
            isLoading={isLoading}
          >
            Excluir Curso
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-stone-100">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          size="lg"
          className="px-8"
          leftIcon={<Save size={18} />}
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
