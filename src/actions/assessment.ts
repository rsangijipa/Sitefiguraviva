"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type {
  AssessmentDoc,
  StudentAnswer,
  AssessmentSubmissionDoc,
} from "@/types/assessment";
import type { UserData } from "@/types/user";

async function requireUserClaims() {
  const session = await verifySession();
  if (session) {
    return {
      uid: session.uid,
      email: session.email,
      role: session.role || "student",
      admin: session.isAdmin,
    };
  }

  // Fallback for tests or legacy Firebase cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (sessionCookie && auth?.verifySessionCookie) {
      return await auth.verifySessionCookie(sessionCookie, true);
    }
  } catch {
    // ignore fallback error
  }

  throw new Error("Unauthorized");
}

async function requireAdminClaims() {
  const claims = await requireUserClaims();

  if (claims.role !== "admin" && claims.admin !== true) {
    throw new Error("Forbidden: Admins only");
  }

  return claims;
}

/**
 * Server Actions can only return values that React can serialize. Firestore
 * timestamps are class instances, so normalize them before returning admin
 * data to client components.
 */
function serializeFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        serializeFirestoreValue(item),
      ]),
    );
  }

  return value;
}

function serializeFirestoreDocument<T>(id: string, data: unknown): T {
  return { id, ...(serializeFirestoreValue(data) as object) } as T;
}

/**
 * Read assessment management data through the server.
 */
export async function getAdminAssessments(): Promise<AssessmentDoc[]> {
  await requireAdminClaims();

  // Try Supabase first
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("title", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        courseId: row.course_id,
        lessonId: row.lesson_id || undefined,
        title: row.title,
        description: row.description || "",
        questions: Array.isArray(row.questions)
          ? (row.questions as unknown as AssessmentDoc["questions"])
          : [],
        passingScore: row.passing_score,
        totalPoints: row.total_points,
        status: row.status,
        isRequired: false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by || "",
      }));
    }
  } catch {
    // fallback
  }

  const snapshot = await adminDb
    .collection("assessments")
    .orderBy("title")
    .get();

  return snapshot.docs.map((doc) =>
    serializeFirestoreDocument<AssessmentDoc>(doc.id, doc.data()),
  );
}

