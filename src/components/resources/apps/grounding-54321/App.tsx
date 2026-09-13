import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { StageView } from "./components/StageView";
import { CompletionView } from "./components/CompletionView";
import { SettingsModal } from "./components/SettingsModal";
import { STAGES } from "./data/stages";
import { AppSettings } from "./types";
import { soundEngine } from "./utils/audio";

export default function App() {
  // Application settings with defaults matching user intent:
  // "Adicionar: 'Fazer sem registrar' como modo padrão"
  // "Permitir: com áudio, sem áudio, ritmo livre, avanço manual"
  const [settings, setSettings] = useState<AppSettings>(() => {
    let initialReducedMotion = false;
    if (typeof window !== "undefined" && window.matchMedia) {
      initialReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
    return {
      audioEnabled: false,
      voiceNarration: false,
      chimeSound: true,
      freeRhythm: true,
      manualAdvance: true,
      doWithoutRegistering: true,
      reducedMotion: initialReducedMotion,
    };
  });

  // Current stage index: 0 (stage 5) -> 4 (stage 1)
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Per-stage sensory marks: array of booleans for each stage
  const [marksPerStage, setMarksPerStage] = useState<Record<number, boolean[]>>(
    () => {
      const initial: Record<number, boolean[]> = {};
      STAGES.forEach((stage) => {
        initial[stage.number] = Array(stage.number).fill(false);
      });
      return initial;
    },
  );

  // Session time is kept in memory only and discarded when the resource closes.
  const sessionStartTimeRef = useRef<number>(Date.now());
  const [sessionDuration, setSessionDuration] = useState<number>(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Speech narration state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => ({ ...prev, reducedMotion: e.matches }));
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Narration helper for current stage
  const narrateStage = useCallback(
    (stageIndex: number, force = false) => {
      if (!force && (!settings.audioEnabled || !settings.voiceNarration)) {
        soundEngine.stopSpeaking();
        setIsSpeaking(false);
        setIsSpeechPaused(false);
        return;
      }

      const currentStage = STAGES[stageIndex];
      if (!currentStage) return;

      soundEngine.speak(
        currentStage.audioNarration,
        () => {
          setIsSpeaking(true);
          setIsSpeechPaused(false);
        },
        () => {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
        },
        () => {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
        },
      );
    },
    [settings.audioEnabled, settings.voiceNarration],
  );

  useEffect(() => {
    soundEngine.stopSpeaking();
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    return () => {
      soundEngine.stopSpeaking();
    };
  }, [currentStageIndex, isCompleted]);

  // Master audio toggle
  const handleToggleAudio = () => {
    setSettings((prev) => {
      const nextAudioEnabled = !prev.audioEnabled;
      if (!nextAudioEnabled) {
        soundEngine.stopSpeaking();
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      } else if (prev.voiceNarration && !isCompleted) {
        // Will be picked up or user can click play
      }
      return { ...prev, audioEnabled: nextAudioEnabled };
    });
  };

  // Play / Pause narration button
  const handleTogglePlayPauseNarration = () => {
    if (!settings.audioEnabled) {
      setSettings((prev) => ({
        ...prev,
        audioEnabled: true,
        voiceNarration: true,
      }));
      window.setTimeout(() => narrateStage(currentStageIndex, true), 0);
      return;
    }

    if (isSpeaking && !isSpeechPaused) {
      soundEngine.pauseSpeaking();
      setIsSpeechPaused(true);
    } else if (isSpeaking && isSpeechPaused) {
      soundEngine.resumeSpeaking();
      setIsSpeechPaused(false);
    } else {
      narrateStage(currentStageIndex);
    }
  };

  // Toggle sensory mark
  const handleToggleMark = (markIndex: number) => {
    const currentStage = STAGES[currentStageIndex];
    const currentMarks =
      marksPerStage[currentStage.number] ||
      Array(currentStage.number).fill(false);
    const nextMarks = [...currentMarks];
    nextMarks[markIndex] = !nextMarks[markIndex];

    setMarksPerStage((prev) => ({
      ...prev,
      [currentStage.number]: nextMarks,
    }));

    // If marked as true and chime sound enabled, play soft harmonious chime
    if (nextMarks[markIndex] && settings.audioEnabled && settings.chimeSound) {
      // Harmonic pitch variation: ascends slightly as marks complete
      const pitchModifier = 0.95 + markIndex * 0.08;
      soundEngine.playChime(pitchModifier);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    soundEngine.stopSpeaking();
    setIsSpeaking(false);
    setIsSpeechPaused(false);

    if (currentStageIndex < STAGES.length - 1) {
      setCurrentStageIndex((prev) => prev + 1);
    } else {
      // Completed the 5 stages!
      const elapsed = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
      );
      setSessionDuration(elapsed);
      setIsCompleted(true);

      // Play completion chime
      if (settings.audioEnabled && settings.chimeSound) {
        soundEngine.playChime(1.2);
        setTimeout(() => soundEngine.playChime(1.5), 250);
      }
    }
  };

  const handlePrev = () => {
    soundEngine.stopSpeaking();
    setIsSpeaking(false);
    setIsSpeechPaused(false);

    if (currentStageIndex > 0) {
      setCurrentStageIndex((prev) => prev - 1);
    }
  };

  // Restart session
  const handleRestart = () => {
    soundEngine.stopSpeaking();
    setIsSpeaking(false);
    setIsSpeechPaused(false);

    // Reset marks
    const resetMarks: Record<number, boolean[]> = {};
    STAGES.forEach((stage) => {
      resetMarks[stage.number] = Array(stage.number).fill(false);
    });
    setMarksPerStage(resetMarks);

    sessionStartTimeRef.current = Date.now();

    setCurrentStageIndex(0);
    setIsCompleted(false);
  };

  const currentStage = STAGES[currentStageIndex];
  const currentMarks =
    marksPerStage[currentStage.number] ||
    Array(currentStage.number).fill(false);

  return (
    <div className="min-h-full bg-[#F7F6F2] flex flex-col justify-between text-[#1E2328] selection:bg-[#E2DED4]">
      {/* Header with audio controls, mode indicator & settings */}
      <Header
        settings={settings}
        isSpeaking={isSpeaking}
        isPaused={isSpeechPaused}
        onToggleAudio={handleToggleAudio}
        onTogglePlayPauseNarration={handleTogglePlayPauseNarration}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Primary Interaction Body */}
      {!isCompleted ? (
        <StageView
          stage={currentStage}
          currentIndex={currentStageIndex}
          totalStages={STAGES.length}
          checkedMarks={currentMarks}
          settings={settings}
          onToggleMark={handleToggleMark}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      ) : (
        <CompletionView
          durationSeconds={sessionDuration}
          settings={settings}
          onRestart={handleRestart}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(updated) =>
          setSettings((prev) => ({ ...prev, ...updated }))
        }
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
