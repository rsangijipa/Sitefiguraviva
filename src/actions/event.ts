"use server";

import { randomUUID } from "crypto";
import { createNotification } from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/server";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

interface CreateEventData {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  type: "webinar" | "in_person";
  joinUrl?: string;
  location?: string;
  courseId?: string;
}

function refreshEventPages() {
  revalidatePath("/admin/events");
  revalidatePath("/portal/events");
}

export async function createEvent(data: CreateEventData) {
  try {
    const admin = await requireAdmin();
    const limited = await rateLimit(
      admin.uid,
      "createEvent",
      RateLimitPresets.CREATE_EVENT,
    );
    if (!limited.allowed) {
      return {
        error: `Limite de criação de eventos excedido. Aguarde ${Math.ceil((limited.resetAt - Date.now()) / 1000)}s.`,
      };
    }

    const supabase = createSupabaseServiceClient();
    const id = randomUUID();
    const { error } = await supabase.from("events").insert({
      id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      starts_at: new Date(data.startsAt).toISOString(),
      ends_at: data.endsAt ? new Date(data.endsAt).toISOString() : null,
      type: data.type,
      status: "scheduled",
      is_public: false,
      join_url: data.joinUrl || null,
      location: data.location || null,
      course_id: data.courseId || null,
    });
    if (error) throw error;

    if (data.courseId) {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("user_id")
        .eq("course_id", data.courseId)
        .eq("status", "active");
      if (enrollmentError) throw enrollmentError;
      await Promise.all(
        (enrollments || []).map(({ user_id }) =>
          createNotification(
            user_id,
            {
              title: "Nova Mentoria Agendada!",
              body: `Um novo encontro foi marcado: ${data.title}. Veja data e horário na agenda.`,
              link: "/portal/events",
              type: "event_scheduled" as any,
            },
            supabase,
          ),
        ),
      );
    }

    await logAudit({
      action: "EVENT_CREATED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id, collection: "events", summary: data.title },
    });
    refreshEventPages();
    return { success: true, id };
  } catch (error) {
    console.error("Create Event Error:", error);
    return { error: "Failed to create event" };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const admin = await requireAdmin();
    const { error } = await createSupabaseServiceClient()
      .from("events")
      .delete()
      .eq("id", eventId);
    if (error) throw error;
    await logAudit({
      action: "EVENT_DELETED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id: eventId, collection: "events" },
    });
    refreshEventPages();
    return { success: true };
  } catch (error) {
    console.error("Delete Event Error:", error);
    return { error: "Failed to delete event" };
  }
}

export async function updateEventStatus(
  eventId: string,
  status: "scheduled" | "live" | "ended" | "cancelled",
) {
  try {
    const admin = await requireAdmin();
    const { error } = await createSupabaseServiceClient()
      .from("events")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", eventId);
    if (error) throw error;
    await logAudit({
      action: "EVENT_STATUS_UPDATED",
      actor: { uid: admin.uid, email: admin.email, role: admin.role },
      target: { id: eventId, collection: "events" },
      metadata: { status },
    });
    refreshEventPages();
    return { success: true };
  } catch (error) {
    console.error("Update Event Status Error:", error);
    return { error: "Failed to update event status" };
  }
}
