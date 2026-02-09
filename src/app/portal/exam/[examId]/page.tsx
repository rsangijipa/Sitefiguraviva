import { auth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AssessmentDoc, AssessmentSubmissionDoc } from "@/types/assessment";
import { ExamExitWrapper } from "@/components/assessment/ExamExitWrapper"; // Ensure this path is correct
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) redirect("/login");

  let uid;
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    uid = decodedClaims.uid;
  } catch {
    redirect("/login");
  }

  // Fetch Assessment & Submission (Parallel)
  // NOTE: In production, use "submissions" collection query where assessmentId == examId AND userId == uid to find latest
  // For MVP, we effectively used ID like `${uid}_${assessmentId}_draft` for drafts and timestamped for finals.
  // We need to check if there is ANY 'submitted'/'graded' submission first to block retakes.

  const [assessmentDoc, submissionsSnap] = await Promise.all([
    db.collection("assessments").doc(examId).get(),
    db
      .collection("submissions")
      .where("assessmentId", "==", examId)
      .where("userId", "==", uid)
      .where("status", "in", ["submitted", "graded"])
      .limit(1)
      .get(),
  ]);

  if (!assessmentDoc.exists) {
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
    id: assessmentDoc.id,
    ...assessmentDoc.data(),
  } as AssessmentDoc;

  // Check if already completed
  if (!submissionsSnap.empty) {
    const submission = {
      id: submissionsSnap.docs[0].id,
      ...submissionsSnap.docs[0].data(),
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
  const draftDoc = await db
    .collection("submissions")
    .doc(`${uid}_${examId}_draft`)
    .get();
  const existingSubmission = draftDoc.exists
    ? ({ id: draftDoc.id, ...draftDoc.data() } as AssessmentSubmissionDoc)
    : undefined;

  return (
    <ExamExitWrapper
      assessment={assessment}
      existingSubmission={existingSubmission}
    />
  );
}
