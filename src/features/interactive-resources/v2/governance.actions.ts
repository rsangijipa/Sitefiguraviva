"use server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { resourceSession } from "./access.server";
import { resourceDatabase } from "./database.server";
import { ArtManifestSchema, isBrandAsset } from "./editorial-schema";
import { publishedEditorial } from "./editorial.server";
import type { ResourceResult } from "./contracts";

const GovernanceSchema = z.discriminatedUnion("kind", [
 z.strictObject({kind:z.literal("role"), userId:z.uuid(), role:z.enum(["docente_autor","docente_revisor"]),name:z.string().trim().min(3).max(160),crp:z.string().regex(/^[0-9]{2}\/[0-9]{3,8}$/),remove:z.boolean()}),
 z.strictObject({kind:z.literal("formation"),enrollmentId:z.uuid(),endDate:z.iso.datetime({offset:true}),departureDate:z.iso.datetime({offset:true}).nullable()}),
 z.strictObject({kind:z.literal("art"),kitVersion:z.string().min(1).max(100),approvedAt:z.iso.datetime({offset:true}),evidence:z.string().trim().min(10).max(2000),assets:ArtManifestSchema}),
 z.strictObject({kind:z.literal("pilot"),resourceKey:z.enum(["laboratorio-fenomenologico","atelie-do-experimento","escuta-dialogica"]),passedAt:z.iso.datetime({offset:true}),evidence:z.string().trim().min(10).max(2000)}),
]);
export async function registerResourceGovernance(input:unknown):Promise<ResourceResult<string>> {
 const session=await resourceSession();
 if(!session?.isAdmin)return {ok:false,code:"forbidden",error:"Administração necessária para registrar evidências e permissões."};
 const parsed=GovernanceSchema.safeParse(input);
 if(!parsed.success)return {ok:false,code:"invalid",error:"Confira os campos obrigatórios e as evidências."};
 try {
  const params=parsed.data;const db=resourceDatabase();
  if(params.kind==="role") {
   const profile=await createSupabaseServiceClient().from("profiles").select("id").eq("id",params.userId).maybeSingle();
   if(profile.error || !profile.data)throw new Error();
   const result=params.remove ? await db.from("resource_editorial_roles").delete().eq("user_id",params.userId).eq("role",params.role) : await db.from("resource_editorial_roles").upsert({user_id:params.userId,role:params.role,name:params.name,crp:params.crp},{onConflict:"user_id,role"});
   if(result.error)throw new Error();return {ok:true,data:"Permissão editorial atualizada."};
  }
  if(params.kind==="formation") {
   const enrollment=await createSupabaseServiceClient().from("enrollments").select("id,user_id,course_id").eq("id",params.enrollmentId).maybeSingle();
   if(enrollment.error || !enrollment.data)throw new Error();
   const row=enrollment.data;
   const course=await createSupabaseServiceClient().from("courses").select("title").eq("id",row.course_id).maybeSingle();
   if(course.error || !course.data)throw new Error();
   // A departure already recorded is preserved when a later end date is entered.
   const current=await db.from("resource_formation_retention").select("departure_date").eq("enrollment_id",row.id).maybeSingle();
   if(current.error)throw new Error();
   const departure=[current.data?.departure_date,params.departureDate].filter((value):value is string=>!!value).sort()[0]??null;
   const result=await db.from("resource_formation_retention").upsert({enrollment_id:row.id,user_id:row.user_id,course_id:row.course_id,title:course.data.title,end_date:params.endDate,departure_date:departure},{onConflict:"enrollment_id"});
   if(result.error)throw new Error();return {ok:true,data:"Prazo da formação registrado. Registros anteriores não são prorrogados."};
  }
  if(params.kind==="art") {
   if(!params.assets.length || new Date(params.approvedAt)>new Date())throw new Error();
   for(const asset of params.assets) {
    if(!isBrandAsset(asset.path,asset.role==="audio"?"audio":"image"))throw new Error();
    const bytes=await readFile(join(process.cwd(),"public",asset.path));
    if(createHash("sha256").update(bytes).digest("hex")!==asset.sha256)throw new Error();
   }
   const result=await db.from("resource_art_approvals").insert({kit_version:params.kitVersion,approved_by:"Lilian Gusmão",approved_at:params.approvedAt,assets:params.assets,evidence:params.evidence}).select("id").single();
   if(result.error || !result.data)throw new Error();return {ok:true,data:`Curadoria registrada: ${result.data.id}`};
  }
  const version=await publishedEditorial(params.resourceKey);
  if(!version || new Date(params.passedAt)>new Date())throw new Error();
  const result=await db.from("resource_pilots").upsert({resource_key:params.resourceKey,passed_at:params.passedAt,verified_by:session.uid,evidence:params.evidence,content_version:version.id},{onConflict:"resource_key"});
  if(result.error)throw new Error();return {ok:true,data:"Piloto registrado para a versão publicada."};
 } catch {return {ok:false,code:"invalid",error:"O registro não foi concluído. Confira o vínculo, as licenças e as evidências reais."};}
}
