"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import QuizBuilder from "@/components/admin/assessment/QuizBuilder";
import { useToast } from "@/context/ToastContext";
import { assessmentService } from "@/services/assessmentService";
import { AssessmentDoc } from "@/types/assessment";
import { Loader2 } from "lucide-react";

export default function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [assessment, setAssessment] = useState<AssessmentDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await assessmentService.getAssessment(id);
        if (!mounted) return;
        if (data) {
          setAssessment(data);
        } else {
          addToast("Avaliação não encontrada.", "error");
          router.push("/admin/assessments");
        }
      } catch (err) {
        console.error("Failed to load assessment", err);
        addToast("Erro ao carregar avaliação.", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, router, addToast]);

  return (
    <AdminPageShell
      title={assessment ? `Editar: ${assessment.title}` : "Editar Avaliação"}
      description="Ajuste as questões, critérios de aprovação e configurações da prova."
      breadcrumbs={[
        { label: "Avaliações", href: "/admin/assessments" },
        { label: assessment ? assessment.title : "Editar" },
      ]}
      backLink="/admin/assessments"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Carregando dados da avaliação...</p>
          </div>
        ) : assessment ? (
          <QuizBuilder
            assessment={assessment}
            onSuccess={() => {
              addToast("Avaliação atualizada com sucesso!", "success");
              router.push("/admin/assessments");
            }}
            onCancel={() => router.push("/admin/assessments")}
          />
        ) : (
          <div className="py-12 text-center text-stone-500">
            Avaliação não encontrada.
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
