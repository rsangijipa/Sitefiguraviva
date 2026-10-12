import "server-only";
import { publishedEditorial } from "./editorial.server";
import type { ResourceKey } from "./contracts";
import type { ResourceSnapshot } from "./ResourceHost";
import {resourceSession,hasFormationAccess,editorialPermissions} from "./access.server";
export async function resourceSnapshot(key:ResourceKey,preview=false):Promise<ResourceSnapshot> {
 const publicResource=key==="cartas-gestalticas" || key==="figura-e-fundo";
 if(!publicResource){const session=await resourceSession();if(!session || !(await hasFormationAccess(session.uid) || preview && (session.isAdmin || !!(await editorialPermissions(session.uid)).length)))throw new Error("formation access required");}
 const arrival=key==="chegada";const atelier=key==="atelie-do-experimento";
 const [version,cards,emotions,needs,cases]=await Promise.all([
  publishedEditorial(key),publishedEditorial("cartas-gestalticas"),arrival?publishedEditorial("roda-das-emocoes"):null,
  arrival?publishedEditorial("necessidades-agora"):null,atelier?publishedEditorial("casoteca"):null,
 ]);
 return {version,concepts:cards?.configuration.items ?? [],emotions:emotions?.configuration.items ?? [],needs:needs?.configuration.items ?? [],cases:cases?.configuration.items ?? []};
}
