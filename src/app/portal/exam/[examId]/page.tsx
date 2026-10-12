import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { AssessmentSubmissionDoc } from "@/types/assessment";
import { getStudentAssessmentForSession } from "@/features/assessments/infrastructure/studentAssessmentQueries.server";
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

  const assessment = await getStudentAssessmentForSession(examId);
  if (!assessment) {
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

  const supabase = createSupabaseServiceClient();
  const { data: submissionRow, error: submissionError } = await supabase
    .from("assessment_submissions")
    .select(
      "id,assessment_id,user_id,course_id,answers,status,score,percentage,passed,attempt_number,started_at,submitted_at,updated_at",
    )
    .eq("assessment_id", examId)
    .eq("user_id", uid)
    .order("attempt_number", { ascending: false })
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (submissionError) throw submissionError;

  // Check if already completed
  if (submissionRow && submissionRow.status !== "pending") {
    const submission = submissionRow;
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

  const existingSubmission = submissionRow
    ? ({
        id: submissionRow.id,
        assessmentId: submissionRow.assessment_id,
        userId: submissionRow.user_id,
        courseId: submissionRow.course_id,
        answers: submissionRow.answers,
        status: submissionRow.status,
        attemptNumber: submissionRow.attempt_number,
        startedAt: submissionRow.started_at,
        lastSavedAt: submissionRow.updated_at,
      } as unknown as AssessmentSubmissionDoc)
    : undefined;

  return (
    <ExamExitWrapper
      assessment={assessment}
      existingSubmission={existingSubmission}
    />
  );
}
