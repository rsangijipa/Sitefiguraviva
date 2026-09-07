import { redirect } from "next/navigation";
import { getCourseOutlineById } from "@/features/courses/infrastructure/supabaseCourseRepository.server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { LessonPlayerWrapper } from "@/components/portal/LessonPlayerWrapper";
import { Lesson, Module } from "@/types/lms";
import { deepSafeSerialize } from "@/lib/utils";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { AccessError } from "@/lib/auth/access-types";
import { requireSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// Helper to fetch full course structure
async function getCourseData(courseId: string) {
  const outline = await getCourseOutlineById(courseId);
  if (outline) {
    return deepSafeSerialize({
      id: outline.course.id,
      ...outline.course,
      modules: outline.modules,
    } as any);
  }
  return null;
  /* Legacy Firestore fallback retained until progress/content migration completes.
  const courseDoc = await db.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) return null;

  const modulesSnap = await db
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .orderBy("order", "asc")
    .get();
  const modules = await Promise.all(
    modulesSnap.docs.map(async (doc) => {
      const lessonsSnap = await doc.ref
        .collection("lessons")
        .orderBy("order", "asc")
        .get();
      const lessons = lessonsSnap.docs.map((l) => ({
        id: l.id,
        moduleId: doc.id,
        ...l.data(),
      }));
      return { id: doc.id, ...doc.data(), lessons };
    }),
  );

  return deepSafeSerialize({
    id: courseDoc.id,
    ...courseDoc.data(),
    modules,
  } as any);
  */
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await requireSession("/auth");
  const uid = session.uid;
  const isAdmin = session.isAdmin;

  // ORBITAL 01 & 05: Single Source of Truth Access Gate
  try {
    await assertCanAccessCourse(uid, courseId, { isAdmin });
  } catch (error) {
    if (error instanceof AccessError) {
      // Redirect to course intro page where they can see why they can't access
      redirect(`/portal/course/${courseId}`);
    }
    throw error;
  }

  const courseData = await getCourseData(courseId);
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
