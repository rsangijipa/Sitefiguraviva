"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Footprints, Move, PauseCircle } from "lucide-react";

interface PracticeProps {
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

type Posture = "sentado" | "em_pe" | "sem_movimento";

const postures: { key: Posture; label: string; icon: React.ReactNode }[] = [
  { key: "sentado", label: "Sentado", icon: <Footprints size={20} /> },
  { key: "em_pe", label: "Em pé", icon: <Move size={20} /> },
  {
    key: "sem_movimento",
    label: "Sem movimento",
    icon: <PauseCircle size={20} />,
  },
];

export function MovementPractice({
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeProps) {
  const [posture, setPosture] = useState<Posture | null>(null);

  if (!isActive || !posture) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <p className="max-w-lg text-center font-serif text-xl text-primary sm:text-2xl">
          Se for cômodo, experimente um pequeno movimento das mãos ou dos
          ombros. Você pode permanecer imóvel e apenas observar.
        </p>
        <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:flex sm:gap-4">
          {postures.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setPosture(key);
                onPhaseChange?.("movimentar");
              }}
              className="flex flex-col items-center gap-2 rounded-[24px] border border-border bg-paper px-3 py-5 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra focus:ring-gold focus:ring-offset-2"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const showMovement = posture !== "sem_movimento" && !reducedMotion;

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="max-w-lg text-center font-serif text-lg text-igarape">
        {posture === "sem_movimento"
          ? "Você escolheu permanecer imóvel. Isso é suficiente."
          : "Siga apenas o que for cômodo."}
      </p>

      {showMovement && (
        <svg
          viewBox="0 0 120 140"
          className="h-40 w-40"
          role="img"
          aria-label="Sugestão de movimento suave"
        >
          <motion.g
            animate={isActive ? { y: [0, -8, 0] } : undefined}
            transition={
              isActive
                ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            <ellipse
              cx="60"
              cy="25"
              rx="12"
              ry="15"
              className="fill-primary/10 stroke-primary/25"
              strokeWidth="1"
            />
            <line
              x1="60"
              y1="40"
              x2="60"
              y2="85"
              className="stroke-primary/30"
              strokeWidth="1.5"
            />
            {posture === "sentado" ? (
              <>
                <path
                  d="M60 55 Q45 65 40 80"
                  className="fill-none stroke-terra/30"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M60 55 Q75 65 80 80"
                  className="fill-none stroke-terra/30"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <motion.path
                  d="M60 55 Q35 60 30 90"
                  className="fill-none stroke-terra/30"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={
                    isActive
                      ? {
                          d: [
                            "M60 55 Q35 60 30 90",
                            "M60 55 Q30 55 25 95",
                            "M60 55 Q35 60 30 90",
                          ],
                        }
                      : undefined
                  }
                  transition={
                    isActive
                      ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                />
                <motion.path
                  d="M60 55 Q85 60 90 90"
                  className="fill-none stroke-terra/30"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={
                    isActive
                      ? {
                          d: [
                            "M60 55 Q85 60 90 90",
                            "M60 55 Q90 55 95 95",
                            "M60 55 Q85 60 90 90",
                          ],
                        }
                      : undefined
                  }
                  transition={
                    isActive
                      ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                />
              </>
            )}
          </motion.g>
        </svg>
      )}

      <button
        onClick={() => onPhaseChange?.("interromper")}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-error/40 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/5 focus:ring-gold focus:ring-offset-2"
      >
        <PauseCircle size={16} aria-hidden="true" /> Interromper
      </button>

      <button
        onClick={() => {
          setPosture(null);
          onPhaseChange?.("encerrar");
        }}
        className="mt-2 text-sm text-muted underline-offset-4 hover:text-terra hover:underline"
      >
        Não sei / Encerrar
      </button>
    </div>
  );
}
