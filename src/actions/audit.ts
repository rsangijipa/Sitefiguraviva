"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";

/** Returns audit rows in the shape consumed by the administration interface. */
export async function getAuditLogs(limitCount = 50, startAfterDocId?: string) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };
  if (!session.isAdmin) return { error: "Forbidden" };

  try {
    const safeLimit = Math.min(Math.max(Math.floor(limitCount), 1), 100);
    const supabase = createSupabaseServiceClient();
    let cursorCreatedAt: string | undefined;
    if (startAfterDocId) {
      const { data: cursor, error: cursorError } = await supabase
        .from("audit_logs")
        .select("created_at")
        .eq("id", startAfterDocId)
        .maybeSingle();
      if (cursorError) throw cursorError;
      cursorCreatedAt = cursor?.created_at;
    }
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(safeLimit);
    if (cursorCreatedAt) query = query.lt("created_at", cursorCreatedAt);
    const { data, error } = await query;
    if (error) throw error;

    return {
      success: true,
      logs: (data || []).map((row) => ({
        id: row.id,
        timestamp: row.created_at,
        eventType: row.event_type,
        actor: {
          uid: row.actor_user_id,
          email: row.actor_email,
          role: row.actor_role,
        },
        target: { collection: row.target_collection, id: row.target_id },
        payload: row.payload,
        diff: row.diff,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    return { error: "Internal Server Error" };
  }
}
