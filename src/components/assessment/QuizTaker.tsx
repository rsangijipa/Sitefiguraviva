"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { assessmentService } from "@/services/assessmentService";
import { gradeAssessment } from "@/actions/assessment";
import type {
  AssessmentDoc,
  StudentAnswer,
  MultipleChoiceQuestion,
} from "@/types/assessment";
import Button from "@/components/ui/Button";
import FileUploader from "@/components/common/FileUploader";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface QuizTakerProps {
  assessmentId: string;
  onComplete?: (result: any) => void;
}

export default function QuizTaker({
  assessmentId,
  onComplete,
}: QuizTakerProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [assessment, setAssessment] = useState<AssessmentDoc | null>(null);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load assessment
  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  // Timer
  useEffect(() => {
    if (!assessment?.timeLimit) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = assessment.timeLimit! * 60 - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        handleSubmit(); // Auto-submit when time runs out
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, startTime]);

  const loadAssessment = async () => {
    if (!user) return;

    try {
      const data = await assessmentService.getAssessment(assessmentId);
      if (!data) {
        addToast("Avaliação não encontrada", "error");
        return;
      }

      setAssessment(data);

      // Start attempt
      const submissionId = await assessmentService.startAssessment(
        assessmentId,
        user.uid,
        data.courseId,
      );
      setCurrentSubmissionId(submissionId);
      setStartTime(Date.now());

      // Shuffle questions if configured
      if (data.shuffleQuestions) {
        data.questions = [...data.questions].sort(() => Math.random() - 0.5);
      }

      // Shuffle options for multiple choice
      if (data.shuffleOptions) {
        data.questions = data.questions.map((q) => {
          if (q.type === "multiple_choice") {
            return {
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5),
            };
          }
          return q;
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Load Assessment Error:", error);
      addToast("Erro ao carregar avaliação", "error");
    }
  };

  const handleAnswerChange = (
    questionId: string,
    answer: Partial<StudentAnswer>,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        ...prev[questionId],
        ...answer,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!currentSubmissionId || !assessment) return;

    setIsSubmitting(true);

    try {
      // Convert answers to array
      const answersArray = Object.values(answers);

      // Submit to Firestore
      await assessmentService.submitAssessment(
        currentSubmissionId,
        answersArray,
      );

      // Grade assessment (server-side)
      const result = await gradeAssessment(currentSubmissionId);

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      if (result.requiresManualReview) {
        addToast("Avaliação enviada para correção manual", "success");
      } else if (result.passed) {
        addToast(
          `Parabéns! Você passou com ${result.percentage?.toFixed(1)}%`,
          "success",
        );
      } else {
        addToast(
          `Você obteve ${result.percentage?.toFixed(1)}%. Nota mínima: ${assessment.passingScore}%`,
          "error",
        );
      }

      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      addToast("Erro ao enviar avaliação", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    const total = assessment?.questions.length || 0;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-20 text-stone-400">
        Avaliação não encontrada
      </div>
    );
  }

  const progress = getProgress();
  const allAnswered = progress === 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold font-serif text-stone-800 mb-2">
          {assessment.title}
        </h1>
        <p className="text-stone-600 mb-4">{assessment.description}</p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
            <div>
              <div className="font-bold text-stone-800">
                {assessment.questions.length} Questões
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                {assessment.totalPoints} pontos
              </div>
            </div>
          </div>

          {assessment.timeLimit && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  timeRemaining && timeRemaining < 300
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600",
                )}
              >
                <Clock size={16} />
              </div>
              <div>
                <div className="font-bold text-stone-800">
                  {timeRemaining !== null
                    ? formatTime(timeRemaining)
                    : `${assessment.timeLimit} min`}
                </div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Tempo restante
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
            <div>
              <div className="font-bold text-stone-800">{progress}%</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                Progresso
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {assessment.questions.map((question, idx) => (
          <div
            key={question.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-bold text-stone-800 mb-1">
                    {question.title}
                  </h3>
                  {question.description && (
                    <p className="text-sm text-stone-600">
                      {question.description}
                    </p>
                  )}
                  <div className="text-xs text-stone-400 mt-1">
                    {question.points} pontos
                  </div>
                </div>

                {/* Multiple Choice */}
                {question.type === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          answers[question.id]?.selectedOptions?.includes(
                            option.id,
                          )
                            ? "border-primary bg-primary/5"
                            : "border-stone-200 hover:border-stone-300",
                        )}
                      >
                        <input
                          type={question.allowMultiple ? "checkbox" : "radio"}
                          name={question.id}
                          checked={
                            answers[question.id]?.selectedOptions?.includes(
                              option.id,
                            ) || false
                          }
                          onChange={(e) => {
                            const current =
                              answers[question.id]?.selectedOptions || [];
                            const newSelection = e.target.checked
                              ? [...current, option.id]
                              : current.filter((id) => id !== option.id);

                            handleAnswerChange(question.id, {
                              selectedOptions: question.allowMultiple
                                ? newSelection
                                : [option.id],
                            });
                          }}
                          className="w-5 h-5"
                        />
                        <span className="text-stone-800">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {question.type === "true_false" && (
                  <div className="flex gap-3">
                    {[true, false].map((value) => (
                      <label
                        key={String(value)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          answers[question.id]?.booleanAnswer === value
                            ? "border-primary bg-primary/5"
                            : "border-stone-200 hover:border-stone-300",
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={
                            answers[question.id]?.booleanAnswer === value
                          }
                          onChange={() =>
                            handleAnswerChange(question.id, {
                              booleanAnswer: value,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span className="font-bold text-stone-800">
                          {value ? "Verdadeiro" : "Falso"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Essay */}
                {question.type === "essay" && (
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary outline-none min-h-[150px] resize-y"
                    placeholder="Digite sua resposta..."
                    value={answers[question.id]?.textAnswer || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, {
                        textAnswer: e.target.value,
                      })
                    }
                  />
                )}

                {/* Practical (File Upload) */}
                {question.type === "practical" && (
                  <div className="space-y-2">
                    {question.instructions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-3">
                        <strong>Instruções:</strong> {question.instructions}
                      </div>
                    )}
                    <FileUploader
                      onUpload={(fileUrl) =>
                        handleAnswerChange(question.id, { fileUrl })
                      }
                      acceptedTypes={
                        question.acceptedFileTypes || [
                          ".pdf",
                          ".doc",
                          ".docx",
                          ".jpg",
                          ".png",
                          ".mp4",
                        ]
                      }
                      maxSizeMB={question.maxFileSize || 10}
                      currentFileUrl={answers[question.id]?.fileUrl}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="font-bold text-stone-800">
            {allAnswered
              ? "Todas as questões respondidas!"
              : `${Object.keys(answers).length} de ${assessment.questions.length} respondidas`}
          </div>
          <div className="text-sm text-stone-600">
            Nota mínima para aprovação: {assessment.passingScore}%
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !allAnswered}
          className="gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Enviando...
            </>
          ) : (
            <>
              Enviar Avaliação
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
