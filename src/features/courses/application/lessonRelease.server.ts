import "server-only";

import { getCourseOutlineById } from "@/features/courses/infrastructure/supabaseCourseRepository.server";
import { listProgressBySupabaseUser } from "@/features/progress/infrastructure/supabaseProgressRepository.server";
import {
  computeLessonLocks,
  describeLessonLock,
  readContentRelease,
} from "@/features/courses/domain/content-release";

export class LessonLockedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "LessonLockedError";
  }
}

/**
 * Server-side guard for progress writes: a student cannot complete (or
 * record progress on) a lesson the course's release rules still hold back.
 * Callers skip it for admin override / team preview.
 */
export async function assertLessonReleased(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<void> {
  const outline = await getCourseOutlineById(courseId);
  if (!outline) return;
  const release = readContentRelease(outline.course.details);
  if (release.mode === "free" && Object.keys(release.moduleDates).length === 0)
    return;

  const progress = await listProgressBySupabaseUser(userId, courseId);
  const completed = new Set(
    progress
      .filter((row) => row.status === "completed")
      .map((row) => row.lessonId),
  );
  const locks = computeLessonLocks(
    outline.modules
      .filter((courseModule) => courseModule.isPublished === true)
      .map((courseModule) => ({
        id: courseModule.id,
        lessons: courseModule.lessons
          .filter((lesson) => lesson.isPublished === true)
          .map((lesson) => ({
            id: lesson.id,
            isCompleted: completed.has(lesson.id),
          })),
      })),
    release,
  );
  const lock = locks.get(lessonId);
  if (lock?.locked) throw new LessonLockedError(describeLessonLock(lock) ?? "");
}
