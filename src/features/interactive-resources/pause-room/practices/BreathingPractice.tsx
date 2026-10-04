"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wind, Eye } from "lucide-react";

interface PracticeProps {
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

export function BreathingPractice({
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeProps) {
  const [staticMode, setStaticMode] = useState(false);
  const [phase, setPhase] = useState("expandindo");

  useEffect(() => {
    if (!isActive || staticMode) return;
    const cycleMs = 6000;
    let start: number | null = null;
    let raf: number;

    function tick(now: number) {
      if (!start) start = now;
      const elapsed = (((now - start) % cycleMs) + cycleMs) % cycleMs;
      const isExpanding = elapsed < cycleMs / 2;
      const p = isExpanding ? "expandindo" : "contraindo";
      if (p !== phase) {
        setPhase(p);
        onPhaseChange?.(isExpanding ? "inspirando" : "expirando");
      }
      raf = requestAnimationFrame(tick);
    }

    if (isActive) {
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
  }, [isActive, staticMode, phase, onPhaseChange]);

  const fig = (
    <svg
      viewBox="0 0 120 120"
      className="h-40 w-40 sm:h-48 sm:w-48"
      role="img"
      aria-label={phase}
    >
      <ellipse
        cx="60"
        cy="60"
        rx="40"
        ry="35"
        className="fill-primary/10 stroke-primary/30"
        strokeWidth="1.5"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="max-w-lg text-center font-serif text-xl text-primary sm:text-2xl">
        Perceba sua respiração como ela está. Acompanhe a forma apenas se for
        confortável.
      </p>

      {!staticMode && (
        <div className="relative flex h-52 w-full justify-center sm:h-64">
          <motion.div
            animate={
              isActive && !reducedMotion
                ? { scale: [0.85, 1.15, 0.85] }
                : undefined
            }
            transition={
              isActive && !reducedMotion
                ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
            style={{ transformOrigin: "center center" }}
          >
            {fig}
          </motion.div>
          {reducedMotion && isActive && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "center center" }}
            >
              {fig}
            </motion.div>
          )}
        </div>
      )}

      <button
        onClick={() => setStaticMode((v) => !v)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra focus:ring-gold focus:ring-offset-2"
        aria-pressed={staticMode}
      >
        {staticMode ? (
          <Wind size={16} aria-hidden="true" />
        ) : (
          <Eye size={16} aria-hidden="true" />
        )}
        {staticMode
          ? "Voltar à animação"
          : "Observe uma respiração de cada vez"}
      </button>

      {staticMode && (
        <p className="max-w-md text-center font-serif text-lg text-igarape">
          Inspire sem pressa. Expire sem pressa. Deixe o corpo fazer isso
          sozinho.
        </p>
      )}

      <div aria-live="polite" className="sr-only">
        {phase === "expandindo" ? "inspirando" : "expirando"}
      </div>

      <button
        onClick={() => onPhaseChange?.("encerrar")}
        className="mt-2 text-sm text-muted underline-offset-4 hover:text-terra hover:underline"
      >
        Não sei / Encerrar
      </button>
    </div>
  );
}
