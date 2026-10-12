"use client";
import Link from "next/link";
import { useEffect,useRef,useState } from "react";
import { resourceHref,type ResourceDefinition } from "@/components/resources/resourceCatalog";
import { getSavingOptions,savePrivateResourceRecord } from "./records.actions";
import { recordSchemas,type FormationOption,type RecordResourceKey } from "./contracts";
import { Button } from "./ui";

export function SaveBar({resource,payload,contentVersion,preview,onDiscard}:{
 resource:ResourceDefinition;payload:unknown;contentVersion:string|null;preview:boolean;onDiscard:()=>void;
}) {
 const [formations,setFormations]=useState<FormationOption[]>([]); const [formation,setFormation]=useState("");
 const [enabled,setEnabled]=useState(false); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false); const [saved,setSaved]=useState(false);
 const [anonymous,setAnonymous]=useState(false); const request=useRef<string|null>(null);
 const schema=recordSchemas[resource.slug as RecordResourceKey];
 const valid=!!schema && schema.safeParse(payload).success;
 useEffect(()=>{
  if(preview || !valid) return;
  let active=true;
  void getSavingOptions().then(result=>{
   if(!active) return;
   if(result.ok===false) {setMessage(result.error);setAnonymous(result.code==="unauthenticated");return;}
   setFormations(result.data.formations);setFormation(result.data.formations[0]?.id ?? "");setEnabled(result.data.enabled);
   if(!result.data.enabled) setMessage("O histórico aguarda a validação de retenção e recuperação. Você pode encerrar sem guardar.");
   else if(!result.data.formations.length) setMessage("Não há formação com data e prazo válidos para guardar este registro.");
  }).catch(()=>{if(active)setMessage("O histórico está indisponível. Você pode encerrar sem guardar.");});
  return ()=>{active=false;};
 },[preview,valid]);
 const save=async()=>{
  setBusy(true);setMessage("");request.current ??=crypto.randomUUID();
  try {
   const result=await savePrivateResourceRecord({resourceKey:resource.slug,schemaVersion:1,formationId:formation,clientRequestId:request.current,contentVersion,payload});
   if(result.ok===false) setMessage(result.error);
   else {setSaved(true);setMessage(`Registro guardado até ${new Date(result.data.expiresAt).toLocaleDateString("pt-BR")}.`);}
  } catch {setMessage("Não foi possível guardar. Seu texto continua nesta tela.");}
  finally {setBusy(false);}
 };
 return <div>
  {valid && !preview && !!formations.length && <label className="fv-field"><span>Formação deste registro</span><select value={formation} disabled={busy||saved} onChange={event=>{setFormation(event.target.value);request.current=null;}}>{formations.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
  {formation && <p className="fv-note">Prazo máximo: {new Date(formations.find(item=>item.id===formation)?.expiresAt ?? "").toLocaleDateString("pt-BR")}. Você pode exportar ou excluir antes.</p>}
  {message && <p role={saved ? "status" : "alert"} className={saved ? "fv-note" : "fv-error"}>{message}</p>}
  {anonymous && <><Link href={`/auth?next=${encodeURIComponent(resourceHref(resource))}`}>Entrar na área do aluno</Link><p className="fv-note">Ao sair desta tela, o registro não guardado será descartado.</p></>}
  <div className="fv-actions">{valid && !preview && <Button onClick={()=>void save()} disabled={!enabled || !formation || busy || saved}>{busy ? "Guardando…" : saved ? "Guardado" : "Guardar no meu histórico"}</Button>}<Button secondary onClick={onDiscard}>{saved ? "Voltar aos recursos" : "Encerrar sem guardar"}</Button></div>
 </div>;
}
