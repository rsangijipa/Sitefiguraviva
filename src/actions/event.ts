"use server";

import { auth, db, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";

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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    // Rate limiting: Prevent abuse
    const rateLimitResult = rateLimit(
      claims.uid,
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

    const eventsRef = db.collection("events");

    const eventDoc = await eventsRef.add({
      title: data.title,
      description: data.description,
      startsAt: Timestamp.fromDate(new Date(data.startsAt)),
      endsAt: data.endsAt ? Timestamp.fromDate(new Date(data.endsAt)) : null,
      type: data.type,
      provider: data.type === "webinar" ? "google_meet" : "onsite",
      status: "scheduled",
      joinUrl: data.joinUrl || null,
      location: data.location || null,
      courseId: data.courseId || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: claims.uid,
    });

    // 🔔 Mass Notification Logic
    if (data.courseId) {
      const enrollmentsSnap = await adminDb
        .collection("enrollments")
        .where("courseId", "==", data.courseId)
        .where("status", "==", "active")
        .get();

      if (!enrollmentsSnap.empty) {
        const batch = adminDb.batch();
        enrollmentsSnap.docs.forEach((enrollDoc) => {
          const studentUid = enrollDoc.data().uid;
          const notificationRef = adminDb
            .collection("users")
            .doc(studentUid)
            .collection("notifications")
            .doc();

          batch.set(notificationRef, {
            title: "Nova Mentoria Agendada!",
            body: `Um novo encontro foi marcado: ${data.title}. Veja data e horário na agenda.`,
            link: "/portal/events",
            type: "event_scheduled",
            isRead: false,
            createdAt: Timestamp.now(),
          });
        });
        await batch.commit();
      }
    }

    revalidatePath("/admin/events");
    revalidatePath("/portal/events");
    return { success: true, id: eventDoc.id };
  } catch (error) {
    console.error("Create Event Error:", error);
    return { error: "Failed to create event" };
  }
}

export async function deleteEvent(eventId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    await db.collection("events").doc(eventId).delete();

    // Audit
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "EVENT_DELETED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id: eventId, collection: "events" },
      }),
    );

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
  status: "scheduled" | "live" | "ended" | "cancelled",
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin" && claims.admin !== true) {
      return { error: "Forbidden: Admins only" };
    }

    await db.collection("events").doc(eventId).update({
      status,
      updatedAt: Timestamp.now(),
    });

    // Audit
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "EVENT_STATUS_UPDATED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id: eventId, collection: "events" },
        payload: { status },
      }),
    );

    revalidatePath("/admin/events");
    revalidatePath("/portal/events");
    return { success: true };
  } catch (error) {
    console.error("Update Event Status Error:", error);
    return { error: "Failed to update event status" };
  }
}
