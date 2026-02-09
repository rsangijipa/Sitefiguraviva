"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import {
  getPendingSubmissions,
  manualGradeSubmission,
} from "@/actions/grading";
import { assessmentService } from "@/services/assessmentService";
import type { AssessmentDoc, StudentAnswer } from "@/types/assessment";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Loader2,
  Save,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface PendingSubmission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAtDate: string;
  answers: StudentAnswer[];
  score?: number;
  percentage?: number;
}

export default function GradingDashboard({ courseId }: { courseId?: string }) {
  const { addToast } = useToast();

  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PendingSubmission | null>(null);
  const [assessment, setAssessment] = useState<AssessmentDoc | null>(null);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [courseId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const result = await getPendingSubmissions(courseId);

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      setSubmissions(result.submissions || []);
    } catch (error) {
      console.error("Load Submissions Error:", error);
      addToast("Erro ao carregar submissões", "error");
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = async (submission: PendingSubmission) => {
    setSelectedSubmission(submission);

    // Load assessment details
    const assessmentData = await assessmentService.getAssessment(
      submission.assessmentId,
    );
    setAssessment(assessmentData);

    // Initialize grades (keep auto-graded scores)
    const initialGrades: Record<string, number> = {};
    submission.answers.forEach((answer) => {
      if (answer.pointsEarned !== undefined) {
        initialGrades[answer.questionId] = answer.pointsEarned;
      }
    });
    setGrades(initialGrades);
    setFeedback("");
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !assessment) return;

    // Validate: all manual questions must have grades
    const manualQuestions = assessment.questions.filter(
      (q) => q.type === "essay" || q.type === "practical",
    );

    for (const q of manualQuestions) {
      if (grades[q.id] === undefined) {
        addToast(`Atribua uma nota para a questão "${q.title}"`, "error");
        return;
      }
    }

    setIsGrading(true);

    try {
      const questionGrades = Object.entries(grades).map(
        ([questionId, pointsEarned]) => ({
          questionId,
          pointsEarned,
        }),
      );

      const result = await manualGradeSubmission(
        selectedSubmission.id,
        questionGrades,
        feedback,
      );

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      addToast(
        result.passed
          ? `Aluno aprovado com ${result.percentage?.toFixed(1)}%!`
          : `Corrigido: ${result.percentage?.toFixed(1)}%`,
        result.passed ? "success" : "info",
      );

      // Refresh list
      loadSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Grade Error:", error);
      addToast("Erro ao salvar correção", "error");
    } finally {
      setIsGrading(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalScore = () => {
    return Object.values(grades).reduce((sum, points) => sum + points, 0);
  };

  const getPercentage = () => {
    if (!assessment) return 0;
    const total = getTotalScore();
    return assessment.totalPoints > 0
      ? (total / assessment.totalPoints) * 100
      : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">
          Nenhuma correção pendente
        </h3>
        <p className="text-stone-600">Todas as avaliações foram corrigidas!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-800">
              Correção de Avaliações
            </h2>
            <p className="text-stone-600 mt-1">
              {submissions.length} submissões aguardando correção
            </p>
          </div>
          <button
            onClick={loadSubmissions}
            className="px-4 py-2 rounded-xl border-2 border-stone-200 hover:border-primary hover:bg-primary/5 transition-all text-stone-700 font-bold flex items-center gap-2"
          >
            <Loader2 size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:border-primary/30 transition-all cursor-pointer"
            onClick={() => openGradingModal(submission)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-800 mb-1 truncate">
                    {submission.assessmentTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{submission.studentName}</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(submission.submittedAtDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button size="sm">Corrigir</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && assessment && (
        <Modal isOpen={true} onClose={() => setSelectedSubmission(null)}>
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-800 mb-2">
                {assessment.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{selectedSubmission.studentName}</span>
                </div>
                <div>•</div>
                <div>{selectedSubmission.studentEmail}</div>
              </div>
            </div>

            {/* Questions & Grading */}
            <div className="space-y-4">
              {assessment.questions.map((question, idx) => {
                const answer = selectedSubmission.answers.find(
                  (a) => a.questionId === question.id,
                );
                const isManualGrade =
                  question.type === "essay" || question.type === "practical";

                return (
                  <div
                    key={question.id}
                    className="bg-stone-50 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-800 mb-1">
                          {question.title}
                        </h3>
                        <div className="text-xs text-stone-500 mb-2">
                          {question.points} pontos • {question.type}
                        </div>

                        {/* Student Answer */}
                        {question.type === "essay" && answer?.textAnswer && (
                          <div className="bg-white rounded-lg p-4 border border-stone-200 mb-3">
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                              Resposta do Aluno:
                            </div>
                            <p className="text-stone-800 whitespace-pre-wrap">
                              {answer.textAnswer}
                            </p>
                          </div>
                        )}

                        {question.type === "practical" && answer?.fileUrl && (
                          <div className="bg-white rounded-lg p-4 border border-stone-200 mb-3">
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                              Arquivo Enviado:
                            </div>
                            <a
                              href={answer.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-2"
                            >
                              <FileText size={16} />
                              Visualizar arquivo
                            </a>
                          </div>
                        )}

                        {/* Auto-graded display */}
                        {!isManualGrade && answer && (
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold",
                              answer.isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700",
                            )}
                          >
                            {answer.isCorrect ? (
                              <CheckCircle size={14} />
                            ) : (
                              <AlertCircle size={14} />
                            )}
                            {answer.isCorrect ? "Correta" : "Incorreta"} •{" "}
                            {answer.pointsEarned || 0}/{question.points} pts
                          </div>
                        )}

                        {/* Manual Grading Input */}
                        {isManualGrade && (
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">
                              Nota (0 a {question.points})
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={question.points}
                              step="0.5"
                              value={grades[question.id] || 0}
                              onChange={(e) =>
                                setGrades({
                                  ...grades,
                                  [question.id]:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-32 px-4 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                Feedback Geral (Opcional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary outline-none min-h-[100px] resize-y"
                placeholder="Comentários sobre o desempenho do aluno..."
              />
            </div>

            {/* Summary */}
            <div className="bg-primary/5 rounded-xl p-4 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-700">Nota Final:</span>
                <span className="text-2xl font-bold text-stone-800">
                  {getTotalScore()} / {assessment.totalPoints}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700">Percentual:</span>
                <span
                  className={cn(
                    "text-xl font-bold",
                    getPercentage() >= assessment.passingScore
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {getPercentage().toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Nota mínima: {assessment.passingScore}%
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedSubmission(null)}
                variant="outline"
                className="flex-1"
                disabled={isGrading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGrade}
                disabled={isGrading}
                className="flex-1 gap-2"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Correção
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
