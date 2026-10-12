import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ResourceApprovalBoard } from "@/features/interactive-resources/v2/ResourceApprovalBoard";

export const metadata: Metadata = { title: "Aprovação de recursos", robots: { index: false, follow: false } };

export default function ResourceApprovalPage() {
  return (
    <AdminPageShell
      title="Aprovação de recursos interativos"
      description="Acompanhe o conteúdo de cada recurso da autoria à publicação: confira as versões assinadas pela revisão docente, publique ou devolva para ajustes, e mantenha a equipe editorial."
      actions={<Link href="/admin/recursos/editor" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-primary hover:bg-areia"><PenLine size={15} className="mr-1.5" aria-hidden="true" />Editor de conteúdo</Link>}
    >
      <ResourceApprovalBoard />
    </AdminPageShell>
  );
}