export async function getAdminSubmissionMetrics(): Promise<{
  total: number;
  pending: number;
}> {
  await requireAdminClaims();

  try {
    const supabase = createSupabaseServiceClient();
    const [totalRes, pendingRes] = await Promise.all([
      supabase
        .from("assessment_submissions")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("assessment_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]);

    if (!totalRes.error && !pendingRes.error) {
      return {
        total: totalRes.count ?? 0,
        pending: pendingRes.count ?? 0,
      };
    }
  } catch {
    // fallback
  }

  const submissions = adminDb.collection("assessmentSubmissions");
  const [total, pending] = await Promise.all([
    submissions.count().get(),
    submissions.where("status", "==", "submitted").count().get(),
  ]);

  return {
    total: total.data().count,
    pending: pending.data().count,
  };
}

export async function getAdminSubmissionsPage({
  status,
  pageSize = 20,
  cursorId,
}: {
  status?: string;
  pageSize?: number;
  cursorId?: string;
}): Promise<{
  submissions: AssessmentSubmissionDoc[];
  users: Record<string, UserData>;
  lastVisible?: string;
  hasMore: boolean;
}> {
  await requireAdminClaims();

  const normalizedPageSize = Math.min(Math.max(Math.floor(pageSize), 1), 100);
  let submissionsQuery = adminDb
    .collection("assessmentSubmissions")
    .orderBy("submittedAt", "desc")
    .limit(normalizedPageSize);

  if (cursorId) {
    const cursor = await adminDb
      .collection("assessmentSubmissions")
      .doc(cursorId)
      .get();

    if (cursor.exists) {
      submissionsQuery = submissionsQuery.startAfter(cursor);
    }
  }

  const snapshot = await submissionsQuery.get();
  let submissions = snapshot.docs.map((doc) =>
    serializeFirestoreDocument<AssessmentSubmissionDoc>(doc.id, doc.data()),
  );

  if (status) {
    submissions = submissions.filter(
      (submission) => submission.status === status,
    );
  }

  const uniqueUserIds = [
    ...new Set(submissions.map((submission) => submission.userId)),
  ];
  const userSnapshots = await Promise.all(
    uniqueUserIds.map((uid) => adminDb.collection("users").doc(uid).get()),
  );
  const users = Object.fromEntries(
    userSnapshots
      .filter((s) => s.exists)
      .map((s) => [
        s.id,
        serializeFirestoreDocument<UserData>(s.id, s.data()),
      ]),
  ) as Record<string, UserData>;

  return {
    submissions,
    users,
    lastVisible: snapshot.docs.at(-1)?.id,
    hasMore: snapshot.docs.length === normalizedPageSize,
  };
}

/**
 * Start a new assessment attempt in a server-authoritative way.
 */
export async function startAssessmentAttempt(
  assessmentId: string,
  courseId: string,
) {
  try {
    const claims = await requireUserClaims();
    const uid = claims.uid;

    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(assessmentId)
      .get();
    if (!assessmentSnap.exists) {
      return { error: "Avaliação não encontrada" };
    }

    const assessment = assessmentSnap.data() as AssessmentDoc;
    if (assessment.courseId !== courseId) {
      return { error: "Curso da avaliação inválido" };
    }

    const existingAttempts = await adminDb
      .collection("assessmentSubmissions")
      .where("assessmentId", "==", assessmentId)
      .where("userId", "==", uid)
      .get();

    const maxAttempt = existingAttempts.docs.reduce((max, d) => {
      const value = Number(d.data()?.attemptNumber || 0);
      return value > max ? value : max;
    }, 0);

    const submissionRef = await adminDb
      .collection("assessmentSubmissions")
      .add({
        assessmentId,
        userId: uid,
        courseId,
        answers: [],
        status: "pending",
        attemptNumber: maxAttempt + 1,
        startedAt: Timestamp.now(),
      });

    // Supabase mirror write
    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("assessment_submissions").insert({
        id: submissionRef.id,
        assessment_id: assessmentId,
        user_id: uid,
        course_id: courseId,
        answers: [],
        status: "pending",
        attempt_number: maxAttempt + 1,
        started_at: new Date().toISOString(),
        score: 0,
        percentage: 0,
        passed: false,
      });
    } catch {
      // ignore
    }

    return { success: true, submissionId: submissionRef.id };
  } catch (error) {
    console.error("Start Assessment Attempt Error:", error);
    return { error: "Erro ao iniciar avaliação" };
  }
}

/**
 * Submit an assessment attempt answer payload before grading.
 */
export async function submitAssessmentAttempt(
  submissionId: string,
  answers: StudentAnswer[],
) {
  try {
    const claims = await requireUserClaims();
    const uid = claims.uid;

    const submissionRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) {
      return { error: "Submissão não encontrada" };
    }

    const submission = submissionSnap.data() as AssessmentSubmissionDoc;
    if (submission.userId !== uid) {
      return { error: "Acesso negado" };
    }

    const nowIso = new Date().toISOString();
    await submissionRef.update({
      answers,
      status: "submitted",
      submittedAt: Timestamp.now(),
    });

    try {
      const supabase = createSupabaseServiceClient();
      await supabase
        .from("assessment_submissions")
        .update({
          answers: answers as any,
          status: "submitted",
          submitted_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", submissionId);
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    console.error("Submit Assessment Attempt Error:", error);
    return { error: "Erro ao enviar avaliação" };
  }
}

/**
 * Grade an assessment submission
 * Auto-grades multiple choice and true/false
 * Marks essays/practicals for manual review
 */
export async function gradeAssessment(submissionId: string) {
  try {
    const claims = await requireUserClaims();

    // Rate limiting: Prevent spam submissions
    const rateLimitResult = await rateLimit(
      claims.uid,
      "submitAssessment",
      RateLimitPresets.SUBMIT_ASSIGNMENT,
    );

    if (!rateLimitResult.allowed) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      );
      return {
        error: `Limite de submissões excedido. Aguarde ${waitSeconds}s.`,
      };
    }

    // Get submission
    const submissionRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      return { error: "Submissão não encontrada" };
    }

    const submission = submissionSnap.data() as AssessmentSubmissionDoc;

    // Verify ownership
    if (submission.userId !== claims.uid) {
      return { error: "Acesso negado" };
    }

    // Get assessment
    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(submission.assessmentId)
      .get();

    if (!assessmentSnap.exists) {
      return { error: "Avaliação não encontrada" };
    }

    const assessment = assessmentSnap.data() as AssessmentDoc;

    // Auto-grade
    let totalPoints = 0;
    let earnedPoints = 0;
    let requiresManualReview = false;

    const gradedAnswers: StudentAnswer[] = submission.answers.map((answer) => {
      const question = assessment.questions.find(
        (q) => q.id === answer.questionId,
      );

      if (!question) return answer;

      totalPoints += question.points;

      // Multiple Choice grading
      if (question.type === "multiple_choice" && answer.selectedOptions) {
        const correctOptions = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);

        const isCorrect =
          correctOptions.length === answer.selectedOptions.length &&
          correctOptions.every((id) => answer.selectedOptions!.includes(id));

        const pointsEarned = isCorrect ? question.points : 0;
        earnedPoints += pointsEarned;

        return { ...answer, isCorrect, pointsEarned };
      }

      // True/False grading
      if (
        question.type === "true_false" &&
        answer.booleanAnswer !== undefined
      ) {
        const isCorrect = answer.booleanAnswer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;
        earnedPoints += pointsEarned;

        return { ...answer, isCorrect, pointsEarned };
      }

      // Essay/Practical - requires manual review
      if (question.type === "essay" || question.type === "practical") {
        requiresManualReview = true;
        return { ...answer, pointsEarned: 0 };
      }

      return answer;
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= assessment.passingScore;

    // Update submission
    const updateData: any = {
      answers: gradedAnswers,
      score: earnedPoints,
      percentage,
      passed: requiresManualReview ? false : passed,
      status: requiresManualReview ? "submitted" : "graded",
      gradedAt: Timestamp.now(),
    };

    await submissionRef.update(updateData);

    // Update user progress in Firestore
    const progressRef = adminDb
      .collection("users")
      .doc(claims.uid)
      .collection("assessmentProgress")
      .doc(submission.assessmentId);

    const progressSnap = await progressRef.get();
    const currentProgress = progressSnap.exists ? progressSnap.data() : null;

    const newBestPercentage = Math.max(
      percentage,
      currentProgress?.bestPercentage || 0,
    );
    const newBestScore = Math.max(
      earnedPoints,
      currentProgress?.bestScore || 0,
    );
    const totalAttempts = (currentProgress?.attempts || 0) + 1;

    await progressRef.set(
      {
        assessmentId: submission.assessmentId,
        userId: claims.uid,
        courseId: submission.courseId,
        attempts: totalAttempts,
        bestScore: newBestScore,
        bestPercentage: newBestPercentage,
        passed: requiresManualReview
          ? false
          : newBestPercentage >= assessment.passingScore,
        lastAttemptAt: Timestamp.now(),
        submissions: [...(currentProgress?.submissions || []), submissionId],
      },
      { merge: true },
    );

    // Sync to Supabase
    try {
      const supabase = createSupabaseServiceClient();
      const nowIso = new Date().toISOString();
      await supabase
        .from("assessment_submissions")
        .update({
          answers: gradedAnswers as any,
          score: earnedPoints,
          percentage,
          passed: requiresManualReview ? false : passed,
          status: requiresManualReview ? "submitted" : "graded",
          graded_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", submissionId);

      await supabase.from("assessment_progress").upsert({
        id: `${claims.uid}_${submission.assessmentId}`,
        assessment_id: submission.assessmentId,
        user_id: claims.uid,
        course_id: submission.courseId,
        attempts: totalAttempts,
        best_score: newBestScore,
        best_percentage: newBestPercentage,
        passed: requiresManualReview
          ? false
          : newBestPercentage >= assessment.passingScore,
        last_attempt_at: nowIso,
        submissions: [...(currentProgress?.submissions || []), submissionId] as any,
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed: requiresManualReview ? null : passed,
      requiresManualReview,
    };
  } catch (error) {
    console.error("Grade Assessment Error:", error);
    return { error: "Erro ao processar avaliação" };
  }
}

/**
 * Create a new assessment (Admin only)
 */
export async function createAssessment(data: Partial<AssessmentDoc>) {
  try {
    const claims = await requireAdminClaims();

    const totalPoints =
      data.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    const assessmentRef = await adminDb.collection("assessments").add({
      ...data,
      totalPoints,
      status: data.status || "draft",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: claims.uid,
    });

    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("assessments").insert({
        id: assessmentRef.id,
        course_id: data.courseId || "",
        lesson_id: data.lessonId || null,
        title: data.title || "Sem título",
        description: data.description || null,
        passing_score: data.passingScore || 70,
        total_points: totalPoints,
        questions: (data.questions || []) as any,
        status: (data.status || "draft") as any,
        created_by: claims.uid,
      });
    } catch {
      // ignore
    }

    return { success: true, id: assessmentRef.id };
  } catch (error) {
    console.error("Create Assessment Error:", error);
    return { error: "Erro ao criar avaliação" };
  }
}

/**
 * Update an existing assessment (Admin only)
 */
export async function updateAssessment(
  id: string,
  data: Partial<AssessmentDoc>,
) {
  try {
    const claims = await requireAdminClaims();

    const totalPoints =
      data.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    await adminDb
      .collection("assessments")
      .doc(id)
      .update({
        ...data,
        totalPoints,
        updatedAt: Timestamp.now(),
      });

    try {
      const supabase = createSupabaseServiceClient();
      const updates: any = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined) updates.description = data.description;
      if (data.passingScore !== undefined) updates.passing_score = data.passingScore;
      if (totalPoints !== undefined) updates.total_points = totalPoints;
      if (data.questions !== undefined) updates.questions = data.questions;
      if (data.status !== undefined) updates.status = data.status;
      updates.updated_at = new Date().toISOString();

      await supabase.from("assessments").update(updates).eq("id", id);
    } catch {
      // ignore
    }

    // Audit
    await import("@/lib/audit").then((m) =>
      m.logAudit({
        actor: { uid: claims.uid, email: claims.email, role: claims.role },
        action: "assessment.updated",
        target: { id, collection: "assessments" },
      }),
    );

    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Error:", error);
    return { error: "Erro ao atualizar avaliação" };
  }
}

export async function deleteAssessment(id: string) {
  try {
    const claims = await requireAdminClaims();

    await adminDb.collection("assessments").doc(id).delete();

    try {
      const supabase = createSupabaseServiceClient();
      await supabase.from("assessments").delete().eq("id", id);
    } catch {
      // ignore
    }

    // Audit
    await import("@/lib/audit").then((m) =>
      m.logAudit({
        actor: { uid: claims.uid, email: claims.email, role: claims.role },
        action: "assessment.deleted",
        target: { id, collection: "assessments" },
      }),
    );

    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Delete Assessment Error:", error);
    return { error: "Erro ao excluir avaliação" };
  }
}

export async function updateAssessmentStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  try {
    const claims = await requireAdminClaims();

    await adminDb.collection("assessments").doc(id).update({
      status,
      updatedAt: Timestamp.now(),
    });

    try {
      const supabase = createSupabaseServiceClient();
      await supabase
        .from("assessments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // ignore
    }

    // Audit
    await import("@/lib/audit").then((m) =>
      m.logAudit({
        actor: { uid: claims.uid, email: claims.email, role: claims.role },
        action: "assessment.status_updated",
        target: { id, collection: "assessments" },
        payload: { status },
      }),
    );

    revalidatePath("/admin/assessments");
    return { success: true };
  } catch (error) {
    console.error("Update Assessment Status Error:", error);
    return { error: "Erro ao atualizar status da avaliação" };
  }
}

/**
 * Get single submission detail (Admin only)
 */
export async function getSubmissionDetail(id: string): Promise<{
  submission: AssessmentSubmissionDoc;
  user: UserData | null;
  assessment: AssessmentDoc | null;
} | null> {
  try {
    await requireAdminClaims();

    const subSnap = await adminDb
      .collection("assessmentSubmissions")
      .doc(id)
      .get();
    if (!subSnap.exists) return null;

    const data = subSnap.data() as AssessmentSubmissionDoc;

    const [userSnap, assessmentSnap] = await Promise.all([
      adminDb.collection("users").doc(data.userId).get(),
      adminDb.collection("assessments").doc(data.assessmentId).get(),
    ]);

    return {
      submission: { id: subSnap.id, ...data },
      user: userSnap.exists
        ? ({ uid: userSnap.id, ...userSnap.data() } as UserData)
        : null,
      assessment: assessmentSnap.exists
        ? ({ id: assessmentSnap.id, ...assessmentSnap.data() } as AssessmentDoc)
        : null,
    };
  } catch (error) {
    console.error("Get Submission Detail Error:", error);
    return null;
  }
}

/**
 * Save manual grading for a submission
 */
export async function saveManualGrading(
  submissionId: string,
  gradingData: {
    answers: StudentAnswer[];
    feedback?: string;
  },
) {
  try {
    const claims = await requireAdminClaims();

    const subRef = adminDb
      .collection("assessmentSubmissions")
      .doc(submissionId);
    const subSnap = await subRef.get();
    if (!subSnap.exists) return { error: "Submissão não encontrada" };

    const submission = subSnap.data() as AssessmentSubmissionDoc;

    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(submission.assessmentId)
      .get();
    if (!assessmentSnap.exists) return { error: "Avaliação não encontrada" };
    const assessment = assessmentSnap.data() as AssessmentDoc;

    const totalScore = gradingData.answers.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0,
    );
    const totalPossiblePoints = assessment.totalPoints || 100;
    const percentage = (totalScore / totalPossiblePoints) * 100;
    const passed = percentage >= assessment.passingScore;

    const updateData = {
      answers: gradingData.answers,
      score: totalScore,
      percentage,
      passed,
      status: "graded" as const,
      feedback: gradingData.feedback || "",
      gradedBy: claims.uid,
      gradedAt: Timestamp.now(),
    };

    await subRef.update(updateData);

    // Update user progress in Firestore
    const progressRef = adminDb
      .collection("users")
      .doc(submission.userId)
      .collection("assessmentProgress")
      .doc(submission.assessmentId);

    const progressSnap = await progressRef.get();
    const currentProgress = progressSnap.exists ? progressSnap.data() : null;

    const newBestPercentage = Math.max(
      percentage,
      currentProgress?.bestPercentage || 0,
    );
    const newBestScore = Math.max(totalScore, currentProgress?.bestScore || 0);

    await progressRef.set(
      {
        assessmentId: submission.assessmentId,
        userId: submission.userId,
        courseId: submission.courseId,
        bestScore: newBestScore,
        bestPercentage: newBestPercentage,
        passed: newBestPercentage >= assessment.passingScore,
        lastAttemptAt: Timestamp.now(),
      },
      { merge: true },
    );

    // Supabase mirror write
    try {
      const supabase = createSupabaseServiceClient();
      const nowIso = new Date().toISOString();
      await supabase
        .from("assessment_submissions")
        .update({
          answers: gradingData.answers as any,
          score: totalScore,
          percentage,
          passed,
          status: "graded",
          feedback: gradingData.feedback || null,
          graded_by: claims.uid,
          graded_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", submissionId);

      await supabase.from("assessment_progress").upsert({
        id: `${submission.userId}_${submission.assessmentId}`,
        assessment_id: submission.assessmentId,
        user_id: submission.userId,
        course_id: submission.courseId,
        best_score: newBestScore,
        best_percentage: newBestPercentage,
        passed: newBestPercentage >= assessment.passingScore,
        last_attempt_at: nowIso,
      });
    } catch {
      // ignore
    }

    revalidatePath(`/admin/assessments/submissions/${submissionId}`);
    revalidatePath("/admin/assessments/submissions");

    return { success: true };
  } catch (error) {
    console.error("Save Manual Grading Error:", error);
    return { error: "Erro ao salvar correção" };
  }
}
