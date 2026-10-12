import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { resourceDatabase } from "./database.server";
import { retentionExpiry, type FormationOption } from "./contracts";

export async function resourceSession() {
  const session = await verifySession();
  if (!session?.isActive || (await cookies()).has("admin_session_backup")) return null;
  return session;
}
export async function hasFormationAccess(uid: string): Promise<boolean> {
  const { data, error } = await createSupabaseServiceClient().from("enrollments")
    .select("course_id,courses!inner(is_published,status)").eq("user_id", uid)
    .in("status", ["active", "completed"]).eq("courses.is_published", true).in("courses.status", ["open", "closed"]).limit(1);
  return !error && !!data?.length;
}
export async function editorialPermissions(uid: string) {
  const { data, error } = await resourceDatabase().from("resource_editorial_roles").select("role,name,crp").eq("user_id", uid);
  if (error) return [];
  return data ?? [];
}
export async function availableFormations(uid: string): Promise<FormationOption[]> {
  const db = resourceDatabase();
  const [retention, memberships] = await Promise.all([
    db.from("resource_formation_retention").select("*").eq("user_id", uid),
    db.from("enrollments").select("id").eq("user_id", uid).in("status", ["active", "completed"]),
  ]);
  if (retention.error || memberships.error) return [];
  const allowed = new Set(memberships.data?.map(item => item.id));
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
  return !error && !!data?.enabled && data.backup_max_days > 0 && data.backup_max_days <= 30 &&
    !!data.restoration_verified_at && !!data.ledger_verified_at && !!data.purge_verified_at;
}
