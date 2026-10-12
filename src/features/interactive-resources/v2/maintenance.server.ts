import "server-only";
import { z } from "zod";
import { RECORD_TABLES,resourceDatabase } from "./database.server";
import { appendDeletionReceipt } from "./deletion-ledger.server";

// This module has no client action. An authenticated operational worker runs it
// daily; receipts contain only table/id and must be durable before physical delete.
export async function purgeExpiredResourceRecords() {
 const db=resourceDatabase();const cutoff=new Date().toISOString();let deleted=0;
 for(const table of RECORD_TABLES) {
  for(let batch=0;batch<20;batch++) {
   const result=await db.from(table).select("id").lte("expires_at",cutoff).order("id").limit(500);
   if(result.error)throw new Error("purge unavailable");
   const rows=result.data??[];if(!rows.length)break;
   await appendDeletionReceipt(rows.map(row=>({table,id:row.id})));
   const removed=await db.from(table).delete().in("id",rows.map(row=>row.id)).lte("expires_at",cutoff).select("id");
   if(removed.error)throw new Error("purge unconfirmed");
   deleted+=removed.data?.length??0;
  }
 }
 const pending=await Promise.all(RECORD_TABLES.map(table=>db.from(table).select("id",{count:"exact",head:true}).lte("expires_at",cutoff)));
 if(pending.some(result=>result.error))throw new Error("purge unconfirmed");
 return {deleted,pending:pending.reduce((total,result)=>total+(result.count??0),0)};
}

const ReceiptPage=z.strictObject({durable:z.literal(true),snapshot:z.string().min(1).max(200),nextCursor:z.string().max(500).nullable(),records:z.array(z.strictObject({table:z.enum(RECORD_TABLES),id:z.uuid()})).max(1000)});
export async function replayResourceDeletionsAfterRestore() {
 const db=resourceDatabase();
 const endpoint=process.env.FV_RESOURCE_DELETION_LEDGER_URL;const token=process.env.FV_RESOURCE_DELETION_LEDGER_TOKEN;
 if(!endpoint?.startsWith("https://") || !token)throw new Error("ledger unavailable");
 const locked=await fetch(endpoint,{method:"PUT",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({historyEnabled:false}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
 if(!locked.ok)throw new Error("external restore lock unavailable");
 const lock=z.strictObject({durable:z.literal(true),historyEnabled:z.literal(false),releaseId:z.uuid()}).parse(await locked.json());
 if(lock.historyEnabled!==false)throw new Error("external restore lock unconfirmed");
 const disabled=await db.from("resource_release_checks").update({enabled:false,restoration_verified_at:null}).eq("id","history-v2");
 if(disabled.error)throw new Error("restore lock unavailable");
 let cursor:string|null=null;let snapshot:string|null=null;let deleted=0;const seen=new Set<string>();
 do {
  const url=new URL(endpoint);url.searchParams.set("operation","restore");
  if(cursor)url.searchParams.set("cursor",cursor);if(snapshot)url.searchParams.set("snapshot",snapshot);
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("ledger unavailable");const page=ReceiptPage.parse(await response.json());
  if(snapshot && page.snapshot!==snapshot)throw new Error("ledger snapshot changed");snapshot=page.snapshot;
  for(const table of RECORD_TABLES){const ids=page.records.filter(record=>record.table===table).map(record=>record.id);if(!ids.length)continue;
   const result=await db.from(table).delete().in("id",ids).select("id");if(result.error)throw new Error("restore deletion unconfirmed");deleted+=result.data?.length??0;
  }
  cursor=page.nextCursor;if(cursor && seen.has(cursor))throw new Error("ledger cursor repeated");if(cursor)seen.add(cursor);
 }while(cursor);
 const purge=await purgeExpiredResourceRecords();if(purge.pending)throw new Error("expired records remain");
 // Intentionally never enables history. Operator validates backups and recovery
 // while the whole site is in maintenance before signing a new release evidence.
 return {deleted:deleted+purge.deleted,snapshot,historyEnabled:false};
}

export async function eraseResourceRecordsForAccount(uid:string) {
 const db=resourceDatabase();
 for(const table of RECORD_TABLES) {
  for(;;){const rows=await db.from(table).select("id").eq("user_id",uid).order("id").limit(500);
   if(rows.error)throw new Error("account records unavailable");if(!rows.data?.length)break;
   await appendDeletionReceipt(rows.data.map(row=>({table,id:row.id})));
   const deleted=await db.from(table).delete().eq("user_id",uid).in("id",rows.data.map(row=>row.id));if(deleted.error)throw new Error("account deletion unconfirmed");
  }
 }
}
export async function prepareResourceAccountErasure(uid:string) {
 const current=await resourceDatabase().from("resource_release_checks").select("id").eq("id","history-v2").maybeSingle();
 // Compatibility before this local migration is applied. Other errors fail closed.
 if(current.error && ["42P01","PGRST205"].includes(current.error.code))return;
 if(current.error)throw new Error("account resource check unavailable");
 if(current.data)await eraseResourceRecordsForAccount(uid);
}
