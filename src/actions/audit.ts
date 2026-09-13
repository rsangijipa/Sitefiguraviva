"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export async function getAuditLogs(limitCount = 50, startAfterDocId?: string) {
  try {
    await requireAdmin();
    const safeLimit = Math.min(Math.max(Math.floor(limitCount), 1), 100);
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("audit_logs")
      .select(
        "id,event_type,actor_user_id,actor_email,actor_role,target_collection,target_id,payload,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(safeLimit);
    if (startAfterDocId) query = query.lt("id", startAfterDocId);
    const { data, error } = await query;
    if (error) throw error;
    const logs = (data ?? []).map((log) => ({
      id: log.id,
      action: log.event_type,
      eventType: log.event_type,
      timestamp: log.created_at,
      actor: {
        uid: log.actor_user_id ?? "system",
        email: log.actor_email ?? undefined,
        role: log.actor_role ?? undefined,
      },
      target: { collection: log.target_collection, id: log.target_id },
      payload: log.payload,
    }));
    return { success: true, logs };
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    return { error: "Internal Server Error" };
  }
}
