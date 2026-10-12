import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { editorialPermissions,resourceSession } from "@/features/interactive-resources/v2/access.server";
import { EditorialWorkbench } from "@/features/interactive-resources/v2/EditorialWorkbench";
export const metadata:Metadata={title:"Trabalho editorial",robots:{index:false,follow:false}};
export default async function EditorialPage(){
 await requireSession("/auth?next=/portal/recursos/revisao");const session=await resourceSession();
 const roles=session?await editorialPermissions(session.uid):[];
 if(!session || !session.isAdmin && !roles.length)return <section className="fv-resources"><div className="fv-content"><h1>Trabalho editorial</h1><p>Esta área exige permissão docente.</p></div></section>;
 return <EditorialWorkbench admin={session.isAdmin} author={session.isAdmin || roles.some(item=>item.role==="docente_autor")} reviewer={roles.some(item=>item.role==="docente_revisor")}/>;
}
