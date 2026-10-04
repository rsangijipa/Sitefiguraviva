"use client";

import { useState, useTransition } from "react";
import {
  AssessmentSubmissionDoc,
  AssessmentDoc,
  StudentAnswer,
  Question,
} from "@/types/assessment";
import { UserData } from "@/types/user";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  BookOpen,
  Calendar,
  Save,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { saveManualGrading } from "@/actions/assessment";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

interface SubmissionGradingClientProps {
  submission: AssessmentSubmissionDoc;
  user: UserData | null;
  assessment: AssessmentDoc | null;
}

export default function SubmissionGradingClient({
  submission,
  user,
  assessment,
}: SubmissionGradingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [gradingAnswers, setGradingAnswers] = useState<StudentAnswer[]>(
    submission.answers,
  );
  const [overallFeedback, setOverallFeedback] = useState(
    submission.feedback || "",
  );
  const { addToast } = useToast();
  const router = useRouter();

  if (!assessment) return <div>Avaliação não encontrada.</div>;

  // TypeScript assertion: assessment is guaranteed to be non-null here
  const assessmentData: AssessmentDoc = assessment;

  const handlePointChange = (questionId: string, points: number) => {
    setGradingAnswers((prev) =>
      prev.map((ans) =>
        ans.questionId === questionId ? { ...ans, pointsEarned: points } : ans,
      ),
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveManualGrading(submission.id, {
        answers: gradingAnswers,
        feedback: overallFeedback,
      });

      if (result.success) {
        addToast("Correção salva com sucesso!", "success");
        router.push("/admin/assessments/submissions");
        router.refresh();
      } else {
        addToast(result.error || "Erro ao salvar correção", "error");
      }
    });
  };

  const totalEarned = gradingAnswers.reduce(
    (sum, a) => sum + (a.pointsEarned || 0),
    0,
  );
  const totalPossible = assessmentData.totalPoints || 0;
  const currentPercentage =
    totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  const isPassing = currentPercentage >= assessmentData.passingScore;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      {/* Left Column: Answers & Grading */}
      <div className="lg:col-span-8 space-y-6">
        {assessmentData.questions.map((q, idx) => {
          const answer = gradingAnswers.find((a) => a.questionId === q.id);
          const isManual = q.type === "essay" || q.type === "practical";

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-stone-50 bg-stone-50/30 flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-800 leading-tight mb-1">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-xs text-stone-500">{q.description}</p>
                    )}
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] uppercase tracking-widest opacity-60"
                    >
                      {q.type.replace("_", " ")} • {q.points} Pontos
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {isManual ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">
                        Nota Manual
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={q.points}
                          step="0.5"
                          value={answer?.pointsEarned || 0}
                          onChange={(e) =>
                            handlePointChange(q.id, parseFloat(e.target.value))
                          }
                          className="w-16 px-2 py-1 bg-white border border-stone-200 rounded-lg text-sm font-bold text-primary focus:border-gold outline-none"
                        />
                        <span className="text-stone-400 text-xs font-bold">
                          / {q.points}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">
                        Auto-Graded
                      </span>
                      <div className="flex items-center gap-1 font-bold text-sm">
                        <span
                          className={cn(
                            answer?.isCorrect
                              ? "text-green-600"
                              : "text-red-500",
                          )}
                        >
                          {answer?.pointsEarned || 0}
                        </span>
                        <span className="text-stone-300">/ {q.points}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {q.type === "multiple_choice" && (
                  <div className="space-y-2">
                    {(q as any).options.map((opt: any) => {
                      const isSelected = answer?.selectedOptions?.includes(
                        opt.id,
                      );
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            "p-3 rounded-xl border text-sm flex items-center justify-between transition-all",
                            isSelected && isCorrect
                              ? "bg-green-50 border-green-200 text-green-700 font-medium"
                              : isSelected && !isCorrect
                                ? "bg-red-50 border-red-200 text-red-700"
                                : !isSelected && isCorrect
                                  ? "bg-stone-50 border-green-100 text-stone-400 italic"
                                  : "bg-white border-stone-100 text-stone-500",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              isCorrect ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )
                            ) : (
                              <div className="w-3.5 h-3.5 border border-stone-200 rounded-full" />
                            )}
                            {opt.text}
                          </div>
                          {isCorrect && (
                            <Badge
                              variant="success"
                              className="text-[8px] py-0 px-1 opacity-50"
                            >
                              Correto
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "true_false" && (
                  <div className="flex gap-4">
                    {[true, false].map((val) => {
                      const isSelected = answer?.booleanAnswer === val;
                      const isCorrect = (q as any).correctAnswer === val;
                      return (
                        <div
                          key={val.toString()}
                          className={cn(
                            "flex-1 p-3 rounded-xl border text-center font-bold text-xs uppercase tracking-widest",
                            isSelected && isCorrect
                              ? "bg-green-50 border-green-200 text-green-700"
                              : isSelected && !isCorrect
                                ? "bg-red-50 border-red-200 text-red-700"
                                : !isSelected && isCorrect
                                  ? "bg-stone-50 border-stone-100 text-stone-300"
                                  : "bg-white border-stone-100 text-stone-400",
                          )}
                        >
                          {val ? "Verdadeiro" : "Falso"}
                          {isSelected && (
                            <span className="ml-2">Student Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "essay" && (
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                      {answer?.textAnswer || (
                        <span className="text-stone-300 italic">
                          Sem resposta fornecida.
                        </span>
                      )}
                    </div>
                    {(q as any).rubric && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                          <BookOpen size={12} /> Rubrica para Avaliação
                        </div>
                        <p className="text-xs text-amber-800/80 leading-relaxed">
                          {(q as any).rubric}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {q.type === "practical" && (
                  <div className="space-y-4">
                    {answer?.fileUrl ? (
                      <a
                        href={answer.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-all group"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Download size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">
                            Baixar Arquivo Entregue
                          </p>
                          <p className="text-[10px] text-primary/60 uppercase tracking-widest font-bold">
                            Trabalho Prático
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-center rounded-xl text-sm font-medium">
                        Nenhum arquivo enviado.
                      </div>
                    )}
                    {(q as any).instructions && (
                      <p className="text-[10px] text-stone-400">
                        <strong>Instruções originais:</strong>{" "}
                        {(q as any).instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Overall Feedback */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-primary" /> Feedback para o
            Aluno
          </h3>
          <textarea
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            placeholder="Escreva um comentário geral sobre o desempenho do aluno..."
            className="w-full h-32 p-4 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all"
          />
        </div>
      </div>

      {/* Right Column: Summary & Actions */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
        {/* Student Info */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-md">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={24} className="text-stone-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-stone-800 leading-tight">
                {user?.displayName || "Aluno"}
              </h3>
              <p className="text-xs text-stone-400 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-xs text-stone-500 flex items-center gap-2">
                <Calendar size={12} /> Enviado em
              </span>
              <span className="text-xs font-bold text-stone-700">
                {submission.submittedAt
                  ? (submission.submittedAt as any)
                      .toDate?.()
                      .toLocaleDateString("pt-BR") ||
                    new Date(submission.submittedAt).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-xs text-stone-500 flex items-center gap-2">
                <AlertCircle size={12} /> Tentativa
              </span>
              <span className="text-xs font-bold text-stone-700">
                #{submission.attemptNumber}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-stone-500 flex items-center gap-2">
                <Clock size={12} /> Status
              </span>
              <Badge
                variant={submission.status === "graded" ? "success" : "warning"}
              >
                {submission.status === "graded" ? "Corrigida" : "Aguardando"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Score Summary Card */}
        <div
          className={cn(
            "rounded-3xl p-8 border text-white shadow-xl relative overflow-hidden transition-all duration-500",
            isPassing
              ? "bg-stone-800 border-stone-700"
              : "bg-red-900 border-red-800",
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
            Nota Final (Calculada)
          </p>
          <div className="flex items-baseline gap-2 mb-6">
            <h2 className="text-5xl font-serif font-bold italic">
              {currentPercentage.toFixed(1)}%
            </h2>
            <span className="opacity-40 text-sm">/ 100%</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000",
                  isPassing ? "bg-gold" : "bg-white/50",
                )}
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
              <span>{totalEarned} pontos</span>
              <span>{totalPossible} total</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isPassing ? (
              <div className="flex items-center gap-2 text-gold font-bold text-xs">
                <CheckCircle size={16} /> Aluno Aprovado (Mín.{" "}
                {assessmentData.passingScore}%)
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/70 font-bold text-xs">
                <XCircle size={16} /> Abaixo da Média (Mín.{" "}
                {assessmentData.passingScore}%)
              </div>
            )}

            <Button
              variant="primary"
              className="w-full mt-4 bg-gold hover:bg-gold/90 text-stone-900 font-bold py-4 rounded-xl shadow-lg border-none"
              leftIcon={<Save size={18} />}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Salvando..." : "Finalizar Correção"}
            </Button>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-full py-4 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
        >
          Voltar para lista
        </button>
      </div>
    </div>
  );
}
