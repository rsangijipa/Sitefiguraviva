"use server";
import { createHash } from "node:crypto";
import { resourceSession } from "./access.server";
import { LegacyImportSchema,decodeLegacyImport,validateImportedPayload } from "./legacy-import";
import { savePrivateResourceRecord } from "./records.actions";
import type { ResourceResult } from "./contracts";
export async function importOwnLegacyRecords(input:unknown):Promise<ResourceResult<{imported:number}>> {
 const session=await resourceSession();if(!session)return {ok:false,code:"unauthenticated",error:"Entre antes de decidir sobre registros locais."};
 try {
  const request=LegacyImportSchema.parse(input);
  const rows=decodeLegacyImport(request.sourceKey,request.records,session.uid);
  // Validate the entire batch first. Refused records are never dropped or clipped.
  const validated=rows.map((row,index)=>{const hash=createHash("sha256").update(JSON.stringify([session.uid,request.sourceKey,index,row])).digest("hex");const id=`${hash.slice(0,8)}-${hash.slice(8,12)}-5${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;return validateImportedPayload(row.resourceKey,row.payload,request.formationId,id);});
  for(const record of validated){const result=await savePrivateResourceRecord(record);if(result.ok===false)return result;}
  return {ok:true,data:{imported:validated.length}};
 }catch{return {ok:false,code:"invalid",error:"Não foi importado: proprietário diferente, formato incompatível ou limite excedido. Os originais continuam no navegador; exporte para preservá-los."};}
}
