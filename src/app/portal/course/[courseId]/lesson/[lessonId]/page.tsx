import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, db } from "@/lib/firebase/admin";
import { LessonPlayerWrapper } from "@/components/portal/LessonPlayerWrapper";
import { Lesson, Module } from "@/types/lms";
import { deepSafeSerialize } from "@/lib/utils";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { AccessError } from "@/lib/auth/access-types";

export const dynamic = "force-dynamic";

// Helper to fetch full course structure
async function getCourseData(courseId: string) {
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
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) redirect("/auth");

  let uid;
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    uid = decodedClaims.uid;
  } catch {
    redirect("/auth");
  }

  // ORBITAL 01 & 05: Single Source of Truth Access Gate
  try {
    await assertCanAccessCourse(uid, courseId);
  } catch (error) {
    if (error instanceof AccessError) {
      // Redirect to course intro page where they can see why they can't access
      redirect(`/portal/course/${courseId}`);
    }
    throw error;
  }

  const courseData = await getCourseData(courseId);
  if (!courseData) redirect("/portal");

  // 4. FETCH PROGRESS (Numerador) - FIX: Sincronismo (Audit PRG-01)
  const progressSnap = await db
    .collection("progress")
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .get();

  const progressMap: Record<string, any> = {};
  progressSnap.docs.forEach((doc) => {
    progressMap[doc.data().lessonId] = doc.data();
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

  // FETCH CONTENT (Blocks)
  // We must fetch the subcollection 'blocks' for this lesson to show content
  if (activeLesson) {
    try {
      const blocksSnap = await db
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(activeLesson.moduleId)
        .collection("lessons")
        .doc(activeLesson.id)
        .collection("blocks")
        .orderBy("order", "asc")
        .get();

      const blocks = blocksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isPublished: doc.data().isPublished !== false,
      }));

      // @ts-ignore - injecting blocks into the lesson object for the player
      activeLesson.blocks = blocks;
    } catch (e) {
      console.error("Error fetching lesson blocks:", e);
    }
  }

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
      const assessmentSnap = await db
        .collection("assessments")
        .where("lessonId", "==", activeLesson.id)
        .where("status", "==", "published")
        .limit(1)
        .get();

      if (!assessmentSnap.empty) {
        assessment = {
          id: assessmentSnap.docs[0].id,
          ...assessmentSnap.docs[0].data(),
        };

        // Also fetch user's last submission
        const submissionSnap = await db
          .collection("assessmentSubmissions")
          .where("userId", "==", uid)
          .where("assessmentId", "==", assessment.id)
          .orderBy("startedAt", "desc")
          .limit(1)
          .get();

        if (!submissionSnap.empty) {
          submission = {
            id: submissionSnap.docs[0].id,
            ...submissionSnap.docs[0].data(),
          };
        }
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
