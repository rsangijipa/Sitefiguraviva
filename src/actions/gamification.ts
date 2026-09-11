"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { XP_VALUES } from "@/lib/gamification";
import { telemetry } from "@/lib/telemetry";

type GamificationAction =
  | "lesson_complete"
  | "quiz_pass"
  | "daily_login"
  | "course_complete"
  | "library_view";

const EVENT_CONFIG: Record<
  GamificationAction,
  { reason: string; amount: number }
> = {
  lesson_complete: {
    reason: "lesson_completed",
    amount: XP_VALUES.LESSON_COMPLETED,
  },
  quiz_pass: { reason: "quiz_passed", amount: XP_VALUES.QUIZ_PASSED },
  daily_login: { reason: "daily_login", amount: XP_VALUES.DAILY_LOGIN },
  course_complete: {
    reason: "course_completed",
    amount: XP_VALUES.COURSE_COMPLETED,
  },
  library_view: { reason: "bonus", amount: 5 },
};

function eventKey(
  uid: string,
  data: {
    actionType: GamificationAction;
    courseId?: string;
    lessonId?: string;
  },
) {
  const today = new Date().toISOString().slice(0, 10);
  if (data.actionType === "daily_login") return `daily_login:${uid}:${today}`;
  if (data.actionType === "lesson_complete" && data.lessonId)
    return `lesson_complete:${uid}:${data.lessonId}`;
  if (data.actionType === "course_complete" && data.courseId)
    return `course_complete:${uid}:${data.courseId}`;
  // A library view and a quiz pass can legitimately occur more than once. The
  // caller cannot choose this key, so it cannot replay another user's event.
  return `${data.actionType}:${uid}:${crypto.randomUUID()}`;
}

/** Processes trusted gamification events through an idempotent Supabase RPC. */
export async function processGamificationEvent(data: {
  courseId?: string;
  lessonId?: string;
  actionType: GamificationAction;
  metadata?: Record<string, unknown>;
}) {
  const session = await verifySession();
  if (!session) {
    telemetry.error(new Error("Gamification attempt without session"));
    return { error: "Unauthorized" };
  }
  if (
    (data.actionType === "lesson_complete" &&
      (!data.lessonId || !data.courseId)) ||
    (data.actionType === "course_complete" && !data.courseId)
  ) {
    return { error: "Identificadores obrigatórios ausentes." };
  }

  try {
    const config = EVENT_CONFIG[data.actionType];
    const badges = [
      ...(data.actionType === "lesson_complete" ? ["first_lesson"] : []),
      ...(data.actionType === "course_complete" ? ["first_course"] : []),
    ];
    const { data: result, error } = await (
      createSupabaseServiceClient() as any
    ).rpc("process_gamification_event", {
      p_user_id: session.uid,
      p_event_key: eventKey(session.uid, data),
      p_reason: config.reason,
      p_amount: config.amount,
      p_metadata: {
        ...(data.metadata || {}),
        courseId: data.courseId,
        lessonId: data.lessonId,
        actionType: data.actionType,
      },
      p_badges: badges,
    });
    if (error) throw error;
    return {
      success: true,
      processed: Boolean(result?.processed),
      xpAwarded: result?.processed ? config.amount : 0,
      newLevel: Number(result?.newLevel || 1),
      leveledUp: Boolean(result?.leveledUp),
      newBadges: Array.isArray(result?.newBadges) ? result.newBadges : [],
    };
  } catch (error) {
    telemetry.error(error, { actionType: data.actionType });
    return { error: "Não foi possível registrar a conquista." };
  }
}
