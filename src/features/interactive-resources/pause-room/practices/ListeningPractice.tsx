"use client";

import { motion } from "framer-motion";
import { Ear, VolumeX } from "lucide-react";

interface PracticeProps {
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

export function ListeningPractice({
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="max-w-lg text-center font-serif text-xl text-primary sm:text-2xl">
        Escolha um som e observe como ele se apresenta. Se quiser, note os sons
        do lugar onde {"voc\u00ea"} est\u00e1.
      </p>

      <div
        className="w-full max-w-lg rounded-[24px] border border-border bg-areia p-5 text-center"
        role="note"
      >
        <p className="text-sm leading-relaxed text-muted">
          Este recurso n\u00e3o reproduz nem grava \u00e1udio &mdash; \u00e9 um
          convite para ouvir o ambiente ao seu redor.
        </p>
      </div>

      <svg viewBox="0 0 120 100" className="h-32 w-32" aria-hidden="true">
        <path
          d="M60 15 Q75 35 60 55 Q45 35 60 15Z"
          className="fill-primary/10 stroke-primary/25"
          strokeWidth="1"
        />
        <ellipse
          cx="60"
          cy="55"
          rx="25"
          ry="20"
          className="fill-primary/5 stroke-igarape/15"
          strokeWidth="1"
        />
        <line
          x1="35"
          y1="75"
          x2="85"
          y2="75"
          className="stroke-border/40"
          strokeWidth="0.75"
        />
      </svg>

      <motion.div
        animate={
          isActive && !reducedMotion ? { opacity: [0.3, 0.7, 0.3] } : undefined
        }
        transition={
          isActive && !reducedMotion
            ? { duration: 10, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        <Ear size={28} className="text-igarape/40" aria-hidden="true" />
      </motion.div>

      <button
        disabled
        className="pointer-events-none min-h-[44px] cursor-default rounded-xl border border-border bg-paper px-3 py-2 text-sm font-semibold text-muted opacity-50"
      >
        <VolumeX size={16} className="inline mr-1" aria-hidden="true" />
        Som ambiente &mdash;{" "}
        {"\u00c1udio n\u00e3o dispon\u00edvel neste momento"}
      </button>

      <button
        onClick={() => onPhaseChange?.("encerrar")}
        className="text-sm text-muted underline-offset-4 hover:text-terra hover:underline"
      >
        {"N\u00e3o sei / Encerrar"}
      </button>
    </div>
  );
}
