import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { ResourceCatalog } from "@/features/interactive-resources/v2/ResourceCatalog";
import { hasFormationAccess,editorialPermissions } from "@/features/interactive-resources/v2/access.server";
import { releasedLearningResources } from "@/features/interactive-resources/v2/releases.server";
import Link from "next/link";
export const metadata:Metadata={title:"Recursos da formação",robots:{index:false,follow:false},alternates:{canonical:"/portal/recursos"}};
export default async function FormationResourcesPage() {
 const session=await requireSession("/auth?next=/portal/recursos");
 const [member,permissions,released]=await Promise.all([hasFormationAccess(session.uid),editorialPermissions(session.uid),releasedLearningResources()]);
 const preview=session.isAdmin || !!permissions.length;
 if(!member && !preview) return <section className="fv-resources"><div className="fv-content"><h1>Recursos da formação</h1><p>É necessário vínculo com uma formação ativa ou concluída para usar estas experiências.</p><Link href="/portal/recursos/meus-registros">Consultar ou exportar meus registros</Link></div></section>;
 return <ResourceCatalog formation preview={preview} released={released} />;
}
