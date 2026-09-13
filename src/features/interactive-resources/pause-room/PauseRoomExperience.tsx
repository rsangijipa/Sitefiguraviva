"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Ear, Eye, Move, Hourglass, Save } from "lucide-react";
import { HubView } from "./components/HubView";
import { PauseStage } from "./components/PauseStage";
import { PauseControls } from "./components/PauseControls";
import { PauseCompletion } from "./components/PauseCompletion";
import { TimerDisplay } from "./components/TimerDisplay";
import type {
  PausePracticeConfig,
  PauseStatus as PauseStatusType,
  PracticeId,
  PauseSessionRecord,
} from "./types";
import { saveSession } from "./repository";
import { BreathingPractice } from "./practices/BreathingPractice";
import { ObservingPractice } from "./practices/ObservingPractice";
import { ListeningPractice } from "./practices/ListeningPractice";
import { MovementPractice } from "./practices/MovementPractice";
import { SlowingPractice } from "./practices/SlowingPractice";

/* ── static practice configs ─────────────────────────────────── */
const PRACTICES: PausePracticeConfig[] = [
  {
    id: "breathing",
    title: "Acompanhar a respira\u00e7\u00e3o",
    description: "Perceba o ar entrando e saindo.",
    iconComponent: Wind,
    durations: [1, 2, 3],
    defaultDuration: 120,
    capabilities: { audio: false, motion: true, static: true },
  },
  {
    id: "observing",
    title: "Observar com os olhos",
    description: "Uma cor, uma forma, uma textura.",
    iconComponent: Eye,
    durations: [1, 2, 3],
    defaultDuration: 180,
    capabilities: { audio: false, motion: false, static: true },
  },
  {
    id: "listening",
    title: "Escutar o entorno",
    description: "Um som perto, um som longe.",
    iconComponent: Ear,
    durations: [1, 2, 5],
    defaultDuration: 180,
    capabilities: { audio: false, motion: false, static: true },
  },
  {
    id: "movement",
    title: "Pequeno movimento",
    description: "M\u00e3os, ombros ou imobilidade.",
    iconComponent: Move,
    durations: [1, 2, 3],
    defaultDuration: 120,
    capabilities: { audio: false, motion: true, static: true },
  },
  {
    id: "slowing",
    title: "Desacelerar",
    description: "Deixe uma tarefa de lado por um instante.",
    iconComponent: Hourglass,
    durations: [1, 2, 3],
    defaultDuration: 120,
    capabilities: { audio: false, motion: false, static: true },
  },
];

/* ── inline hook helpers ─────────────────────────────────────── */
function useReducedMotion(): boolean {
  const [val] = useState(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });
  return val;
}

