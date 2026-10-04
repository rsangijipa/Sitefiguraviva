"use server";

import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";

interface CreateEventData {
  title: string;
  description: string;
  startsAt: string; // ISO string from form
  endsAt: string;
  type: "webinar" | "in_person";
  joinUrl?: string;
  location?: string;
  courseId?: string;
}

export async function createEvent(data: CreateEventData) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };

  if (!session.isAdmin) {
    return { error: "Forbidden: Admins only" };
  }

  try {
    // Rate limiting: Prevent abuse
    const rateLimitResult = await rateLimit(
      session.uid,
      "createEvent",
      RateLimitPresets.CREATE_EVENT,
    );

    if (!rateLimitResult.allowed) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      );
      return {
        error: `Limite de criação de eventos excedido. Aguarde ${waitSeconds}s.`,
      };
    }

    const supabase = createSupabaseServiceClient();
    const id = randomUUID();
    const startsAt = new Date(data.startsAt).toISOString();
    const endsAt = data.endsAt ? new Date(data.endsAt).toISOString() : null;

    const { error } = await supabase.from("events").insert({
      id,
      title: data.title,
      description: data.description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "scheduled",
      is_public: !data.courseId,
      course_id: data.courseId || null,
    });

    if (error) throw error;

    // Mass notification if course specific
    if (data.courseId) {
      try {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("user_id")
          .eq("course_id", data.courseId)
          .eq("status", "active");

        if (enrollments && enrollments.length > 0) {
          await Promise.all(
            enrollments.map((enr) =>
              createNotification(
                enr.user_id,
                {
                  title: "Nova Mentoria Agendada!",
                  body: `Um novo encontro foi marcado: ${data.title}. Veja data e horário na agenda.`,
                  link: "/portal/events",
                  type: "course_update",
                },
                supabase as any,
              ),
            ),
          );
        }
      } catch (err) {
        console.warn("Failed to dispatch event notifications:", err);
      }
    }

    revalidatePath("/admin/events");
    revalidatePath("/portal/events");
    return { success: true, id };
  } catch (error) {
    console.error("Create Event Error:", error);
    return { error: "Failed to create event" };
  }
}

export async function deleteEvent(eventId: string) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };

  if (!session.isAdmin) {
    return { error: "Forbidden: Admins only" };
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw error;

    await logAudit({
      actor: { uid: session.uid, email: session.email, role: session.role },
      action: "event.deleted",
      target: { collection: "events", id: eventId },
    });

    revalidatePath("/admin/events");
    revalidatePath("/portal/events");
    return { success: true };
  } catch (error) {
    console.error("Delete Event Error:", error);
    return { error: "Failed to delete event" };
  }
}

export async function updateEventStatus(
  eventId: string,
  status: "scheduled" | "live" | "ended" | "cancelled" | "canceled",
) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };

  if (!session.isAdmin) {
    return { error: "Forbidden: Admins only" };
  }

  try {
    const supabase = createSupabaseServiceClient();
    const normalizedStatus = status === "cancelled" ? "canceled" : status;

    const { error } = await supabase
      .from("events")
      .update({
        status: normalizedStatus as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) throw error;

    await logAudit({
      actor: { uid: session.uid, email: session.email, role: session.role },
      action: "event.status_updated",
      target: { collection: "events", id: eventId },
      payload: { status: normalizedStatus },
    });

    revalidatePath("/admin/events");
    revalidatePath("/portal/events");
    return { success: true };
  } catch (error) {
    console.error("Update Event Status Error:", error);
    return { error: "Failed to update event status" };
  }
}
