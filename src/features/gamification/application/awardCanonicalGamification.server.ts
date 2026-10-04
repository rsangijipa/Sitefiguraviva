import "server-only";

import { awardXp } from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";

const XP = { lesson: 50, quiz: 100, course: 500, dailyLogin: 10 } as const;

type Completion =
  | { kind: "lesson"; courseId: string; lessonId: string }
  | { kind: "course"; courseId: string }
  | { kind: "quiz"; courseId: string; submissionId: string };

/** Only persistence boundaries call this after they independently establish the state transition. */
export async function awardCanonicalCompletion(
  userId: string,
  completion: Completion,
) {
  if (completion.kind === "lesson")
    return awardXp({
      userId,
      reason: "lesson_completed",
      amount: XP.lesson,
      eventKey: `lesson:${completion.courseId}:${completion.lessonId}`,
      metadata: {
        courseId: completion.courseId,
        lessonId: completion.lessonId,
      },
    });
  if (completion.kind === "course")
    return awardXp({
      userId,
      reason: "course_completed",
      amount: XP.course,
      eventKey: `course:${completion.courseId}`,
      metadata: { courseId: completion.courseId },
    });
  return awardXp({
    userId,
    reason: "quiz_passed",
    amount: XP.quiz,
    eventKey: `quiz:${completion.submissionId}`,
    metadata: {
      courseId: completion.courseId,
      submissionId: completion.submissionId,
    },
  });
}

export async function awardDailyLogin(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  return awardXp({
    userId,
    amount: XP.dailyLogin,
    reason: "daily_login",
    eventKey: `daily-login:${day}`,
    metadata: { day },
  });
}

export async function awardLibraryView(userId: string, resourceId: string) {
  const day = new Date().toISOString().slice(0, 10);
  return awardXp({
    userId,
    amount: 5,
    reason: "bonus",
    eventKey: `library-view:${resourceId}:${day}`,
    metadata: { resourceId, day },
  });
}
