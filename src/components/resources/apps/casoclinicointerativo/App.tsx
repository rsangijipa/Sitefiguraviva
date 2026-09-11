"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CASES_DATA } from "./data/casesData";
import {
  ClinicalCase,
  ExperienceStage,
  UserAnalysis,
  AggregatedStats,
  CaseTheme,
} from "./types";
import { CaseCard } from "./components/CaseCard";
import { ControlsHeader } from "./components/ControlsHeader";
import { StudyModal } from "./components/StudyModal";
import { ConclusionView } from "./components/ConclusionView";
import { CaseNavigator } from "./components/CaseNavigator";
import { useResourceWindowScrollReset } from "../../ResourceWindow";
import "./index.css";

const STORAGE_KEY_STATS = "caso_clinico_stats_v1";
const STORAGE_KEY_ANALYSES = "caso_clinico_analyses_v1";
const STORAGE_KEY_COMPLETED = "caso_clinico_completed_v1";

export default function App() {
  const resetWindowScroll = useResourceWindowScrollReset();
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);
  const [stage, setStage] = useState<ExperienceStage>("reading");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [reflectionNotes, setReflectionNotes] = useState<string>("");
  const [isStudyOpen, setIsStudyOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Persisted state
  const [completedCases, setCompletedCases] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [analyses, setAnalyses] = useState<UserAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANALYSES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [stats, setStats] = useState<AggregatedStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      totalCasesCompleted: 0,
      totalTimeSpentSeconds: 0,
      themesExplored: [],
    };
  });

  // Timing
  const caseStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());

  const currentCase = CASES_DATA[currentCaseIndex];
  const isCurrentCaseCompleted = completedCases.includes(currentCaseIndex);

  // Load initial data
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Reset case-specific state when case changes
  useEffect(() => {
    setStage("reading");
    setSelectedFocusAreas([]);
    setReflectionNotes("");
    caseStartTimeRef.current = Date.now();
    resetWindowScroll();
  }, [currentCaseIndex, resetWindowScroll]);

  // Persist completed cases
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_COMPLETED,
        JSON.stringify(completedCases),
      );
    } catch {}
  }, [completedCases]);

  // Persist analyses
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(analyses));
    } catch {}
  }, [analyses]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Navigation
  const handleNextCase = useCallback(() => {
    if (currentCaseIndex < CASES_DATA.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    }
  }, [currentCaseIndex]);

  const handlePrevCase = useCallback(() => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex((prev) => prev - 1);
    }
  }, [currentCaseIndex]);

  const handleSelectCase = useCallback((index: number) => {
    setCurrentCaseIndex(index);
  }, []);

  // Stage transitions
  const handleStartReflection = useCallback(() => {
    setStage("reflecting");
  }, []);

  const handleSelectFocusArea = useCallback((area: string) => {
    setSelectedFocusAreas((prev) => {
      if (prev.includes(area)) {
        return prev.filter((a) => a !== area);
      }
      if (prev.length >= 4) return prev;
      return [...prev, area];
    });
  }, []);

  const handleReflectionChange = useCallback((notes: string) => {
    setReflectionNotes(notes);
  }, []);

  const handleProceedToAnalyzing = useCallback(() => {
    if (selectedFocusAreas.length >= 2) {
      setStage("analyzing");
    }
  }, [selectedFocusAreas.length]);

  const handleProceedToConclusion = useCallback(() => {
    // Save analysis
    const timeSpent = Math.max(
      1,
      Math.round((Date.now() - caseStartTimeRef.current) / 1000),
    );
    const newAnalysis: UserAnalysis = {
      caseId: currentCase.id,
      caseTitle: currentCase.title,
      theme: currentCase.theme,
      selectedFocusAreas,
      reflectionNotes,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
    };

    setAnalyses((prev) => {
      const filtered = prev.filter((a) => a.caseId !== currentCase.id);
      return [...filtered, newAnalysis];
    });

    // Mark as completed if not already
    if (!completedCases.includes(currentCaseIndex)) {
      const newCompleted = [...completedCases, currentCaseIndex];
      setCompletedCases(newCompleted);

      // Update stats
      const sessionSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
      );
      const newThemes = [
        ...new Set([...stats.themesExplored, currentCase.theme]),
      ];
      const newStats: AggregatedStats = {
        totalCasesCompleted: stats.totalCasesCompleted + 1,
        totalTimeSpentSeconds: stats.totalTimeSpentSeconds + timeSpent,
        themesExplored: newThemes,
        lastCompletedAt: new Date().toISOString(),
      };
      setStats(newStats);
    }

    setStage("conclusion");
  }, [
    currentCase,
    currentCaseIndex,
    selectedFocusAreas,
    reflectionNotes,
    completedCases,
    stats,
  ]);

  const handleRestart = useCallback(() => {
    setCurrentCaseIndex(0);
    setStage("reading");
    setSelectedFocusAreas([]);
    setReflectionNotes("");
    setCompletedCases([]);
    setAnalyses([]);
    setStats({
      totalCasesCompleted: 0,
      totalTimeSpentSeconds: 0,
      themesExplored: [],
    });
    sessionStartTimeRef.current = Date.now();
    caseStartTimeRef.current = Date.now();
  }, []);

  if (isLoading) {
    return (
      <div className="casoclinicointerativo-app min-h-full flex flex-col bg-[#F8F7F4] text-[#242220]">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div
            className="flex items-center justify-center min-h-[50vh]"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-[#8F7B67] border-t-transparent animate-spin"
                aria-hidden="true"
              />
              <span className="text-xs text-[#7A7061]">
                Carregando Caso Clínico Interativo...
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="casoclinicointerativo-app min-h-full flex flex-col bg-[#F8F7F4] text-[#242220]">
      {/* Sticky Header with Context Badge and Controls */}
      <ControlsHeader
        currentCase={currentCase}
        currentCaseIndex={currentCaseIndex}
        totalCases={CASES_DATA.length}
        stage={stage}
        onOpenStudy={() => setIsStudyOpen(true)}
        onRestart={handleRestart}
        onNextCase={handleNextCase}
        completedCases={completedCases}
        stats={stats}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* Case Card - Main Content */}
          <motion.div
            key={`case-${currentCaseIndex}-${stage}`}
            role="main"
            aria-label={`Caso ${currentCaseIndex + 1}: ${currentCase.title}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <CaseCard
              caseData={currentCase}
              stage={stage}
              selectedFocusAreas={selectedFocusAreas}
              reflectionNotes={reflectionNotes}
              onSelectFocusArea={handleSelectFocusArea}
              onReflectionChange={handleReflectionChange}
              onProceedToAnalyzing={handleProceedToAnalyzing}
              onProceedToConclusion={handleProceedToConclusion}
              isCompleted={isCurrentCaseCompleted}
              analysis={(() => {
                const found = analyses.find((a) => a.caseId === currentCase.id);
                return found
                  ? {
                      focusAreas: found.selectedFocusAreas,
                      notes: found.reflectionNotes,
                    }
                  : null;
              })()}
            />
          </motion.div>
        </AnimatePresence>

        {/* Case Navigator */}
        <CaseNavigator
          cases={CASES_DATA}
          currentIndex={currentCaseIndex}
          completedCases={completedCases}
          analyses={analyses}
          onSelectCase={handleSelectCase}
          onNext={handleNextCase}
          onPrev={handlePrevCase}
          disabled={stage !== "reading" && stage !== "conclusion"}
        />
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#E3DDD1] bg-[#FAF8F5] py-5 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7163]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-[#40382E]">
              Caso Clínico Interativo
            </span>
            <span>•</span>
            <span>Formação Clínica Baseada em Evidência</span>
            <span>•</span>
            <span>Instituto Figura Viva</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#8C8375]">
            <span>Casos fictícios para fins educacionais</span>
            <span>•</span>
            <span>Dados salvos localmente neste dispositivo</span>
          </div>
        </div>
      </footer>

      {/* Study Modal */}
      <StudyModal
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        currentCase={currentCase}
      />
    </div>
  );
}
