"use server";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
export async function listApplicationsForAdmin() {
  await requireAdmin();
  const db = createSupabaseServiceClient();
  const { data, error } = await db
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar as inscrições.");
  const apps = data ?? [],
    uids = [
      ...new Set(apps.map((a) => a.user_id).filter((id): id is string => !!id)),
    ],
    ids = [...new Set(apps.map((a) => a.course_id))];
  const profiles = uids.length
    ? await db
        .from("profiles")
        .select("id,email,display_name,phone_number")
        .in("id", uids)
    : { data: [], error: null };
  const courses = ids.length
    ? await db.from("courses").select("id,title").in("id", ids)
    : { data: [], error: null };
  if (profiles.error || courses.error)
    throw new Error(
      "Não foi possível consultar as contas ou cursos das inscrições.",
    );
  const users = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  return {
    applications: apps.map((a) => ({
      ...a,
      courseId: a.course_id,
      userEmail: users.get(a.user_id ?? "")?.email || "",
      userName: users.get(a.user_id ?? "")?.display_name || "",
      userPhone: users.get(a.user_id ?? "")?.phone_number || "",
      createdAt: a.created_at,
    })),
    courses: Object.fromEntries((courses.data ?? []).map((c) => [c.id, c])),
  };
}
export async function markApplicationContacted(applicationId: string) {
  try {
    const actor = await requireAdmin();
    const { error } = await createSupabaseServiceClient().rpc(
      "mark_application_contacted",
      { p_actor: actor.uid, p_application: applicationId },
    );
    if (error) throw error;
    revalidatePath("/admin/applications");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Não foi possível marcar a ficha como contatada.",
    };
  }
}
export async function deleteApplication(applicationId: string) {
  try {
    const actor = await requireAdmin();
    const { error } = await createSupabaseServiceClient().rpc(
      "delete_unconverted_application",
      { p_actor: actor.uid, p_application: applicationId },
    );
    if (error) throw error;
    revalidatePath("/admin/applications");
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Não foi possível excluir. Fichas vinculadas a matrículas devem ser preservadas.",
    };
  }
}
