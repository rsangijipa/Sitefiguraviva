import { redirect } from "next/navigation";
import { getReadableCourseOutline } from "@/lib/courseService";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { LessonPlayerWrapper } from "@/components/portal/LessonPlayerWrapper";
import { Lesson, Module } from "@/types/lms";
import { deepSafeSerialize } from "@/lib/utils";
import { AccessError } from "@/lib/auth/access-types";
import { requireSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await requireSession("/auth");
  const uid = session.uid;

  // This service verifies the session and projects only authorized content.
  let outline;
  try {
    outline = await getReadableCourseOutline(courseId);
  } catch (error) {
    if (error instanceof AccessError) {
      // Redirect to course intro page where they can see why they can't access
      redirect(`/portal/course/${courseId}`);
    }
    throw error;
  }

  const courseData = outline
    ? { ...outline.course, modules: outline.modules }
    : null;
  if (!courseData) redirect("/portal");
  const supabase = createSupabaseServiceClient();

  // 4. FETCH PROGRESS (Numerador) - FIX: Sincronismo (Audit PRG-01)
  const { data: progressRows, error: progressError } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", uid)
    .eq("course_id", courseId);
  if (progressError) throw progressError;

  const progressMap: Record<string, any> = {};
  (progressRows ?? []).forEach((row: any) => {
    progressMap[row.lesson_id] = {
      ...row,
      lessonId: row.lesson_id,
      maxWatchedSecond: row.max_watched_second,
    };
  });

  const allLessons: Lesson[] = courseData.modules.flatMap((m: any) =>
    m.lessons.map((l: any) => {
      const prog = progressMap[l.id];
      return {
        ...l,
        isCompleted: prog?.status === "completed",
        maxWatchedSecond: prog?.maxWatchedSecond || 0,
      };
    }),
  ) as Lesson[];

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) redirect(`/portal/course/${courseId}`);

  const activeLesson = allLessons[currentIndex];

  // Lesson blocks are provided by the Supabase lesson adapter.

  const prevLessonId =
    currentIndex > 0 ? allLessons[currentIndex - 1].id : undefined;
  const nextLessonId =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1].id
      : undefined;

  // Merge progress into modules for the sidebar
  const modulesWithProgress = courseData.modules.map((m: any) => ({
    ...m,
    lessons: m.lessons.map((l: any) => {
      const prog = progressMap[l.id];
      return {
        ...l,
        isCompleted: prog?.status === "completed",
      };
    }),
  }));

  // FETCH ASSESSMENT (if quiz)
  let assessment = null;
  let submission = null;

  if (activeLesson.type === "quiz") {
    try {
      const { data: assessmentRow, error: assessmentError } = await supabase
        .from("assessments")
        .select("*")
        .eq("lesson_id", activeLesson.id)
        .eq("status", "published")
        .limit(1)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      if (assessmentRow) {
        assessment = assessmentRow;
        const { data: submissionRow } = await supabase
          .from("assessment_submissions")
          .select("*")
          .eq("user_id", uid)
          .eq("assessment_id", assessmentRow.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        submission = submissionRow;
      }
    } catch (e) {
      console.error("Error fetching assessment:", e);
    }
  }

  return (
    <LessonPlayerWrapper
      course={deepSafeSerialize({
        id: courseData.id,
        title: courseData.title,
        backLink: `/portal/course/${courseId}`,
      })}
      modules={modulesWithProgress as Module[]}
      activeLesson={deepSafeSerialize(activeLesson)}
      assessment={deepSafeSerialize(assessment)}
      submission={deepSafeSerialize(submission)}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
    />
  );
}
