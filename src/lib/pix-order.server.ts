import "server-only";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
export async function findPixOrder(userId: string, courseId: string) {
  const { data, error } = await createSupabaseServiceClient()
    .from("pix_orders")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
