"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PracticeProps {
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

export function SlowingPractice({
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeProps) {
  const [lowStimulus, setLowStimulus] = useState(false);

  return (
    <div
      className={`flex flex-col items-center gap-6 ${lowStimulus ? "min-h-[60vh] justify-center py-6" : "py-6 sm:py-10"}`}
    >
      {!lowStimulus && (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[-1] h-px bg-gradient-to-r from-transparent via-terra/20 to-transparent"
            aria-hidden="true"
          />
        </>
      )}

      <motion.div
        animate={isActive && !lowStimulus ? { x: [-80, 80, -80] } : undefined}
        transition={
          isActive && !lowStimulus
            ? { duration: 20, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        style={{ width: 240 }}
        aria-hidden="true"
      >
        <div className="h-px w-full bg-terra/15" />
      </motion.div>

      <p
        className={`font-serif text-primary ${lowStimulus ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
      >
        Por alguns instantes, deixe uma tarefa de lado e perceba o apoio sob
        você.
      </p>

      {!lowStimulus && (
        <svg
          viewBox="0 0 200 16"
          className="w-64 opacity-20"
          aria-hidden="true"
        >
          <path
            d="M0 8 Q50 2 100 8 Q150 14 200 8"
            className="fill-none stroke-primary/30"
            strokeWidth="0.75"
          />
        </svg>
      )}

      <button
        onClick={() => setLowStimulus((v) => !v)}
        className="min-h-[44px] rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra focus:ring-gold focus:ring-offset-2"
        aria-pressed={lowStimulus}
      >
        {lowStimulus ? "Voltar à visualização completa" : "Reduzir estímulos"}
      </button>

      <button
        onClick={() => onPhaseChange?.("encerrar")}
        className="text-sm text-muted underline-offset-4 hover:text-terra hover:underline"
      >
        Não sei / Encerrar
      </button>
    </div>
  );
}
