"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";

export async function markAnnouncementRead(announcementId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!announcementId) return { success: false, error: "Invalid announcement" };

  const { error } = await (createSupabaseServiceClient() as any)
    .from("student_announcement_reads")
    .upsert(
      { user_id: session.uid, announcement_id: announcementId },
      { onConflict: "user_id,announcement_id" },
    );
  if (error) return { success: false, error: error.message };
  revalidatePath("/portal");
  return { success: true };
}
