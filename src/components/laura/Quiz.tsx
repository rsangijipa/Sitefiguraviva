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
    <section className="py-16 md:py-24 bg-[#FDFAF4] relative overflow-hidden border-t border-[#D8CFBE]">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/30" />
            <span className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center">
              <Trophy size={20} className="text-[#005A1F]" />
            </span>
            <div className="h-px w-10 bg-[#96551F]/30" />
          </div>

          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F] block mb-2">
            Teste Seu Conhecimento
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight">
            Qual Conceito de Laura{" "}
            <span className="italic text-[#96551F] font-light">Você É?</span>
          </h2>
        </div>

        {/* Quiz Card */}
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl border border-[#D8CFBE] shadow-xs overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="h-2 bg-[#D8CFBE]/40">
                <motion.div
                  className="h-full bg-[#005A1F]"
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
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-[#96551F] font-bold uppercase tracking-wider">
                    Pergunta {currentQuestion + 1} de {quiz.length}
                  </span>
                  <span className="text-xs text-[#005A1F] font-bold">
                    {score.correct} corretas
                  </span>
                </div>

                <h3 className="font-serif text-xl md:text-2xl font-bold text-[#005A1F] mb-6 leading-relaxed">
                  {quiz[currentQuestion].question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {quiz[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        showResult
                          ? option.correct
                            ? "border-[#005A1F] bg-[#005A1F]/10 text-[#005A1F] font-semibold"
                            : selectedOption === index
                              ? "border-red-400 bg-red-50 text-red-800"
                              : "border-[#D8CFBE] opacity-40 text-stone-500"
                          : selectedOption === index
                            ? "border-[#005A1F] bg-[#FDFAF4] text-[#005A1F]"
                            : "border-[#D8CFBE] hover:border-[#005A1F]/50 hover:bg-[#FDFAF4] text-[#262B22]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-sm">
                          {option.text}
                        </span>
                        {showResult && option.correct && (
                          <CheckCircle
                            size={18}
                            className="text-[#005A1F] shrink-0"
                          />
                        )}
                        {showResult &&
                          selectedOption === index &&
                          !option.correct && (
                            <XCircle
                              size={18}
                              className="text-red-500 shrink-0"
                            />
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
                      className="mt-5 p-4 bg-[#FDFAF4] border-l-4 border-l-[#96551F] border border-[#D8CFBE] rounded-xl"
                    >
                      <p className="font-serif italic text-sm text-[#262B22] leading-relaxed">
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
                  className="px-6 py-4 bg-[#FDFAF4] border-t border-[#D8CFBE]"
                >
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 bg-[#005A1F] text-[#FDFAF4] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#07614C] transition-colors shadow-xs cursor-pointer"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-[#D8CFBE] p-8 text-center shadow-xs"
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center mb-4">
                  <Trophy size={36} className="text-[#005A1F]" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#005A1F] mb-1">
                  Resultado Final
                </h3>

                <div className="text-6xl font-serif font-bold text-[#005A1F] my-3">
                  {percentage}%
                </div>

                <p className="text-xs uppercase tracking-wider font-semibold text-[#96551F]">
                  {score.correct} de {score.total} perguntas corretas
                </p>
              </div>

              {/* Message based on score */}
              <div className="mb-6 p-4 bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl">
                <p className="font-serif text-[#262B22] text-sm leading-relaxed italic">
                  {percentage >= 75
                    ? "Excelente! Você realmente conhece o legado de Laura Perls."
                    : percentage >= 50
                      ? "Bom trabalho! Mas ainda há muito a aprender sobre Laura."
                      : "Que tal estudar mais sobre Laura Perls e tentar novamente?"}
                </p>
              </div>

              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#005A1F] text-[#FDFAF4] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#07614C] transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw size={15} />
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
