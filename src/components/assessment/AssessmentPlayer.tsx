"use client";

import { useReducer, useEffect } from "react";
import { AssessmentDoc, AssessmentSubmissionDoc } from "@/types/assessment";
import { QuestionRenderer } from "./QuestionRenderer";
import { AssessmentNavigation } from "./AssessmentNavigation";
import { Clock, CheckCircle } from "lucide-react";
import { saveDraft, submitAssessment } from "@/app/actions/assessment";

interface AssessmentPlayerProps {
  assessment: AssessmentDoc;
  existingSubmission?: AssessmentSubmissionDoc;
  onExit: () => void;
}

// State Action Types
type Action =
  | { type: "SET_ANSWER"; questionId: string; value: any }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "JUMP_TO_QUESTION"; index: number }
  | { type: "MARK_SAVED" }
  | { type: "MARK_SAVING" };

interface State {
  currentIndex: number;
  answers: Record<string, any>;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
        isSaving: true, // Optimistic UI
      };
    case "NEXT_QUESTION":
      return { ...state, currentIndex: state.currentIndex + 1 };
    case "PREV_QUESTION":
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };
    case "JUMP_TO_QUESTION":
      return { ...state, currentIndex: action.index };
    case "MARK_SAVED":
      return { ...state, isSaving: false, lastSavedAt: new Date() };
    case "MARK_SAVING":
      return { ...state, isSaving: true };
    default:
      return state;
  }
}

export const AssessmentPlayer = ({
  assessment,
  existingSubmission,
  onExit,
}: AssessmentPlayerProps) => {
  // Initial State Setup
  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    answers: existingSubmission?.answers
      ? existingSubmission.answers.reduce(
          (acc, ans) => {
            // Map StudentAnswer back to simple value for UI state
            let val: any = undefined;
            if (ans.selectedOptions && ans.selectedOptions.length > 0) {
              // If multiple choice allowMultiple is true, it might be an array.
              // But here we need to know the question type to be sure, or just store what we have.
              // For simplicity, if length is 1 take first, else take array?
              // Or just check if the question allows multiple?
              // We don't have easy access to question type here without searching.
              // Let's rely on how we stored it. In action we made it array.
              // But for Single Choice UI it expects a string.
              // Let's keep it as array if > 1 or just return the array and let UI handle it.
              val =
                ans.selectedOptions.length === 1
                  ? ans.selectedOptions[0]
                  : ans.selectedOptions;
            } else if (ans.booleanAnswer !== undefined) {
              val = ans.booleanAnswer;
            } else if (ans.textAnswer !== undefined) {
              val = ans.textAnswer;
            }

            if (val !== undefined) {
              acc[ans.questionId] = val;
            }
            return acc;
          },
          {} as Record<string, any>,
        )
      : {},
    isSaving: false,
    lastSavedAt: existingSubmission?.lastSavedAt?.toDate() || null,
  });

  // Autosave Effect (Debounced)
  useEffect(() => {
    if (!state.isSaving) return;

    const timer = setTimeout(async () => {
      try {
        console.log("Auto-saving draft...");
        await saveDraft(assessment.id, state.answers);
        dispatch({ type: "MARK_SAVED" });
      } catch (err) {
        console.error("Autosave failed", err);
        // Optionally handle error state
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [state.answers, state.isSaving, assessment.id]);

  const currentQuestion = assessment.questions[state.currentIndex];
  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === assessment.questions.length - 1;

  const handleAnswerChange = (val: any) => {
    dispatch({
      type: "SET_ANSWER",
      questionId: currentQuestion.id,
      value: val,
    });
  };

  const handleFinish = async () => {
    const confirm = window.confirm(
      "Tem certeza que deseja finalizar a prova? Você não poderá alterar suas respostas depois.",
    );
    if (confirm) {
      try {
        // Ensure final state is sent
        await submitAssessment(assessment.id, state.answers);
        alert("Prova enviada com sucesso!");
        onExit(); // This should trigger the parent to refresh or redirect
      } catch (error) {
        console.error("Submission failed", error);
        alert("Erro ao enviar. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col pb-24">
      {/* Topbar: Timer & Status */}
      <header className="h-16 px-6 bg-white border-b border-stone-100 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="font-serif font-bold text-stone-800 text-lg line-clamp-1">
            {assessment.title}
          </h1>
          {/* Autosave Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            {state.isSaving ? (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle size={12} className="text-green-500" />
                Salvo
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Placeholder */}
          {assessment.timeLimit && (
            <div className="px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-2 text-sm font-bold text-stone-600 font-mono">
              <Clock size={16} />
              45:00
            </div>
          )}
        </div>
      </header>

      {/* Main Content: Question */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <QuestionRenderer
          key={currentQuestion.id} // Force remount on change for animation
          question={currentQuestion}
          value={state.answers[currentQuestion.id]}
          onChange={handleAnswerChange}
          readOnly={false}
        />
      </main>

      {/* Bottom Nav */}
      <AssessmentNavigation
        currentIndex={state.currentIndex}
        totalQuestions={assessment.questions.length}
        onNext={() => dispatch({ type: "NEXT_QUESTION" })}
        onPrev={() => dispatch({ type: "PREV_QUESTION" })}
        onReview={() => console.log("Open Grid")}
        onFinish={handleFinish}
        canNext={!isLast}
        canPrev={!isFirst}
        isLast={isLast}
      />
    </div>
  );
};
