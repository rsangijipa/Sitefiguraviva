import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export async function logSystemError(
  source: string,
  message: string,
  context: Record<string, any> = {},
  severity: "info" | "warning" | "error" | "critical" = "error",
) {
  try {
    const { error } = await createSupabaseServiceClient()
      .from("audit_logs")
      .insert({
        event_type: `system.${severity}`,
        actor_user_id: null,
        actor_email: "system",
        target_collection: source,
        target_id: "system",
        payload: { message, context, resolved: false },
      });
    if (error) throw error;
  } catch (err) {
    console.error("FAILED TO LOG TO SUPABASE:", err);
    console.error(`[${source}] ${message}`, context);
  }
}

export async function logServerEvent(
  eventName: string,
  payload: Record<string, any> = {},
  userId?: string,
) {
  try {
    const { error } = await createSupabaseServiceClient()
      .from("audit_logs")
      .insert({
        event_type: eventName,
        actor_user_id: userId || null,
        target_collection: "server_events",
        target_id: eventName,
        payload,
      });
    if (error) throw error;
  } catch (err) {
    console.error("FAILED TO LOG EVENT:", err);
  }
}
