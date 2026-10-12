import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, SkipForward, ArrowLeft, Sparkles } from "lucide-react";
import { QuestionConfig } from "../types";

interface QuestionCardProps {
  question: QuestionConfig;
  value: string;
  selectedTags: string[];
  onChangeText: (text: string) => void;
  onToggleTag: (tag: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  selectedTags,
  onChangeText,
  onToggleTag,
  onNext,
  onSkip,
  onPrevious,
  canGoBack = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(92, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const hasContent = value.trim().length > 0 || selectedTags.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl mx-auto flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-10"
      >
        {/* Gestalt context badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6B6B63] font-medium">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={{ backgroundColor: question.themeColor.primary }}
            />
            Momento {question.stepNumber} de 5
          </span>
          <span className="text-[#D8CFBE] text-xs">·</span>
          <span className="text-xs text-[#6B6B63] tracking-wide italic">
            Perceber
          </span>
        </div>

        {/* Primary question */}
        <h1
          id={`question-title-${question.id}`}
          className="font-serif-awareness text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.25] text-[#262B22] tracking-tight mb-3"
        >
          {question.question}
        </h1>

        {/* Subtle guiding subtext */}
        <p className="text-base text-[#6B6B63] font-normal leading-relaxed mb-8 max-w-lg">
          {question.subtext}
        </p>

        {/* Organic response tags */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] uppercase tracking-wider mb-2.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 opacity-60" />
            <span>Sugestões orgânicas (toque para marcar)</span>
          </div>
          <div
            id={`tag-group-${question.id}`}
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Sugestões de percepção"
          >
            {question.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  id={`tag-btn-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-sm transition-all duration-300 border text-left whitespace-nowrap ${
                    isSelected
                      ? "bg-[#262B22] text-[#FDFAF4] border-[#262B22] "
                      : "bg-[#FDFAF4]/80 hover:bg-[#F1E9DB] text-[#4B4B49] border-[#F1E9DB] hover:border-[#D8CFBE]"
                  }`}
                  aria-pressed={isSelected}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free text reflection area */}
        <div className="relative mb-8">
          <textarea
            ref={textareaRef}
            id={`reflection-input-${question.id}`}
            aria-labelledby={`question-title-${question.id}`}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Escreva livremente aqui se desejar... ou apenas observe em silêncio."
            rows={3}
            className="w-full resize-none rounded-2xl bg-[#FDFAF4]/65 border border-[#F1E9DB] focus:border-[#6B6B63] p-4 text-base text-[#262B22] placeholder-[#6B6B63] focus:outline-hidden focus:ring-2 focus:ring-[#6B6B63]/20 transition-all duration-200 leading-relaxed font-normal  "
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onNext();
              }
            }}
          />
          <div className="flex justify-between items-center mt-1.5 px-1 text-xs text-[#6B6B63]">
            <span>Opcional · Não há respostas certas</span>
            <span className="hidden sm:inline">
              Pressione ⌘+Enter para avançar
            </span>
          </div>
        </div>

        {/* Calm action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#F1E9DB]">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            {canGoBack && onPrevious && (
              <button
                id="btn-previous-step"
                type="button"
                onClick={onPrevious}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B6B63] hover:text-[#262B22] rounded-xl hover:bg-[#F1E9DB]/60 transition-colors"
                title="Rever pergunta anterior"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}

            <button
              id="btn-skip-step"
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B6B63] hover:text-[#262B22] rounded-xl hover:bg-[#F1E9DB]/60 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5 opacity-75" />
              <span>Pular esta etapa</span>
            </button>
          </div>

          <div className="order-1 sm:order-2">
            <button
              id="btn-continue-step"
              type="button"
              onClick={onNext}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                hasContent
                  ? "bg-[#262B22] text-[#FDFAF4] hover:bg-[#262B22] "
                  : "bg-[#F1E9DB] text-[#4B4B49] hover:bg-[#D8CFBE]"
              }`}
            >
              <span>
                {hasContent ? "Continuar" : "Apenas continuar sem registrar"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
