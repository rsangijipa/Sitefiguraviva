import { useState, useEffect, useRef, useMemo } from "react";
import { ROUNDS_DATA } from "./data/roundsData";
import { ExperienceStage, UserSelection, AggregatedStats } from "./types";
import { ControlsHeader } from "./components/ControlsHeader";
import { VisualField } from "./components/VisualField";
import { StudyModal } from "./components/StudyModal";
import { ConclusionView } from "./components/ConclusionView";
import { PlaygroundControls } from "./components/PlaygroundControls";
import { ArrowRight, Sparkles, Volume2, VolumeX, Eye } from "lucide-react";

const STORAGE_KEY_STATS = "figura_fundo_stats_v1";

export default function App() {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [stage, setStage] = useState<ExperienceStage>("contemplating");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [userSelections, setUserSelections] = useState<UserSelection[]>([]);
  const [isStudyOpen, setIsStudyOpen] = useState<boolean>(false);
  const [isPlaygroundMode, setIsPlaygroundMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Playground tweakable parameters
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.22);
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [motionSpeed, setMotionSpeed] = useState<number>(1.0);
  const [contrastLevel, setContrastLevel] = useState<number>(1.0);

  // Aggregated stats
  const [stats, setStats] = useState<AggregatedStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      totalCompletions: 0,
      totalTimeSpentSeconds: 0,
    };
  });

  // Timing tracking for current round and total session
  const roundStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const contemplationTimerRef = useRef<number | null>(null);
  const [contemplationProgress, setContemplationProgress] = useState<number>(0);

  const currentRound = ROUNDS_DATA[currentRoundIndex];

  // Play subtle gentle harmonic chime using Web Audio API
  const playGentleTone = (freq = 440) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // When round or stage changes, handle contemplation progress
  useEffect(() => {
    if (stage === "contemplating") {
      setSelectedElementId(null);
      setContemplationProgress(0);
      roundStartTimeRef.current = Date.now();

      const startTime = Date.now();
      const duration = 4000; // 4 seconds of tranquil observation

      const interval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setContemplationProgress(progress);

        if (progress >= 100) {
          window.clearInterval(interval);
          setStage("selecting");
          playGentleTone(523.25); // C5 tone
        }
      }, 50);

      contemplationTimerRef.current = interval;

      return () => {
        window.clearInterval(interval);
      };
    }
  }, [stage, currentRoundIndex]);

  // Handle immediate skip of contemplation
  const handleProceedToSelecting = () => {
    if (contemplationTimerRef.current) {
      window.clearInterval(contemplationTimerRef.current);
    }
    setStage("selecting");
    playGentleTone(523.25);
  };

  // Handle user selecting an element
  const handleSelectElement = (elementId: string) => {
    setSelectedElementId(elementId);

    const chosen = currentRound.elements.find((e) => e.id === elementId);
    if (!chosen) return;

    playGentleTone(659.25); // E5 tone

    // Record time elapsed in this round
    const elapsedSecs = Math.max(
      1,
      Math.round((Date.now() - roundStartTimeRef.current) / 1000),
    );

    // Update user selections record
    setUserSelections((prev) => {
      const filtered = prev.filter((p) => p.roundId !== currentRound.id);
      return [
        ...filtered,
        {
          roundId: currentRound.id,
          roundTitle: currentRound.title,
          theme: currentRound.theme,
          selectedElementId: chosen.id,
          selectedElementName: chosen.name,
          secondsElapsed: elapsedSecs,
        },
      ];
    });

    setStage("revealed");
  };

  // Handle next round
  const handleNextRound = () => {
    if (currentRoundIndex < ROUNDS_DATA.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
      setStage("contemplating");
      setSelectedElementId(null);
      setHoveredElementId(null);
    } else {
      // Finish all rounds -> Conclusion
      const sessionSeconds = Math.max(
        10,
        Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
      );
      const newStats: AggregatedStats = {
        totalCompletions: (stats.totalCompletions || 0) + 1,
        totalTimeSpentSeconds:
          (stats.totalTimeSpentSeconds || 0) + sessionSeconds,
        lastCompletedAt: new Date().toISOString(),
      };
      setStats(newStats);
      try {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
      } catch {
        // ignore
      }
      setStage("conclusion");
      playGentleTone(440);
    }
  };

  // Restart experience
  const handleRestart = () => {
    setCurrentRoundIndex(0);
    setStage("contemplating");
    setSelectedElementId(null);
    setHoveredElementId(null);
    setUserSelections([]);
    sessionStartTimeRef.current = Date.now();
    roundStartTimeRef.current = Date.now();
    setIsPlaygroundMode(false);
  };

  const selectedElement = useMemo(() => {
    return currentRound.elements.find((e) => e.id === selectedElementId);
  }, [currentRound, selectedElementId]);

  return (
    <div className="min-h-full bg-[#F8F7F4] text-[#2C2A29] flex flex-col justify-between py-6 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="space-y-6">
        <ControlsHeader
          currentRound={currentRound}
          currentRoundIndex={currentRoundIndex}
          totalRounds={ROUNDS_DATA.length}
          stage={stage}
          onOpenStudy={() => setIsStudyOpen(true)}
          onTogglePlayground={() => setIsPlaygroundMode((v) => !v)}
          isPlaygroundMode={isPlaygroundMode}
        />

        {/* Sound toggle & subtle ambient bar */}
        <div className="flex items-center justify-between text-xs text-[#8A847A] pt-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B4F]" />
            <span className="font-serif italic text-xs text-[#6B655C]">
              {currentRound.subtitle}
            </span>
          </div>

          <button
            id="btn-sound-toggle"
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex items-center gap-1.5 hover:text-[#2C2A29] transition-colors py-1 px-2 rounded-lg hover:bg-[#EFECE5]"
            title={
              soundEnabled
                ? "Desativar sinal sonoro"
                : "Ativar sinal sonoro suave"
            }
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#555048]" />
                <span className="text-[11px]">Som ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#A59F94]" />
                <span className="text-[11px] text-[#969085]">Som discreto</span>
              </>
            )}
          </button>
        </div>

        {/* Main Experience Body */}
        {stage !== "conclusion" ? (
          <main className="space-y-6">
            {/* Prompts according to requirements */}
            <div className="text-center py-2 space-y-2 max-w-xl mx-auto">
              {stage === "contemplating" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE3] text-xs text-[#736E65] font-medium tracking-wide">
                    <Eye className="w-3.5 h-3.5 text-[#8C6B4F]" />
                    <span>MOMENTO DE CONTEMPLAÇÃO</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#1F1E1D] font-normal tracking-tight">
                    “Observe sem procurar nada.”
                  </h2>
                  <p className="text-xs sm:text-sm text-[#706B62] leading-relaxed">
                    Permita que o olhar percorra as formas, linhas e manchas de
                    aquarela com respiração calma e sem esforço deliberado.
                  </p>

                  {/* Gentle contemplation progress bar */}
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <div className="w-48 h-1 bg-[#E7E2D7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8C6B4F] transition-all duration-100 ease-out"
                        style={{ width: `${contemplationProgress}%` }}
                      />
                    </div>
                    <button
                      id="btn-ready-to-select"
                      onClick={handleProceedToSelecting}
                      className="text-xs text-[#7A7468] hover:text-[#1F1E1D] underline underline-offset-4 decoration-[#CCC4B5] transition-colors"
                    >
                      Estou pronto para responder
                    </button>
                  </div>
                </div>
              )}

              {stage === "selecting" && (
                <div className="space-y-2 animate-fade-in">
                  <span className="text-xs uppercase tracking-wider text-[#8A847A] font-semibold">
                    Percepção Imediata
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#1F1E1D] font-normal tracking-tight">
                    “O que apareceu primeiro para você?”
                  </h2>
                  <p className="text-xs sm:text-sm text-[#706B62]">
                    Selecione tocando diretamente sobre o elemento no campo
                    abaixo.
                  </p>
                </div>
              )}

              {stage === "revealed" && selectedElement && (
                <div className="space-y-2 animate-fade-in">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0EB] text-xs text-[#3C5740] font-medium tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-[#4A6B4F]" />
                    <span>EMERSÃO DE FIGURA</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif text-[#1F1E1D] font-normal">
                    <strong className="font-semibold">
                      {selectedElement.name}
                    </strong>{" "}
                    emergiu como Figura
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E685F] max-w-lg mx-auto leading-relaxed">
                    A proeminência dos outros elementos foi reduzida, mas eles
                    permanecem como fundo ativo. Você pode clicar em qualquer
                    outro elemento para alternar.
                  </p>
                </div>
              )}
            </div>

            {/* Visual SVG Field */}
            <VisualField
              elements={currentRound.elements}
              stage={stage}
              selectedElementId={selectedElementId}
              onSelectElement={handleSelectElement}
              hoveredElementId={hoveredElementId}
              setHoveredElementId={setHoveredElementId}
              customBackgroundOpacity={
                isPlaygroundMode ? backgroundOpacity : undefined
              }
            />

            {/* Clickable Elements Badges / Grid (Allows clicking either on SVG or in list) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#7A7468]">
                <span>
                  Elementos presentes no campo ({currentRound.elements.length}):
                </span>
                {stage === "revealed" && (
                  <span className="text-[11px] italic text-[#8A847A]">
                    Clique em outro elemento para mudar o foco
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {currentRound.elements.map((el) => {
                  const isSelected = selectedElementId === el.id;
                  const isHovered = hoveredElementId === el.id;
                  return (
                    <button
                      key={el.id}
                      id={`card-elem-${el.id}`}
                      onClick={() => {
                        if (stage === "selecting" || stage === "revealed") {
                          handleSelectElement(el.id);
                        }
                      }}
                      onMouseEnter={() => setHoveredElementId(el.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                      disabled={stage === "contemplating"}
                      className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between min-h-[78px] ${
                        isSelected
                          ? "bg-[#FFFFFF] border-[#1F1E1D] shadow-sm ring-1 ring-[#1F1E1D]"
                          : isHovered
                            ? "bg-[#F2EEE6] border-[#CEC6B7]"
                            : "bg-[#FBF9F5] border-[#E5E0D5] hover:bg-[#F3EFE7]"
                      } ${stage === "contemplating" ? "opacity-60 cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-[10px] uppercase tracking-wider text-[#8A847A]">
                          {el.category}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-semibold bg-[#2C2A29] text-[#FFFFFF] px-1.5 py-0.5 rounded">
                            FIGURA
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-[#22201E] line-clamp-2 mt-1">
                        {el.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls / Next Round Action */}
            {stage === "revealed" && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E4DA] animate-fade-in">
                <div className="text-xs text-[#6E685F] max-w-md">
                  <p>
                    <strong className="text-[#1F1E1D]">
                      {currentRound.parameterName}:
                    </strong>{" "}
                    {currentRound.phenomenonNote}
                  </p>
                </div>

                <button
                  id="btn-next-round"
                  onClick={handleNextRound}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-[#F8F7F4] text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0"
                >
                  <span>
                    {currentRoundIndex < ROUNDS_DATA.length - 1
                      ? `Próxima Rodada (${currentRoundIndex + 2}/${ROUNDS_DATA.length})`
                      : "Concluir Experiência"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Optional Parameters Playground */}
            {isPlaygroundMode && (
              <PlaygroundControls
                backgroundOpacity={backgroundOpacity}
                setBackgroundOpacity={setBackgroundOpacity}
                scaleFactor={scaleFactor}
                setScaleFactor={setScaleFactor}
                motionSpeed={motionSpeed}
                setMotionSpeed={setMotionSpeed}
                contrastLevel={contrastLevel}
                setContrastLevel={setContrastLevel}
                onReset={() => {
                  setBackgroundOpacity(0.22);
                  setScaleFactor(1.0);
                  setMotionSpeed(1.0);
                  setContrastLevel(1.0);
                }}
              />
            )}
          </main>
        ) : (
          /* Conclusion Screen */
          <ConclusionView
            selections={userSelections}
            stats={stats}
            onRestart={handleRestart}
            onEnterPlayground={() => {
              setStage("revealed");
              setIsPlaygroundMode(true);
            }}
          />
        )}
      </div>

      {/* Footer Reflection & Credits */}
      <footer className="mt-12 pt-4 border-t border-[#E8E4DA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#948E84]">
        <span>Fenomenologia da Percepção • Gestalt & Edgar Rubin</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsStudyOpen(true)}
            className="hover:text-[#2C2A29] transition-colors underline underline-offset-2"
          >
            Entender o conceito teórico
          </button>
          <span>•</span>
          <span>Exercício perceptivo contemplativo</span>
        </div>
      </footer>

      {/* Study Modal */}
      <StudyModal isOpen={isStudyOpen} onClose={() => setIsStudyOpen(false)} />
    </div>
  );
}
