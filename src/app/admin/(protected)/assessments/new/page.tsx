"use client";

import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import QuizBuilder from "@/components/admin/assessment/QuizBuilder";
import { useToast } from "@/context/ToastContext";

export default function NewAssessmentPage() {
  const router = useRouter();
  const { addToast } = useToast();

  return (
    <AdminPageShell
      title="Nova Avaliação / Prova"
      description="Crie questionários, provas práticas ou exames avaliativos para os cursos da plataforma."
      breadcrumbs={[
        { label: "Avaliações", href: "/admin/assessments" },
        { label: "Nova Avaliação" },
      ]}
      backLink="/admin/assessments"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        <QuizBuilder
          onSuccess={() => {
            addToast("Avaliação criada com sucesso!", "success");
            router.push("/admin/assessments");
          }}
          onCancel={() => router.push("/admin/assessments")}
        />
      </div>
    </AdminPageShell>
  );
}
