import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { purgeExpiredResourceRecords,replayResourceDeletionsAfterRestore } from "@/features/interactive-resources/v2/maintenance.server";
export const runtime="nodejs";
export const maxDuration=300;
export async function POST(request:Request){
 const secret=process.env.FV_RESOURCE_MAINTENANCE_TOKEN;const token=request.headers.get("authorization")?.replace(/^Bearer /,"")??"";
 if(!secret || Buffer.byteLength(token)!==Buffer.byteLength(secret) || !timingSafeEqual(Buffer.from(token),Buffer.from(secret)))return NextResponse.json({error:"unauthorized"},{status:401});
 try {const body:unknown=await request.json();if(!body || typeof body!=="object" || !("operation" in body) || Object.keys(body).length!==1 || !["purge","restore"].includes(String(body.operation)))return NextResponse.json({error:"invalid"},{status:400});
  return NextResponse.json(body.operation==="restore"?await replayResourceDeletionsAfterRestore():await purgeExpiredResourceRecords(),{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"maintenance_unconfirmed"},{status:503});}
}
