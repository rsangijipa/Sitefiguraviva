import "server-only";
import { publishedEditorial } from "./editorial.server";
import type { ResourceKey } from "./contracts";
import type { ResourceSnapshot } from "./ResourceHost";
import {resourceSession,hasFormationAccess,editorialPermissions} from "./access.server";
import {resourceCatalog,isPublicResource} from "@/components/resources/resourceCatalog";
export async function resourceSnapshot(key:ResourceKey,preview=false):Promise<ResourceSnapshot> {
 const resource=resourceCatalog.find(item=>item.slug===key);
 const publicResource=!!resource && isPublicResource(resource);
 if(!publicResource){const session=await resourceSession();if(!session || !(await hasFormationAccess(session.uid) || preview && (session.isAdmin || !!(await editorialPermissions(session.uid)).length)))throw new Error("formation access required");}
 const arrival=key==="chegada";const atelier=key==="atelie-do-experimento";
 const [version,cards,emotions,needs,cases]=await Promise.all([
  publishedEditorial(key),publishedEditorial("cartas-gestalticas"),arrival?publishedEditorial("roda-das-emocoes"):null,
  arrival?publishedEditorial("necessidades-agora"):null,atelier?publishedEditorial("casoteca"):null,
 ]);
 return {version,concepts:cards?.configuration.items ?? [],emotions:emotions?.configuration.items ?? [],needs:needs?.configuration.items ?? [],cases:cases?.configuration.items ?? []};
}
