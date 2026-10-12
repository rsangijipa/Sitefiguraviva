import "server-only";
import type { Metadata } from "next";
import { notFound,permanentRedirect } from "next/navigation";
import { requireSession } from "@/lib/auth/server";
import { resourceCatalog,resolveResourceDestination,resourceHref } from "@/components/resources/resourceCatalog";
import { ResourceKeySchema } from "./contracts";
import { hasFormationAccess,editorialPermissions } from "./access.server";
import { resourceSnapshot } from "./snapshot.server";
import { ResourceHost } from "./ResourceHost";
import { releasedLearningResources } from "./releases.server";
import { resourceDatabase } from "./database.server";
import { contentVersion } from "./editorial.server";
import Link from "next/link";
export interface PortalResourceProps { params:Promise<{slug:string}>; searchParams:Promise<{modo?:string;previa?:string;versao?:string}> }
export async function portalResourceMetadata({params}:PortalResourceProps):Promise<Metadata> {
 const {slug}=await params;const resource=resourceCatalog.find(item=>item.slug===resolveResourceDestination(slug).slug);
 return {title:resource?.title ?? "Recurso",robots:{index:false,follow:false},...(resource ? {alternates:{canonical:resourceHref(resource)}} : {})};
}
export async function PortalResourcePage({params,searchParams}:PortalResourceProps) {
 const [{slug},query]=await Promise.all([params,searchParams]);
 const destination=resolveResourceDestination(slug,typeof query.modo==="string" ? query.modo : undefined);
 const resource=resourceCatalog.find(item=>item.slug===destination.slug);
 if(!resource || resource.visibility==="hidden") notFound();
 const path=`/portal/recursos/${resource.slug}${destination.mode ? "?modo="+encodeURIComponent(destination.mode) : ""}`;
 if(destination.slug!==slug) permanentRedirect(path);
 const session=await requireSession(`/auth?next=${encodeURIComponent(path)}`);
 const [member,permissions,released]=await Promise.all([hasFormationAccess(session.uid),editorialPermissions(session.uid),resource.visibility==="draft" ? releasedLearningResources() : Promise.resolve([])]);
 const canPreview=session.isAdmin || !!permissions.length;
 const preview=canPreview && query.previa==="1";
 if(resource.visibility==="draft" && !released.includes(resource.slug) && !preview) notFound();
 if(resource.access==="formation" && !member && !preview) return <section className="fv-resources"><div className="fv-content"><h1>Vínculo com formação necessário</h1><p>Esta experiência está disponível para matriculados e egressos.</p>{canPreview && <Link href={`/portal/recursos/${resource.slug}?previa=1`}>Abrir prévia editorial</Link>}<p><Link href="/portal/recursos/meus-registros">Meus registros</Link></p></div></section>;
 const snapshot=await resourceSnapshot(ResourceKeySchema.parse(resource.slug),preview);
 if(preview && typeof query.versao==="string" && /^[0-9a-f-]{36}$/i.test(query.versao)) {
  const result=await resourceDatabase().from("resource_content_versions").select("*").eq("id",query.versao).eq("resource_key",ResourceKeySchema.parse(resource.slug)).maybeSingle();
  if(!result.error && result.data) snapshot.version=contentVersion(result.data);
 }
 return <ResourceHost slug={resource.slug} snapshot={snapshot} initialMode={destination.mode} preview={preview} />;
}
