"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Trophy, RefreshCw } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function Quiz() {
  const { quiz } = lauraPerlsContent;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: quiz.length });
  const [finished, setFinished] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;

    setSelectedOption(optionIndex);
    const isCorrect = quiz[currentQuestion].options[optionIndex].correct;
    setCorrect(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setCorrect(null);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setCorrect(null);
    setScore({ correct: 0, total: quiz.length });
    setFinished(false);
  };

  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <section className="py-24 bg-[#5c4a32] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="quizPattern"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="15" cy="15" r="2" fill="#f5f2eb" />
            </pattern>
          </defs>
          <rect fill="url(#quizPattern)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="w-10 h-10 rounded-full bg-[#f5f2eb] flex items-center justify-center">
              <Trophy size={20} className="text-[#5c4a32]" />
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#d4c4a8] block mb-4">
            Teste Seu Conhecimento
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#f5f2eb] leading-tight">
            Qual Conceito de Laura{" "}
            <span className="italic text-[#c9a86c] font-light">Você É?</span>
          </h2>
        </div>

        {/* Quiz Card */}
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-[#f5f2eb] rounded-lg shadow-2xl overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="h-2 bg-[#e8dfd1]">
                <motion.div
                  className="h-full bg-[#c9a86c]"
                  initial={{
                    width: `${(currentQuestion / quiz.length) * 100}%`,
                  }}
                  animate={{
                    width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-[#a89080] font-bold uppercase tracking-widest">
                    Pergunta {currentQuestion + 1} de {quiz.length}
                  </span>
                  <span className="text-sm text-[#c9a86c] font-bold">
                    {score.correct} corretas
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-[#5c4a32] mb-8 leading-relaxed">
                  {quiz[currentQuestion].question}
                </h3>

                {/* Options */}
                <div className="space-y-4">
                  {quiz[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                        showResult
                          ? option.correct
                            ? "border-green-500 bg-green-50"
                            : selectedOption === index
                              ? "border-red-500 bg-red-50"
                              : "border-[#e8dfd1] opacity-50"
                          : selectedOption === index
                            ? "border-[#5c4a32] bg-[#f0ebe0]"
                            : "border-[#e8dfd1] hover:border-[#c9a86c] hover:bg-[#faf8f3]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#5c4a32]">
                          {option.text}
                        </span>
                        {showResult && option.correct && (
                          <CheckCircle size={20} className="text-green-500" />
                        )}
                        {showResult &&
                          selectedOption === index &&
                          !option.correct && (
                            <XCircle size={20} className="text-red-500" />
                          )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-6 p-4 bg-[#f0ebe0] border-l-4 border-[#c9a86c] rounded-r-sm"
                    >
                      <p className="font-serif italic text-[#6b5a45]">
                        {quiz[currentQuestion].explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Button */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-8 py-4 bg-[#f0ebe0] border-t border-[#e8dfd1] flex justify-end"
                >
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-3 bg-[#5c4a32] text-[#f5f2eb] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#4a3f2a] transition-colors"
                  >
                    {currentQuestion < quiz.length - 1
                      ? "Próxima Pergunta"
                      : "Ver Resultado"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Final Result */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#f5f2eb] rounded-lg shadow-2xl p-8 text-center"
            >
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#5c4a32] flex items-center justify-center mb-6">
                  <Trophy size={56} className="text-[#c9a86c]" />
                </div>

                <h3 className="font-serif text-3xl text-[#5c4a32] mb-2">
                  Resultado Final
                </h3>

                <div className="text-6xl font-serif font-bold text-[#5c4a32] mb-2">
                  {percentage}%
                </div>

                <p className="text-[#8b7355] font-serif italic">
                  {score.correct} de {score.total} perguntas corretas
                </p>
              </div>

              {/* Message based on score */}
              <div className="mb-8 p-4 bg-[#f0ebe0] rounded-lg">
                <p className="font-serif text-[#5c4a32]">
                  {percentage >= 75
                    ? "Excelente! Você realmente conhece o legado de Laura Perls."
                    : percentage >= 50
                      ? "Bom trabalho! Mas ainda há muito a aprender sobre Laura."
                      : "Que tal estudar mais sobre Laura Perls e tentar novamente?"}
                </p>
              </div>

              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a86c] text-[#5c4a32] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#d4b96a] transition-colors"
              >
                <RefreshCw size={16} />
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
