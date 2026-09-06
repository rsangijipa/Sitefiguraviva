import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Quiz, Screening, Answer, AnswerValue } from "../types";
import { AppHeader } from "./AppHeader";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { AnswerOption } from "./AnswerOption";
import "./QuizEngine.css";

interface QuizEngineProps {
  questionnaire: Quiz | Screening;
  onComplete: (answers: Answer[]) => void;
  onBack?: () => void;
}

export function QuizEngine({
  questionnaire,
  onComplete,
  onBack,
}: QuizEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === questionnaire.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id,
  );

  const handleAnswer = (value: AnswerValue) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
      return [...filtered, { questionId: currentQuestion.id, value }];
    });
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        onComplete(answers);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsTransitioning(false);
    }, 200);
  };

  const canProceed = !!currentAnswer;

  return (
    <div className="quiz-engine">
      <AppHeader onBack={onBack} showBack={!!onBack} />

      <main className="qz-app-container quiz-engine__main">
        <div className="quiz-engine__content">
          {/* Progress */}
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questionnaire.questions.length}
          />

          {/* Question */}
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <div key={currentQuestion.id}>
                <QuestionCard
                  question={currentQuestion}
                  index={currentQuestionIndex}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Answers */}
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={`answers-${currentQuestion.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="quiz-engine__answers"
              >
                {questionnaire.answerOptions.map((option, index) => (
                  <AnswerOption
                    key={index}
                    label={option}
                    value={questionnaire.answerOptions[index] as AnswerValue}
                    selected={
                      currentAnswer?.value ===
                      questionnaire.answerOptions[index]
                    }
                    onClick={() =>
                      handleAnswer(
                        questionnaire.answerOptions[index] as AnswerValue,
                      )
                    }
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="quiz-engine__navigation">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="qz-btn qz-btn-secondary"
              style={{ visibility: isFirstQuestion ? "hidden" : "visible" }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="qz-btn qz-btn-primary"
            >
              {isLastQuestion ? "Finalizar" : "Continuar"}
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
