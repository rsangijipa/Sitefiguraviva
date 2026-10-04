"use client";

import React, { useState, useEffect } from "react";
import {
  ActiveTab,
  ContactStage,
  ScenarioItem,
  ContactCycleConfig,
} from "./types";
import {
  getContactCycleConfig,
  saveContactCycleConfig,
  getContactStages,
  updateContactStage,
  getScenarios,
  getSavedStages,
  toggleSaveStage,
  getReflections,
  saveReflection,
  recordSession,
} from "./services/api";
import {
  DEFAULT_STAGES,
  DEFAULT_SCENARIOS,
  DEFAULT_CONFIG,
} from "./data/defaultData";
import { OpeningScreen } from "./components/OpeningScreen";
import { GuidedMode } from "./components/GuidedMode";
import { FreeMode } from "./components/FreeMode";
import { PracticeMode } from "./components/PracticeMode";
import { ReviewMode } from "./components/ReviewMode";
import { CompletionView } from "./components/CompletionView";
import { AdminView } from "./components/AdminView";
import { useAuth } from "@/context/AuthContext";
import { useResourceWindowScrollReset } from "../../ResourceWindow";

interface AppProps {
  activeSection: ActiveTab;
  onSectionChange: (tab: ActiveTab) => void;
}

export default function App({
  activeSection: activeTab,
  onSectionChange: setActiveTab,
}: AppProps) {
  const { isAdmin, loading: isAuthLoading } = useAuth();
  const canAdmin = isAdmin && !isAuthLoading;
  const resetWindowScroll = useResourceWindowScrollReset();

  const [config, setConfig] = useState<ContactCycleConfig>(DEFAULT_CONFIG);
  const [stages, setStages] = useState<ContactStage[]>(DEFAULT_STAGES);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(DEFAULT_SCENARIOS);
  const [guidedIndex, setGuidedIndex] = useState<number>(0);
  const [selectedStageSlug, setSelectedStageSlug] =
    useState<string>("sensacao");
  const [savedStages, setSavedStages] = useState<string[]>([]);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionStartTime] = useState<number>(Date.now());
  const [visitedStages, setVisitedStages] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const [
          loadedConfig,
          loadedStages,
          loadedScenarios,
          loadedSaved,
          loadedRefs,
        ] = await Promise.all([
          getContactCycleConfig(),
          getContactStages(),
          getScenarios(),
          getSavedStages(),
          getReflections(),
        ]);
        setConfig(loadedConfig);
        if (loadedStages.length > 0) setStages(loadedStages);
        if (loadedScenarios.length > 0) setScenarios(loadedScenarios);
        setSavedStages(loadedSaved);
        setReflections(loadedRefs);
      } catch (err) {
        console.error("Error initializing Ciclo do Contato:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Telemetry / Session recording on unmount or tab switch
  useEffect(() => {
    return () => {
      const durationSeconds = Math.round(
        (Date.now() - sessionStartTime) / 1000,
      );
      recordSession({
        startedAt: new Date(sessionStartTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds,
        mode: activeTab,
        visitedStages,
        savedStages,
        reflections,
      }).catch(() => {});
    };
  }, [activeTab, visitedStages, savedStages, reflections, sessionStartTime]);

  const handleToggleSave = async (slug: string) => {
    const updated = await toggleSaveStage(slug);
    setSavedStages(updated);
  };

  const handleSaveReflection = async (key: string, val: string) => {
    await saveReflection(key, val);
    setReflections((prev) => ({ ...prev, [key]: val }));
  };

  const handleSelectStageFree = (slug: string) => {
    setSelectedStageSlug(slug);
    if (!visitedStages.includes(slug)) {
      setVisitedStages((prev) => [...prev, slug]);
    }
    resetWindowScroll();
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh] bg-[#FDFAF4] text-[#262B22]"
        role="status"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-[#96551F] border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span className="text-xs uppercase tracking-widest text-[#4B4B49]">
            Carregando Ciclo do Contato...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-[#FDFAF4] text-[#262B22]">
      <main className="flex-1 w-full">
        {activeTab === "opening" && (
          <OpeningScreen
            config={config}
            onStartGuided={() => {
              setActiveTab("guided");
              setGuidedIndex(0);
              resetWindowScroll();
            }}
            onStartFree={() => {
              setActiveTab("free");
              resetWindowScroll();
            }}
            onStartPractice={() => {
              setActiveTab("practice");
              resetWindowScroll();
            }}
          />
        )}

        {activeTab === "guided" && (
          <GuidedMode
            stages={stages}
            currentIndex={guidedIndex}
            setCurrentIndex={(idx) => {
              setGuidedIndex(idx);
              const st = stages[idx];
              if (st && !visitedStages.includes(st.slug)) {
                setVisitedStages((prev) => [...prev, st.slug]);
              }
              resetWindowScroll();
            }}
            savedStages={savedStages}
            onToggleSave={handleToggleSave}
            onFinish={() => {
              setActiveTab("completion");
              resetWindowScroll();
            }}
            onSwitchToFree={() => {
              setActiveTab("free");
              resetWindowScroll();
            }}
            reflections={reflections}
            onSaveReflection={handleSaveReflection}
          />
        )}

        {activeTab === "free" && (
          <FreeMode
            stages={stages}
            selectedStageSlug={selectedStageSlug}
            onSelectStage={handleSelectStageFree}
            savedStages={savedStages}
            onToggleSave={handleToggleSave}
            reflections={reflections}
            onSaveReflection={handleSaveReflection}
          />
        )}

        {activeTab === "practice" && (
          <PracticeMode scenarios={scenarios} stages={stages} />
        )}

        {activeTab === "review" && (
          <ReviewMode
            stages={stages}
            savedStages={savedStages}
            onToggleSave={handleToggleSave}
            onSelectStage={(slug) => {
              setSelectedStageSlug(slug);
              setActiveTab("free");
              resetWindowScroll();
            }}
          />
        )}

        {activeTab === "completion" && (
          <CompletionView
            config={config}
            onRestart={() => {
              setActiveTab("guided");
              setGuidedIndex(0);
              resetWindowScroll();
            }}
            onGoToPractice={() => {
              setActiveTab("practice");
              resetWindowScroll();
            }}
          />
        )}

        {activeTab === "admin" && canAdmin && (
          <AdminView
            config={config}
            onUpdateConfig={async (cfg) => {
              const saved = await saveContactCycleConfig(cfg);
              setConfig(saved);
            }}
            stages={stages}
            onUpdateStage={async (id, updates) => {
              const updated = await updateContactStage(id, updates);
              setStages(updated);
            }}
            scenarios={scenarios}
            onUpdateScenarios={(sc) => setScenarios(sc)}
            onPreviewAsStudent={() => {
              setActiveTab("opening");
              resetWindowScroll();
            }}
          />
        )}
      </main>
    </div>
  );
}
