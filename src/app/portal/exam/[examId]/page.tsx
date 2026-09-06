import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { AssessmentDoc, AssessmentSubmissionDoc } from "@/types/assessment";
import { ExamExitWrapper } from "@/components/assessment/ExamExitWrapper"; // Ensure this path is correct
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { requireSession } from "@/lib/auth/server";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const session = await requireSession("/auth");
  const uid = session.uid;

  // Fetch Assessment & Submission (Parallel)
  // NOTE: In production, use "submissions" collection query where assessmentId == examId AND userId == uid to find latest
  // For MVP, we effectively used ID like `${uid}_${assessmentId}_draft` for drafts and timestamped for finals.
  // We need to check if there is ANY 'submitted'/'graded' submission first to block retakes.

  const supabase = createSupabaseServiceClient();
  const [
    { data: assessmentRow, error: assessmentError },
    { data: submissionRows, error: submissionsError },
  ] = await Promise.all([
    supabase.from("assessments").select("*").eq("id", examId).maybeSingle(),
    supabase
      .from("assessment_submissions")
      .select("*")
      .eq("assessment_id", examId)
      .eq("user_id", uid)
      .in("status", ["submitted", "graded"])
      .limit(1),
  ]);
  if (assessmentError || submissionsError)
    throw assessmentError || submissionsError;

  if (!assessmentRow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-stone-800">
          Avaliação não encontrada
        </h1>
        <Link
          href="/portal"
          className="mt-4 text-primary font-bold hover:underline"
        >
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  const assessment = {
    id: assessmentRow.id,
    ...assessmentRow,
    courseId: assessmentRow.course_id,
  } as AssessmentDoc;

  // Check if already completed
  if (submissionRows?.length) {
    const submission = {
      id: submissionRows[0].id,
      ...submissionRows[0],
    } as AssessmentSubmissionDoc;
    const passed = submission.passed;

    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-100 p-8 text-center animate-fade-in-up">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
          >
            {passed ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
          </div>

          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">
            {passed ? "Parabéns! Você foi aprovado." : "Não foi dessa vez."}
          </h1>

          <p className="text-stone-500 mb-6">
            Você finalizou a avaliação <strong>{assessment.title}</strong> com
            nota <strong>{submission.score?.toFixed(1)}</strong>.
          </p>

          <Link href="/portal">
            <Button className="w-full">Voltar para o Painel</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check for Draft
  const { data: draftRow } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("id", `${uid}_${examId}_draft`)
    .maybeSingle();
  const existingSubmission = draftRow
    ? ({
        id: draftRow.id,
        ...draftRow,
        assessmentId: draftRow.assessment_id,
        userId: draftRow.user_id,
      } as unknown as AssessmentSubmissionDoc)
    : undefined;

  return (
    <ExamExitWrapper
      assessment={assessment}
      existingSubmission={existingSubmission}
    />
  );
}
