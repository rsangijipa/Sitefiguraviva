"use server";

import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { publishEvent } from "@/lib/events/bus";
import { randomUUID } from "crypto";

export async function checkInEvent(checkInCode: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const uid = session.uid;

  const supabase = createSupabaseServiceClient();

  // 1. Find Event by Code or ID
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .or(`id.eq.${checkInCode},check_in_code.eq.${checkInCode}`)
    .in("status", ["live", "scheduled"])
    .maybeSingle();

  if (eventError || !event) {
    return { success: false, message: "Código inválido ou evento expirado." };
  }

  // 2. Register Presence (Idempotent)
  const { data: existingCheckIn } = await supabase
    .from("event_attendance")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", uid)
    .maybeSingle();

  if (existingCheckIn) {
    return {
      success: true,
      message: "Presença já confirmada anteriormente.",
      alreadyRegistered: true,
      eventTitle: event.title,
    };
  }

  const now = new Date().toISOString();

  const { error: insertError } = await supabase
    .from("event_attendance")
    .insert({
      id: randomUUID(),
      event_id: event.id,
      user_id: uid,
      timestamp: now,
      method: "qr_code",
    });

  if (insertError) {
    console.error("Attendance insert error:", insertError);
    return { success: false, message: "Erro ao registrar presença." };
  }

  // 3. Publish Event (For Certificates/Analytics)
  await publishEvent({
    type: "LESSON_COMPLETED",
    actorUserId: uid,
    targetId: event.id,
    context: {
      courseId: event.course_id || undefined,
    },
    payload: {
      method: "qr_checkin",
      eventTitle: event.title,
    },
  });

  return {
    success: true,
    message: "Presença confirmada com sucesso!",
    eventTitle: event.title,
  };
}
