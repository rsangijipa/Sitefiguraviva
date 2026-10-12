import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import { resourceCatalog,resolveResourceDestination,resourceHref,isPublicResource } from "@/components/resources/resourceCatalog";
import { ResourceHost } from "@/features/interactive-resources/v2/ResourceHost";
import { resourceSnapshot } from "@/features/interactive-resources/v2/snapshot.server";
import { ResourceKeySchema } from "@/features/interactive-resources/v2/contracts";

interface ResourcePageProps { params:Promise<{slug:string}>; searchParams:Promise<{modo?:string}> }
export async function generateMetadata({params}:ResourcePageProps):Promise<Metadata> {
 const {slug}=await params; const destination=resolveResourceDestination(slug);
 const resource=resourceCatalog.find(item=>item.slug===destination.slug);
 if(!resource || resource.visibility==="hidden") return {robots:{index:false,follow:false}};
 return {title:resource.title,description:resource.description,alternates:{canonical:resourceHref(resource)},robots:{index:isPublicResource(resource),follow:isPublicResource(resource)}};
}
export default async function ResourcePage({params,searchParams}:ResourcePageProps) {
 const [{slug},query]=await Promise.all([params,searchParams]);
 const destination=resolveResourceDestination(slug,typeof query.modo==="string" ? query.modo : undefined);
 const resource=resourceCatalog.find(item=>item.slug===destination.slug);
 if(!resource || resource.visibility==="hidden" || resource.visibility==="draft") notFound();
 if(resource.access!=="public" || destination.slug!==slug) permanentRedirect(resourceHref(resource,destination.mode));
 const snapshot=await resourceSnapshot(ResourceKeySchema.parse(resource.slug));
 return <PublicSiteFrame><ResourceHost slug={resource.slug} snapshot={snapshot} initialMode={destination.mode} /></PublicSiteFrame>;
}
