import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/server";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { createSupabaseAuthServerClient } from "@/infrastructure/supabase/server";
import type { AssessmentDoc } from "@/types/assessment";

/** Requests the RLS-safe student projection with the verified caller's token. */
export async function getStudentAssessmentForSession(
  id: string,
): Promise<AssessmentDoc | null> {
  const session = await verifySession();
  const token = (await cookies()).get("session")?.value;
  if (!session || !token || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) return null;
  const { data, error } = await createSupabaseAuthServerClient(token).rpc(
    "get_student_assessment",
    {
      p_assessment_id: id,
    },
  );
  if (error) throw error;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (data.status !== "published" || typeof data.course_id !== "string")
    return null;
  await assertCanAccessCourse(session.uid, data.course_id);
  // The RPC gives assigned staff the key for authoring. The student screen
  // must redact it even when visited by a staff member.
  const questions = Array.isArray(data.questions)
    ? data.questions.map((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw))
          throw new Error("Invalid assessment question");
        const {
          correctAnswer,
          correctOption,
          correctOptions,
          explanation,
          rubric,
          ...question
        } = raw;
        if (Array.isArray(question.options))
          question.options = question.options.map((rawOption) => {
            if (
              !rawOption ||
              typeof rawOption !== "object" ||
              Array.isArray(rawOption)
            )
              throw new Error("Invalid assessment option");
            const { isCorrect, ...option } = rawOption;
            return option;
          });
        return question;
      })
    : [];
  return {
    id: String(data.id),
    courseId: data.course_id,
    lessonId: typeof data.lesson_id === "string" ? data.lesson_id : undefined,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    questions: questions as unknown as AssessmentDoc["questions"],
    passingScore: Number(data.passing_score),
    totalPoints: Number(data.total_points),
    status: "published",
    isRequired: data.is_required === true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: "",
  };
}