/* ── inline practice renderer (avoids require()) ─────────────── */
interface PracticeRendererProps {
  practiceId: PracticeId;
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

function PracticeRenderer({
  practiceId,
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeRendererProps) {
  const p = { isActive, reducedMotion, onPhaseChange };
  switch (practiceId) {
    case "breathing":
      return <BreathingPractice {...p} />;
    case "observing":
      return <ObservingPractice {...p} />;
    case "listening":
      return <ListeningPractice {...p} />;
    case "movement":
      return <MovementPractice {...p} />;
    case "slowing":
      return <SlowingPractice {...p} />;
    default:
      return (
        <p className="py-8 text-center text-muted">
          Pr\u00e1tica n\u00e3o encontrada.
        </p>
      );
  }
}

/* ── main component ──────────────────────────────────────────── */
export default function PauseRoomExperience() {
  /* state */
  const [status, setStatus] = useState<PauseStatusType>("idle");
  const [selectedPractice, setSelectedPractice] = useState<PracticeId | null>(
    null,
  );
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hideTimer, setHideTimer] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [history, setHistory] = useState<PauseSessionRecord[]>([]);

  const startTimeRef = useRef(performance.now());
  const prevStatus = useRef<PauseStatusType>("idle");
  const playerRef = useRef<{ stop: () => void } | null>(null);
  const reducedMotion = useReducedMotion();

  const currentPractice = PRACTICES.find((p) => p.id === selectedPractice);

  /* status transition tracker */
  useEffect(() => {
    if (prevStatus.current !== "active" && status === "active") {
      startTimeRef.current = performance.now();
      setElapsedMs(0);
    }
    prevStatus.current = status;
  }, [status]);

  /* timer interval — monotonic via performance.now() */
  useEffect(() => {
    if (status !== "active" || isPaused) return;
    const tick = () => {
      const delta = performance.now() - startTimeRef.current;
      setElapsedMs(Math.round(delta));
      if (delta >= selectedDuration * 60 * 1000) {
        setStatus("completion");
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, isPaused, selectedDuration]);

  /* load history + drafts on mount */
  useEffect(() => {
    /* History is loaded lazily; skip for now (unauthenticated default). */
    try {
      const draft = localStorage.getItem("fv_pause_room_draft");
      if (draft) setReflection(draft);
    } catch {
      /* ignore */
    }
  }, []);

  /* persist draft while typing reflection */
  useEffect(() => {
    try {
      localStorage.setItem("fv_pause_room_draft", reflection);
    } catch {
      /* ignore */
    }
  }, [reflection]);

  /* cleanup on unmount / leaving active */
  useEffect(() => {
    if (prevStatus.current === "active" && status !== "active") {
      setElapsedMs(0);
      playerRef.current?.stop();
    }
    return () => playerRef.current?.stop();
  }, [status]);

  /* ── handlers ──────────────────────────────────────────────── */
  const handleSelectPractice = (id: PracticeId) => {
    setSelectedPractice(id);
  };

  const handleStart = (practiceId: PracticeId, durationMinutes: number) => {
    setSelectedPractice(practiceId);
    setSelectedDuration(durationMinutes);
    setStatus("preparing");
    setTimeout(() => {
      setHideTimer(false);
      setStatus("active");
    }, 600);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      startTimeRef.current = performance.now() - elapsedMs;
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const handleConfirmSwitch = () => {
    playerRef.current?.stop();
    setElapsedMs(0);
    setShowSwitchDialog(false);
    setSelectedPractice(null);
    setStatus("choosing");
  };

  const handleActiveEnd = () => {
    setStatus("completion");
    setHideTimer(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await saveSession({
        id: crypto.randomUUID(),
        userId: "",
        practiceId: selectedPractice!,
        plannedDurationSeconds: selectedDuration * 60,
        activeDurationSeconds: Math.round(elapsedMs / 1000),
        endedBy: "user",
        reflection: reflection || null,
        contentVersion: "1",
        createdAt: new Date().toISOString(),
        clientRequestId: crypto.randomUUID(),
      });
      try {
        localStorage.removeItem("fv_pause_room_draft");
      } catch {
        /* ignore */
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturnToCatalog = () => {
    try {
      localStorage.removeItem("fv_pause_room_draft");
    } catch {
      /* ignore */
    }
    setStatus("idle");
  };

  /* ── computed values ───────────────────────────────────────── */
  const uiStatus: PauseStatusType = status === "idle" ? "choosing" : status;
  const showActiveContent =
    !["completion"].includes(status) && ["active", "paused"].includes(status);
  const activeDurationSec = Math.round(elapsedMs / 1000);

  const endedBy: "timer" | "user" | "switch" =
    status === "completion"
      ? elapsedMs >= selectedDuration * 60 * 1000
        ? "timer"
        : "user"
      : "user";

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-full flex-col bg-paper">
      {/* Switch confirmation dialog (accessible) */}
      {showSwitchDialog && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="switch-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(241,233,219,0.94)] p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-paper p-6">
            <h2
              id="switch-dialog-title"
              className="font-serif text-2xl text-primary"
            >
              Trocar pr\u00e1tica?
            </h2>
            <p className="mt-2 text-text/80">
              Escolher outra pr\u00e1tica encerra esta pausa. Deseja continuar?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSwitchDialog(false)}
                className="resource-action resource-action--secondary flex-1 rounded-xl border border-border/80 px-4 py-3 text-sm font-semibold text-text transition hover:border-terra hover:bg-areia"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="resource-action flex-1 rounded-xl bg-error px-4 py-3 text-sm font-semibold text-paper transition hover:bg-error/90"
              >
                Trocar mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* hub view (covers idle → choosing) */}
        {uiStatus === "choosing" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HubView
              practices={PRACTICES}
              selectedDuration={selectedDuration}
              selectedPracticeId={selectedPractice ?? undefined}
              onDurationChange={setSelectedDuration}
              onSelectPractice={handleSelectPractice}
              onStart={handleStart}
              previousSessions={history}
            />
          </motion.div>
        )}

        {/* active / paused practice stage */}
        {showActiveContent && currentPractice && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex min-h-full flex-1 flex-col items-center overflow-y-auto px-4 py-6"
          >
            <PauseStage
              practice={currentPractice}
              contentComponent={
                <PracticeRenderer
                  practiceId={selectedPractice!}
                  isActive={status === "active"}
                  reducedMotion={reducedMotion}
                  onPhaseChange={(phase) => {
                    if (
                      [
                        "encerrar",
                        "interromper",
                        "finalizar",
                        "expirando",
                      ].includes(phase)
                    ) {
                      handleActiveEnd();
                    }
                  }}
                />
              }
              onSwitch={() => setShowSwitchDialog(true)}
            />
            <TimerDisplay
              isActive={!!(status === "active" || status === "paused")}
              paused={isPaused}
              totalSeconds={selectedDuration * 60}
              elapsedSeconds={Math.min(
                activeDurationSec,
                selectedDuration * 60,
              )}
              hideTimer={hideTimer}
            />
            <PauseControls
              isPaused={isPaused}
              active={status === "active"}
              onTogglePause={handleTogglePause}
              onSwitch={() => setShowSwitchDialog(true)}
              onEnd={handleActiveEnd}
            />
          </motion.div>
        )}

        {/* preparing (brief transition screen) */}
        {status === "preparing" && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-8 text-center"
          >
            <div className="rounded-full bg-primary/10 p-5">
              {currentPractice && (
                <currentPractice.iconComponent className="h-8 w-8 text-primary" />
              )}
            </div>
            <h2 className="mt-4 font-serif text-2xl text-primary sm:text-3xl">
              Preparando sua pr\u00e1tica...
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Ajuste o ritmo. Quando quiser, inicie.
            </p>
          </motion.div>
        )}

        {/* completion screen */}
        {status === "completion" && currentPractice && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-full flex-1 items-center justify-center px-4 py-8"
          >
            <PauseCompletion
              practice={currentPractice}
              duration={selectedDuration}
              activeDuration={activeDurationSec}
              endedBy={endedBy}
              reflection={reflection}
              onReflectionChange={(v) => setReflection(v.slice(0, 500))}
              onSave={handleSave}
              onReturn={handleReturnToCatalog}
              saving={saving}
              error={saveError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* single announcement for timer end */}
      {status === "completion" && (
        <div aria-live="assertive" className="sr-only">
          O tempo escolhido terminou.
        </div>
      )}
    </div>
  );
}
