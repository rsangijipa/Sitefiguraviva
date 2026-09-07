import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { DomainEvent, publishEvent } from "../bus";

export async function handleProgressUpdate(event: DomainEvent) {
  const { actorUserId, context } = event;
  if (!context.courseId) return;
  const supabase = createSupabaseServiceClient();
  const [{ data: course }, { data: lessons }] = await Promise.all([
    supabase
      .from("courses")
      .select("id,title,workload_minutes")
      .eq("id", context.courseId)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("id")
      .eq("course_id", context.courseId)
      .eq("is_published", true),
  ]);
  const totalLessons = lessons?.length ?? 0;
  if (!course || totalLessons === 0) return;
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id,status,progress_summary,user_name")
    .eq("user_id", actorUserId)
    .eq("course_id", context.courseId)
    .maybeSingle();
  if (!enrollment) return;
  const summary = (enrollment.progress_summary ?? {}) as Record<string, any>;
  const completed = new Set<string>(summary.completedLessons ?? []);
  if (event.type === "LESSON_COMPLETED" && context.lessonId)
    completed.add(context.lessonId);
  const percent = Math.min(
    100,
    Math.round((completed.size / totalLessons) * 100),
  );
  await supabase
    .from("enrollments")
    .update({
      status: percent === 100 ? "completed" : enrollment.status,
      completed_at: percent === 100 ? new Date().toISOString() : null,
      progress_summary: {
        ...summary,
        completedLessons: Array.from(completed),
        completedLessonsCount: completed.size,
        totalLessons,
        percent,
        lastUpdated: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollment.id);
  if (percent < 100) return;
  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", actorUserId)
    .eq("course_id", context.courseId)
    .limit(1)
    .maybeSingle();
  if (existing) return;
  const code = `FV-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const { data: certificate, error } = await supabase
    .from("certificates")
    .insert({
      user_id: actorUserId,
      course_id: context.courseId,
      code,
      metadata: {
        studentName: enrollment.user_name ?? "Aluno Figura Viva",
        courseTitle: course.title,
        workloadMinutes: course.workload_minutes,
      },
    })
    .select("id")
    .single();
  if (error) throw error;
  await publishEvent({
    type: "CERTIFICATE_ISSUED",
    actorUserId,
    targetId: certificate.id,
    context: { courseId: context.courseId },
    payload: { code },
  });
}
