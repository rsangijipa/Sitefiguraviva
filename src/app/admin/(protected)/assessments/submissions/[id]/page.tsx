import { getSubmissionDetail } from "@/actions/assessment";
import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import SubmissionGradingClient from "./SubmissionGradingClient";
import { deepSafeSerialize } from "@/lib/utils";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSubmissionDetail(id);

  if (!data) {
    notFound();
  }

  const title = `Correção: ${data.user?.displayName || "Aluno"}`;
  const serializedData = deepSafeSerialize(data);

  return (
    <AdminPageShell
      title={title}
      description={`Avaliação: ${data.assessment?.title || "N/A"}`}
      breadcrumbs={[
        { label: "Avaliações", href: "/admin/assessments" },
        { label: "Submissões", href: "/admin/assessments/submissions" },
        { label: "Correção" },
      ]}
    >
      <SubmissionGradingClient
        submission={serializedData.submission}
        user={serializedData.user}
        assessment={serializedData.assessment}
      />
    </AdminPageShell>
  );
}
