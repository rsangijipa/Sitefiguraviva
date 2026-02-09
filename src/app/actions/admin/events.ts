"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function assertAdmin() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  const token = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!token.admin && token.role !== "admin") throw new Error("Forbidden");
  return token;
}

export async function createEvent(data: {
  title: string;
  description: string;
  startsAt: Date;
  endsAt?: Date;
  meetingUrl?: string;
  courseId?: string;
  isPublic: boolean;
}) {
  try {
    await assertAdmin();

    const eventData = {
      ...data,
      startsAt: Timestamp.fromDate(new Date(data.startsAt)),
      endsAt: data.endsAt ? Timestamp.fromDate(new Date(data.endsAt)) : null,
      status: "scheduled",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await adminDb.collection("events").add(eventData);

    revalidatePath("/portal");
    revalidatePath("/admin/events");

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Create Event Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await assertAdmin();
    await adminDb.collection("events").doc(eventId).delete();
    revalidatePath("/portal");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
