import "server-only";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json, TableRow } from "@/infrastructure/supabase/database.types";
import type { AssessmentDoc } from "@/types/assessment";
import { logAudit } from "@/lib/audit";

const statusSchema = z.enum(["draft", "published", "archived"]);
const questionBase = {
  id: z.string().min(1),
  title: z.string().trim().min(1),
  points: z.number().int().nonnegative(),
  order: z.number().int().nonnegative(),
};
const questionSchema = z.discriminatedUnion("type", [
  z
    .object({
      ...questionBase,
      type: z.literal("multiple_choice"),
      options: z
        .array(
          z.object({
            id: z.string().min(1),
            text: z.string().trim().min(1),
            isCorrect: z.boolean(),
          }),
        )
        .min(2),
      allowMultiple: z.boolean().optional(),
    })
    .passthrough(),
  z
    .object({
      ...questionBase,
      type: z.literal("true_false"),
      correctAnswer: z.boolean(),
    })
    .passthrough(),
  z.object({ ...questionBase, type: z.literal("essay") }).passthrough(),
  z
    .object({
      ...questionBase,
      type: z.literal("practical"),
      instructions: z.string().trim().min(1),
    })
    .passthrough(),
]);
const inputSchema = z.object({
  courseId: z.string().trim().min(1).max(200),
  lessonId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1).max(300),
  description: z.string().max(20000).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  questions: z.array(questionSchema).min(1).max(200),
  status: statusSchema.optional(),
  isRequired: z.boolean().optional(),
});

function mapAssessment(row: TableRow<"assessments">): AssessmentDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id ?? undefined,
    title: row.title,
    description: row.description ?? "",
    questions: row.questions as unknown as AssessmentDoc["questions"],
    passingScore: row.passing_score,
    totalPoints: row.total_points,
    status: row.status,
    isRequired: row.is_required,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "",
  };
}

export async function readAdminAssessments(id?: string) {
  await requireAdmin();
  let query = createSupabaseServiceClient()
    .from("assessments")
    .select("*")
    .order("title");
  if (id) query = query.eq("id", id);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapAssessment);
}

export async function saveAdminAssessment(
  input: Partial<AssessmentDoc>,
  id?: string,
) {
  const actor = await requireAdmin();
  const client = createSupabaseServiceClient();
  // Merge partial edits with the authoritative row so a title edit keeps questions and points.
  const previous = id ? (await readAdminAssessments(id))[0] : undefined;
  if (id && !previous) throw new Error("Avaliação não encontrada.");
  if ((input.timeLimit ?? 0) > 0 || (input.maxAttempts ?? 1) > 1)
    throw new Error("Esta versão permite uma tentativa sem limite de tempo.");
  const data = inputSchema.parse({ ...previous, ...input });
  if (new Set(data.questions.map((q) => q.id)).size !== data.questions.length)
    throw new Error("As questões precisam ter identificadores únicos.");
  for (const q of data.questions) {
    if (
      q.type === "multiple_choice" &&
      (new Set(q.options.map((o) => o.id)).size !== q.options.length ||
        !q.options.some((o) => o.isCorrect) ||
        (!q.allowMultiple && q.options.filter((o) => o.isCorrect).length !== 1))
    )
      throw new Error("Confira as alternativas e a resposta correta.");
  }
  if (data.lessonId) {
    const { data: lesson, error } = await client
      .from("lessons")
      .select("id")
      .eq("id", data.lessonId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (error) throw error;
    if (!lesson) throw new Error("A aula não pertence ao curso selecionado.");
  }
  const payload = {
    course_id: data.courseId,
    lesson_id: data.lessonId ?? null,
    title: data.title,
    description: data.description ?? null,
    passing_score: data.passingScore ?? 70,
    total_points: data.questions.reduce((sum, q) => sum + q.points, 0),
    questions: data.questions as unknown as Json,
    status: data.status ?? "draft",
    is_required: data.isRequired ?? false,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? client.from("assessments").update(payload).eq("id", id)
    : client.from("assessments").insert({ ...payload, created_by: actor.uid });
  const { data: saved, error } = await query.select("id").single();
  if (error) throw error;
  if (!saved) throw new Error("A avaliação não foi salva.");
  await logAudit({
    actor: { uid: actor.uid, email: actor.email },
    action: id ? "assessment.updated" : "assessment.created",
    target: { id: saved.id, collection: "assessments" },
  });
  return saved.id;
}

export async function removeAdminAssessment(id: string) {
  const actor = await requireAdmin();
  const { data, error } = await createSupabaseServiceClient()
    .from("assessments")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Avaliação não encontrada.");
  await logAudit({
    actor: { uid: actor.uid, email: actor.email },
    action: "assessment.deleted",
    target: { id, collection: "assessments" },
  });
}

export async function setAdminAssessmentStatus(
  id: string,
  status: AssessmentDoc["status"],
) {
  await saveAdminAssessment({ status: statusSchema.parse(status) }, id);
}
