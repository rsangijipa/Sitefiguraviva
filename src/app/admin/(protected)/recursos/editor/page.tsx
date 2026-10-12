import type { Metadata } from "next";
import { editorialPermissions, resourceSession } from "@/features/interactive-resources/v2/access.server";
import { EditorialWorkbench } from "@/features/interactive-resources/v2/EditorialWorkbench";

export const metadata: Metadata = { title: "Editor de recursos", robots: { index: false, follow: false } };

export default async function AdminResourceEditorPage({ searchParams }: { searchParams: Promise<{ recurso?: string }> }) {
  const [{ recurso }, session] = await Promise.all([searchParams, resourceSession()]);
  // O layout do admin já exige administração; a sessão só falta durante a personificação de outra conta.
  if (!session) return <section className="fv-resources"><div className="fv-content"><h1>Editor de recursos</h1><p>Encerre a visualização como outra conta para editar o acervo.</p></div></section>;
  const roles = await editorialPermissions(session.uid).catch(() => []);
  return <EditorialWorkbench admin={session.isAdmin} author={session.isAdmin || roles.some(item => item.role === "docente_autor")} reviewer={roles.some(item => item.role === "docente_revisor")}
    initialKey={typeof recurso === "string" ? recurso : undefined} backHref="/admin/recursos" backLabel="Voltar à aprovação de recursos" />;
}
