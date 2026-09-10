import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** Recalculates canonical Supabase statistics without touching Firebase mirrors. */
export async function POST() {
  const claims = await verifySession();
  if (!claims)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!claims.isAdmin)
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  try {
    const supabase = createSupabaseServiceClient();
    const [coursesResult, lessonsResult, enrollmentResult] = await Promise.all([
      supabase.from("courses").select("id,stats"),
      supabase.from("lessons").select("course_id").eq("is_published", true),
      supabase.from("enrollments").select("id,course_id,progress_summary"),
    ]);
    const error =
      coursesResult.error || lessonsResult.error || enrollmentResult.error;
    if (error) throw error;
    const totals = new Map<string, number>();
    for (const lesson of lessonsResult.data ?? [])
      totals.set(lesson.course_id, (totals.get(lesson.course_id) ?? 0) + 1);
    const courseUpdates = await Promise.all(
      (coursesResult.data ?? []).map((course) =>
        supabase
          .from("courses")
          .update({
            stats: {
              ...(course.stats as object),
              lessonsCount: totals.get(course.id) ?? 0,
            },
          })
          .eq("id", course.id),
      ),
    );
    const courseUpdateError = courseUpdates.find(
      (result) => result.error,
    )?.error;
    if (courseUpdateError) throw courseUpdateError;
    const enrollmentUpdates = await Promise.all(
      (enrollmentResult.data ?? []).map((enrollment) =>
        supabase
          .from("enrollments")
          .update({
            progress_summary: {
              ...(enrollment.progress_summary as object),
              totalLessons: totals.get(enrollment.course_id) ?? 0,
            },
          })
          .eq("id", enrollment.id),
      ),
    );
    const enrollmentUpdateError = enrollmentUpdates.find(
      (result) => result.error,
    )?.error;
    if (enrollmentUpdateError) throw enrollmentUpdateError;
    return NextResponse.json({
      success: true,
      courses: (coursesResult.data ?? []).length,
      enrollments: (enrollmentResult.data ?? []).length,
    });
  } catch (error) {
    console.error("Sync Supabase statistics error:", error);
    return NextResponse.json(
      { error: "Unable to synchronize statistics" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to synchronize Supabase statistics." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
