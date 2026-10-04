"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin as assertAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { randomUUID } from "crypto";

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

    const supabase = createSupabaseServiceClient();
    const id = randomUUID();
    const { error } = await supabase.from("events").insert({
      id,
      title: data.title,
      description: data.description,
      starts_at: new Date(data.startsAt).toISOString(),
      ends_at: data.endsAt ? new Date(data.endsAt).toISOString() : null,
      status: "scheduled",
      is_public: data.isPublic,
      course_id: data.courseId ?? null,
    });
    if (error) throw error;

    revalidatePath("/portal");
    revalidatePath("/admin/events");

    return { success: true, id };
  } catch (error: any) {
    console.error("Create Event Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw error;
    revalidatePath("/portal");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
