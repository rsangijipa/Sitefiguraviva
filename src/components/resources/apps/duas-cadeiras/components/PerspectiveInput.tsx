import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRightLeft, CornerDownLeft, Sparkles } from "lucide-react";
import { ChairConfig, ChairId } from "../types";

interface PerspectiveInputProps {
  activeChair: ChairId;
  activeConfig: ChairConfig;
  otherConfig: ChairConfig;
  onSubmitTurn: (text: string, switchNext: boolean) => void;
  onSwitchOnly: () => void;
  isPaused: boolean;
}

export const PerspectiveInput: React.FC<PerspectiveInputProps> = ({
  activeChair,
  activeConfig,
  otherConfig,
  onSubmitTurn,
  onSwitchOnly,
  isPaused,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when switching perspectives
  useEffect(() => {
    if (!isPaused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeChair, isPaused]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      // If empty, user can just switch places
      onSwitchOnly();
      return;
    }
    onSubmitTurn(trimmed, true);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  if (isPaused) {
    return (
      <div
        id="paused-reflection-notice"
        className="w-full max-w-2xl mx-auto rounded-xl bg-paper border border-dashed border-nevoa p-8 text-center text-mata space-y-2"
      >
        <p className="text-sm font-medium text-mata">
          Sessão em pausa reflexiva
        </p>
        <p className="text-xs text-mata max-w-md mx-auto">
          Respire fundo. Observe as palavras trocadas até o momento a partir de
          uma postura neutra e sem julgamentos. Quando desejar retomar a
          conversa, clique em &ldquo;Retomar&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChair}
          initial={{ opacity: 0, x: activeChair === "A" ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeChair === "A" ? 16 : -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl bg-paper border border-nevoa/90  p-4 sm:p-5 transition-all"
        >
          {/* Header of the active perspective */}
          <div className="flex items-center justify-between pb-3 border-b border-nevoa mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-mata">
                  Falando como:
                </span>
                <span className="text-sm font-semibold text-mata">
                  {activeConfig.name}
                </span>
                <span className="text-xs text-mata">
                  (Cadeira {activeChair})
                </span>
              </div>
            </div>

            <span className="text-xs text-mata font-mono">
              {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
            </span>
          </div>

          {/* Dedicated Textarea only active for this chair */}
          <div className="relative">
            <textarea
              id={`perspective-input-${activeChair.toLowerCase()}`}
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder={`Diga o que ${activeConfig.name} sente ou pensa neste momento...`}
              className="w-full resize-none rounded-xl border border-nevoa bg-paper/50 p-3.5 text-sm text-mata placeholder:text-mata focus:bg-paper focus:border-nevoa focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-switch-place-only"
                onClick={onSwitchOnly}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-mata hover:text-mata hover:bg-paper rounded-lg transition-colors cursor-pointer"
                title="Mudar de cadeira sem registrar fala"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Trocar sem falar</span>
              </button>
              <span className="hidden sm:inline text-[11px] text-mata">
                Atalho:{" "}
                <kbd className="font-mono bg-paper px-1 py-0.5 rounded border border-nevoa">
                  Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="font-mono bg-paper px-1 py-0.5 rounded border border-nevoa">
                  Enter
                </kbd>
              </span>
            </div>

            <button
              type="button"
              id="btn-submit-turn-and-switch"
              onClick={() => handleSubmit()}
              disabled={!content.trim()}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                content.trim()
                  ? "bg-primary text-paper hover:bg-primary hover: active:scale-[0.98]"
                  : "bg-paper text-mata cursor-not-allowed"
              }`}
            >
              <span>Registrar e Trocar de Lugar</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
