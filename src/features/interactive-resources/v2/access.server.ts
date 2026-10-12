import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { resourceDatabase } from "./database.server";
import { retentionExpiry, type FormationOption } from "./contracts";
import { z } from "zod";

export async function resourceSession() {
  const session = await verifySession();
  if (!session?.isActive || (await cookies()).has("admin_session_backup")) return null;
  return session;
}
export async function hasFormationAccess(uid: string): Promise<boolean> {
  return !!(await eligibleEnrollments(uid)).length;
}
async function eligibleEnrollments(uid:string) {
  const db=createSupabaseServiceClient();
  const memberships=await db.from("enrollments").select("id,course_id").eq("user_id",uid).in("status",["active","completed"]);
  if(memberships.error || !memberships.data?.length)return [];
  const courses=await db.from("courses").select("id").in("id",[...new Set(memberships.data.map(item=>item.course_id))]).eq("is_published",true).in("status",["open","closed"]);
  if(courses.error)return [];
  const eligible=new Set(courses.data?.map(item=>item.id));
  return memberships.data.filter(item=>eligible.has(item.course_id));
}
export async function editorialPermissions(uid: string) {
  const { data, error } = await resourceDatabase().from("resource_editorial_roles").select("role,name,crp").eq("user_id", uid);
  if (error) throw new Error("Editorial permissions unavailable");
  return data ?? [];
}
export async function availableFormations(uid: string): Promise<FormationOption[]> {
  const db = resourceDatabase();
  const [retention, memberships] = await Promise.all([
    db.from("resource_formation_retention").select("*").eq("user_id", uid),
    eligibleEnrollments(uid),
  ]);
  if (retention.error) return [];
  const allowed = new Set(memberships.map(item => item.id));
  return (retention.data ?? []).filter(item => allowed.has(item.enrollment_id)).flatMap(item => {
    try {
      const expiresAt = retentionExpiry(item.end_date, item.departure_date);
      return new Date(expiresAt).getTime() > Date.now() ? [{ id: item.enrollment_id, title: item.title, endDate: item.end_date, expiresAt }] : [];
    } catch { return []; }
  });
}
export async function historyReleased(): Promise<boolean> {
  if (!process.env.FV_RESOURCE_DELETION_LEDGER_URL || !process.env.FV_RESOURCE_DELETION_LEDGER_TOKEN) return false;
  const { data, error } = await resourceDatabase().from("resource_release_checks").select("*").eq("id", "history-v2").maybeSingle();
  if(error || !data?.enabled || !data.release_id || data.backup_max_days<1 || data.backup_max_days>30 || !data.restoration_verified_at || !data.ledger_verified_at || !data.purge_verified_at)return false;
  try {
    const endpoint=new URL(process.env.FV_RESOURCE_DELETION_LEDGER_URL);if(endpoint.protocol!=="https:")return false;endpoint.searchParams.set("operation","status");
    const response=await fetch(endpoint,{headers:{Authorization:`Bearer ${process.env.FV_RESOURCE_DELETION_LEDGER_TOKEN}`},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(5000)});
    if(!response.ok)return false;
    const status=z.strictObject({durable:z.literal(true),historyEnabled:z.boolean(),releaseId:z.uuid()}).parse(await response.json());
    return status.historyEnabled && status.releaseId===data.release_id;
  }catch{return false;}
}
