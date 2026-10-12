import { z } from "zod";
import { validateRecord,BODY_REGIONS,SENSATIONS,type BodyPoint,type ResourceKey } from "./contracts";
export const LEGACY_KEYS=["aqui_e_agora_perceptions_v1","duas_cadeiras_sessions_v1","fv_pause_sessions","figura_viva_diary_entries_v1","figura-viva:jardim-de-pensamentos:entries","figura_viva_listening_entries_v1","figura_viva_river_sessions_v1","gestalt_cards_favorites_v1","gestalt_cards_review_v1","fronteiras_diary_entries","figura_viva_cycle_sessions_v1","mentequiz_results","checkin-corporal-state"] as const;
export const LegacyImportSchema=z.strictObject({sourceKey:z.enum(LEGACY_KEYS),formationId:z.uuid(),confirmation:z.literal("estes registros são meus"),records:z.unknown()});
const optionalOwner={userId:z.string().max(120).optional(),user_id:z.string().max(120).optional(),ownerId:z.string().max(120).optional()};
const str=z.string().max(500);
const ArrivalLegacy=z.strictObject({id:z.string().max(120),createdAt:z.string().max(80),attention:str,body:str,feeling:str,need:str,reflection:str,...optionalOwner});
const Chair=z.strictObject({id:z.enum(["A","B"]),name:z.string().max(60),sublabel:z.string().max(160),accentColor:z.string().max(80)});
const ChairsLegacy=z.strictObject({id:z.string().max(120),title:z.string().max(160),chairA:Chair,chairB:Chair,turns:z.array(z.strictObject({id:z.string().max(120),chairId:z.enum(["A","B"]),speakerName:z.string().max(60),text:str,timestamp:z.number()})).max(12),closingReflection:str.optional(),createdAt:z.number(),updatedAt:z.number(),isCompleted:z.boolean(),...optionalOwner});
const PauseLegacy=z.strictObject({id:z.string().max(120),userId:z.string().max(120),practiceId:z.enum(["breathing","observing","listening","movement","slowing"]),plannedDurationSeconds:z.number().max(3600),activeDurationSeconds:z.number().int().min(0).max(86400),endedBy:z.enum(["timer","user","switch"]),reflection:str.nullable(),contentVersion:z.string().max(120),createdAt:z.string().max(80),clientRequestId:z.string().max(120)});
const DiaryLegacy=z.strictObject({id:z.string().max(120),user_id:z.string().max(120),resource_slug:z.literal("roda-das-emocoes"),session_id:z.string().max(120),payload:z.strictObject({emotionId:z.string().max(80),intensity:z.number().int().min(1).max(5),reflection:str}),is_private:z.literal(true),created_at:z.string().max(80),updated_at:z.string().max(80)});
const WheelOriginal=DiaryLegacy.extend({payload:z.strictObject({emotion_family:z.string().max(80).optional(),emotion_label:z.string().max(80).optional(),nuance_label:z.string().max(80).optional(),custom_label:z.string().max(80).optional(),intensity:z.number().int().min(1).max(5),body_note:str.optional(),reflection:str.optional(),phenomenological_description:z.string().max(3000).optional()})});
const GardenLegacy=z.strictObject({id:z.string().max(120),user_id:z.string().max(120),resource_slug:z.literal("jardim-de-pensamentos"),session_id:z.string().max(120).nullable(),payload:z.strictObject({text:str,action:z.string().max(80),botanical_form:z.string().max(80).optional(),notes:str.optional()}),is_private:z.literal(true),created_at:z.string().max(80),updated_at:z.string().max(80)});
const SoundObservation=z.strictObject({soundId:z.string().max(80),soundVersion:z.string().max(120),configuredPosition:z.strictObject({x:z.number().min(-1).max(1),y:z.number().min(-1).max(1),distanceTier:z.enum(["perto","medio","longe"]),label:z.string().max(120).optional()}),perceivedDirection:z.enum(["esquerda","centro","direita","frente","atras","nao_sei"]).nullable(),perceivedDistance:z.enum(["perto","intermediario","longe","nao_sei"]).nullable(),qualities:z.array(z.enum(["suave","continuo","intermitente","grave","agudo"])).max(5),customQuality:z.string().max(120).nullable(),revealedAt:z.string().max(80).optional()});
const SoundLegacy=z.strictObject({id:z.string().max(120),userId:z.string().max(120),resourceSlug:z.literal("sons-para-awareness"),sessionId:z.string().max(120),clientRequestId:z.string().max(120),schemaVersion:z.number().int(),contentVersion:z.string().max(120),mode:z.enum(["free","guided","text"]),durationSeconds:z.number().min(0).max(86400),observations:z.array(SoundObservation).max(10),personalReflection:str.nullable(),isPrivate:z.literal(true),createdAt:z.string().max(80),updatedAt:z.string().max(80)});
const RiverLegacy=z.strictObject({id:z.string().max(120),user_id:z.string().max(120),client_request_id:z.string().max(120),resource_slug:z.literal("rio-dos-pensamentos"),started_at:z.string().max(80),completed_at:z.string().max(80).optional(),active_duration_seconds:z.number().min(0).max(86400),planned_duration_seconds:z.number().max(86400).nullable().optional(),mode:z.enum(["free","timed"]),reflection:str.nullable().optional(),schema_version:z.number().int(),content_version:z.string().max(120),metadata:z.strictObject({}).optional(),created_at:z.string().max(80),updated_at:z.string().max(80).optional()});
const CheckinLegacy=z.strictObject({arrivalAnswers:z.array(z.string().max(120)).max(4),bodyMarks:z.partialRecord(z.enum(["head","neck","chest","abdomen","left-arm","right-arm","left-leg","right-leg","feet"]),z.enum(SENSATIONS).optional()),bodyNotes:z.partialRecord(z.enum(["head","neck","chest","abdomen","left-arm","right-arm","left-leg","right-leg","feet"]),z.string().max(90)),currentStep:z.number().int().min(0).max(3)});
export function decodeLegacyImport(sourceKey:typeof LEGACY_KEYS[number],records:unknown,uid:string):{resourceKey:ResourceKey;payload:unknown}[] {
 const rows=z.array(z.unknown()).min(1).max(100).parse(sourceKey==="checkin-corporal-state"?[records]:records);
 return rows.map(row=>{
  if(row && typeof row==="object")for(const field of ["userId","user_id","ownerId"]){const owner=(row as Record<string,unknown>)[field];if(owner!==undefined && owner!=="" && owner!==uid)throw new Error("Outro proprietário identificado.");}
  if(sourceKey==="checkin-corporal-state"){
   const item=CheckinLegacy.parse(row);const map:Record<string,typeof BODY_REGIONS[number]>={head:"cabeça",neck:"pescoço",chest:"peito",abdomen:"abdômen","left-arm":"braços","right-arm":"braços","left-leg":"pernas","right-leg":"pernas",feet:"pés"};
   const body:BodyPoint[]=Object.entries(item.bodyMarks).filter(([,sensation])=>!!sensation).map(([region,sensation])=>({region:map[region],view:"frente",sensation:sensation!,intensity:null,note:[region.startsWith("left-")?"lado esquerdo":region.startsWith("right-")?"lado direito":"",item.bodyNotes[region as keyof typeof item.bodyNotes]??""].filter(Boolean).join(" · ")}));
   return {resourceKey:"chegada",payload:{word:item.arrivalAnswers[0]??"",body,emotion:"",intensity:null,needs:[],reflection:item.arrivalAnswers.slice(1).filter(Boolean).join("\n")}};
  }
  if(sourceKey==="aqui_e_agora_perceptions_v1"){
   const item=ArrivalLegacy.parse(row);const combined=[item.body,item.feeling,item.need,item.reflection].filter(Boolean).join("\n");
   return {resourceKey:"chegada",payload:{word:item.attention,body:[],emotion:"",intensity:null,needs:[],reflection:combined}};
  }
  if(sourceKey==="duas_cadeiras_sessions_v1"){
   const item=ChairsLegacy.parse(row);return {resourceKey:"polaridades-e-cadeiras",payload:{names:[item.chairA.name,item.chairB.name],position:null,turns:item.turns.map(turn=>({side:turn.chairId==="A"?0:1,text:turn.text})),reflection:item.closingReflection??""}};
  }
  if(sourceKey==="fv_pause_sessions"){
   const item=PauseLegacy.parse(row);const practices={breathing:"respirar",observing:"observar",listening:"ouvir",movement:"movimentar",slowing:"desacelerar"};return {resourceKey:"sala-de-pausa",payload:{practice:practices[item.practiceId],seconds:item.activeDurationSeconds,reflection:item.reflection??""}};
  }
  if(sourceKey==="figura_viva_diary_entries_v1"){
   const current=DiaryLegacy.safeParse(row);if(current.success)return {resourceKey:"roda-das-emocoes",payload:current.data.payload};
   const item=WheelOriginal.parse(row);return {resourceKey:"roda-das-emocoes",payload:{emotionId:item.payload.custom_label || item.payload.emotion_label || item.payload.emotion_family || "percepcao-aberta",intensity:item.payload.intensity,reflection:[item.payload.body_note,item.payload.reflection].filter(Boolean).join("\n")}};
  }
  if(sourceKey==="figura-viva:jardim-de-pensamentos:entries"){const item=GardenLegacy.parse(row);return {resourceKey:"paisagem-de-pensamentos",payload:{mode:"jardim",thoughts:[item.payload.text],reflection:item.payload.notes??""}};}
  if(sourceKey==="figura_viva_listening_entries_v1"){const item=SoundLegacy.parse(row);return {resourceKey:"sons-para-awareness",payload:{sceneId:"",observations:item.observations.map(observation=>[observation.soundId,observation.perceivedDirection,observation.perceivedDistance,...observation.qualities,observation.customQuality].filter(Boolean).join(" · ")),reflection:item.personalReflection??""}};}
  if(sourceKey==="figura_viva_river_sessions_v1"){const item=RiverLegacy.parse(row);return {resourceKey:"paisagem-de-pensamentos",payload:{mode:"rio",thoughts:[],reflection:item.reflection??""}};}
  throw new Error("Este formato precisa de conversão específica. Exporte e preserve o original.");
 });
}
export function validateImportedPayload(resourceKey:ResourceKey,payload:unknown,formationId:string,clientRequestId:string){
 return validateRecord({resourceKey,schemaVersion:1,formationId,clientRequestId,contentVersion:null,payload});
}
