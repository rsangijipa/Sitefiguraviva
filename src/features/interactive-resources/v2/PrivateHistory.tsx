"use client";
import { useEffect,useState,useCallback } from "react";
import { listPrivateResourceRecords,deletePrivateResourceRecord,exportPrivateResourceRecords } from "./records.actions";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import type { PrivateRecord } from "./contracts";
import { Button,Dialog } from "./ui";
import { RecordSummary } from "./RecordSummary";
import Link from "next/link";
import { LegacyImport } from "./LegacyImport";
export function PrivateHistory() {
 const [records,setRecords]=useState<PrivateRecord[]>([]);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 const [selected,setSelected]=useState<PrivateRecord|null>(null);const [busy,setBusy]=useState(false);
 const [more,setMore]=useState(false);
 const load=useCallback(async(cursor?:{createdAt:string;id:string})=>{setLoading(true);try{const result=await listPrivateResourceRecords(cursor);if(result.ok===false)setError(result.error);else{setRecords(existing=>cursor?[...existing,...result.data]:result.data);setMore(result.data.length===50);setError("");}}catch{setError("Não foi possível consultar o histórico.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 const exportData=async()=>{
  setBusy(true);try{const result=await exportPrivateResourceRecords();if(result.ok===false){setError(result.error);return;}const url=URL.createObjectURL(new Blob([result.data],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download="meus-registros-figura-viva.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError("Não foi possível exportar.");}finally{setBusy(false);}
 };
 const remove=async()=>{
  if(!selected)return;setBusy(true);
  try{const result=await deletePrivateResourceRecord(selected.resourceKey,selected.id);if(result.ok===false)setError(result.error);else{setSelected(null);await load();}}catch{setError("Não foi possível confirmar a exclusão.");}finally{setBusy(false);}
 };
 return <section className="fv-resources" data-register="institucional"><div className="fv-content"><Link href="/portal/recursos">Voltar aos recursos</Link><h1>Meus registros</h1><p>Este histórico é privado. Você pode exportar ou excluir seus registros.</p><p className="fv-note">Os registros expiram até seis meses após o fim ou desligamento da formação. Legados sem vínculo têm prazo transitório informado em cada registro.</p>
 {error && <p className="fv-error" role="alert">{error}</p>}{loading ? <p role="status">Consultando seu histórico…</p> : !records.length && !error ? <p>Você ainda não guardou registros.</p> : <ul className="fv-list">{records.map(item=><li key={item.id}><h2>{resourceCatalog.find(resource=>resource.slug===item.resourceKey)?.title ?? "Registro"}</h2><p className="fv-reference">{new Date(item.createdAt).toLocaleString("pt-BR")} · disponível até {new Date(item.expiresAt).toLocaleDateString("pt-BR")}</p>{item.legacy ? <p>Registro de formato anterior. A exportação preserva seu conteúdo original.</p> : <RecordSummary payload={item.payload} labels={item.labels}/>}<Button secondary onClick={()=>setSelected(item)}>Excluir este registro</Button></li>)}</ul>}
 <div className="fv-actions">{more && <Button secondary onClick={()=>{const last=records.at(-1);if(last)void load({createdAt:last.createdAt,id:last.id});}} disabled={loading||busy}>Carregar registros anteriores</Button>}<Button secondary onClick={()=>void load()} disabled={loading || busy}>Atualizar</Button><Button onClick={()=>void exportData()} disabled={loading || busy || !records.length}>Exportar todos os meus registros</Button></div>
 <Dialog title="Excluir este registro?" open={!!selected} onClose={()=>setSelected(null)}><p>O registro será removido do histórico. Cópias restritas de recuperação expiram em até 30 dias.</p><Button onClick={()=>void remove()} disabled={busy}>{busy ? "Excluindo…" : "Excluir registro"}</Button></Dialog>
 <LegacyImport onImported={()=>void load()}/></div></section>;
}
