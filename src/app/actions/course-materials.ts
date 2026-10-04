"use server";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { materialDownloadUrl } from "@/lib/course-materials";
export async function getReadableCourseMaterialsAction(courseId: string) {
  const session = await verifySession();
  if (!session) return [];
  const { data, error } = await createSupabaseServiceClient().rpc(
    "list_readable_course_materials",
    { p_user: session.uid, p_course: courseId },
  );
  if (error || !Array.isArray(data))
    throw new Error("Não foi possível carregar os materiais.");
  return (
    data as {
      id: string;
      title: string;
      type: string;
      description: string | null;
    }[]
  ).map((row) => ({ ...row, url: materialDownloadUrl(row.id) }));
}
