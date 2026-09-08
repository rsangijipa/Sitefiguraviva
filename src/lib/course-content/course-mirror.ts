import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

/**
 * Mirrors course core fields (title, images, status, publish gate) from the
 * Firestore-authored admin course builder into Supabase's `courses` table.
 *
 * The public site (home page, /curso listing, /curso/[id] detail) and the
 * signup gate (registerForCourseAction) all read Supabase exclusively, while
 * the admin course editor (course-mutations.ts, admin-publishing.ts) still
 * writes Firestore only. Without this mirror, creating/editing a course in
 * admin — including just changing its cover image — never reaches the
 * public pages or the "is this course open for enrollment" check, so a
 * course can look fine in the editor but show stale/missing data (or be
 * permanently unavailable for signup) everywhere else.
 *
 * Best-effort: failures are logged, not thrown, so a Supabase hiccup never
 * blocks the Firestore write that already succeeded (same pattern as
 * writeEnrollmentMirror in src/lib/auth/enrollment-service.ts).
 */
export async function mirrorCourseToSupabase(
  courseId: string,
  patch: Record<string, unknown>,
) {
  try {
    const supabase = createSupabaseServiceClient();
    const image =
      (patch.coverImage as string) || (patch.image as string) || undefined;

    const row: Record<string, unknown> = { id: courseId };

    if (typeof patch.title === "string") row.title = patch.title;
    if (typeof patch.subtitle === "string") row.subtitle = patch.subtitle;
    if (typeof patch.slug === "string") row.slug = patch.slug;
    if (typeof patch.description === "string")
      row.description = patch.description;
    if (image) {
      row.cover_image_url = image;
      row.image_url = image;
    }
    if (typeof patch.instructorName === "string")
      row.instructor_name = patch.instructorName;
    if (typeof patch.instructorTitle === "string")
      row.instructor_title = patch.instructorTitle;
    if (typeof patch.level === "string") row.level = patch.level;
    if (typeof patch.category === "string") row.category = patch.category;
    if (Array.isArray(patch.tags)) row.tags = patch.tags;
    if (typeof patch.isPublished === "boolean")
      row.is_published = patch.isPublished;
    if (typeof patch.status === "string") row.status = patch.status;
    if (typeof patch.contentRevision === "number")
      row.content_revision = patch.contentRevision;

    // `frequency` and `syllabus` have no dedicated Supabase columns yet;
    // fold them into `details` (jsonb) so the mirror doesn't need a schema
    // migration to carry them.
    if (typeof patch.frequency === "string" || Array.isArray(patch.syllabus)) {
      const details: Record<string, unknown> = {};
      if (typeof patch.frequency === "string")
        details.frequency = patch.frequency;
      if (Array.isArray(patch.syllabus)) details.syllabus = patch.syllabus;
      row.details = details;
    }

    row.updated_at = new Date().toISOString();

    // New course row: Supabase requires `title` on insert, so only attempt
    // the upsert once we actually have one (create always sends it).
    if (!row.title) {
      const { data: existing } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .maybeSingle();
      if (!existing) return; // nothing to mirror yet, avoid an insert without a title
    }

    const { error } = await supabase.from("courses").upsert(row as any, {
      onConflict: "id",
    });
    if (error) throw error;
  } catch (error) {
    console.error(
      `[mirrorCourseToSupabase] Supabase mirror write failed for course ${courseId} (Firestore write already committed):`,
      error,
    );
  }
}

export async function deleteCourseFromSupabase(courseId: string) {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);
    if (error) throw error;
  } catch (error) {
    console.error(
      `[deleteCourseFromSupabase] Supabase mirror delete failed for course ${courseId}:`,
      error,
    );
  }
}
