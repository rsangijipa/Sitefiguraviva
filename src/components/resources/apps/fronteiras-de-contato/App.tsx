import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveTab, Vignette, DiaryEntry } from "./types";
import {
  getVignettes,
  createVignette,
  updateVignette,
  deleteVignette,
  resetVignettes,
  getDiaryEntries,
  saveDiaryEntry,
  deleteDiaryEntry,
} from "./services/api";
import { DEFAULT_VIGNETTES } from "./data/defaultVignettes";
import { VignettePlayer } from "./components/VignettePlayer";
import { VignetteCatalog } from "./components/VignetteCatalog";
import { DiaryView } from "./components/DiaryView";
import { VignetteAdmin } from "./components/VignetteAdmin";
import { TheoryGuide } from "./components/TheoryGuide";
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
  const [vignettes, setVignettes] = useState<Vignette[]>(DEFAULT_VIGNETTES);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isNewVignetteModalOpen, setIsNewVignetteModalOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data from API
  useEffect(() => {
    async function initData() {
      try {
        const [loadedVignettes, loadedDiary] = await Promise.all([
          getVignettes(),
          getDiaryEntries(),
        ]);
        if (loadedVignettes.length > 0) {
          setVignettes(loadedVignettes);
        }
        setDiaryEntries(loadedDiary);
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    if (!canAdmin && activeTab === "admin") {
      setActiveTab("experiment");
      setIsNewVignetteModalOpen(false);
    }
  }, [activeTab, canAdmin]);

  const currentVignette =
    vignettes[currentIndex] || vignettes[0] || DEFAULT_VIGNETTES[0];

  // Navigation between vignettes
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vignettes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + vignettes.length) % vignettes.length);
  };

  const handleRandom = () => {
    if (vignettes.length <= 1) return;
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * vignettes.length);
    }
    setCurrentIndex(nextIdx);
  };

  const handleSelectVignetteById = (id: string) => {
    const idx = vignettes.findIndex((v) => v.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setActiveTab("experiment");
    resetWindowScroll();
  };

  // Diary actions
  const handleSaveDiary = async (
    entry: Omit<DiaryEntry, "id" | "createdAt">,
  ) => {
    const saved = await saveDiaryEntry(entry);
    setDiaryEntries((prev) => [
      saved,
      ...prev.filter((e) => e.id !== saved.id),
    ]);
  };

  const handleDeleteDiary = async (id: string) => {
    await deleteDiaryEntry(id);
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Admin actions
  const handleCreateVignette = async (vignette: Partial<Vignette>) => {
    if (!canAdmin) return;
    const created = await createVignette(vignette);
    setVignettes((prev) => [created, ...prev]);
    setCurrentIndex(0);
    setActiveTab("experiment");
  };

  const handleUpdateVignette = async (
    id: string,
    updates: Partial<Vignette>,
  ) => {
    if (!canAdmin) return;
    const updated = await updateVignette(id, updates);
    if (updated) {
      setVignettes((prev) => prev.map((v) => (v.id === id ? updated : v)));
    }
  };

  const handleDeleteVignette = async (id: string) => {
    if (!canAdmin) return;
    await deleteVignette(id);
    setVignettes((prev) => {
      const remaining = prev.filter((v) => v.id !== id);
      return remaining.length > 0 ? remaining : DEFAULT_VIGNETTES;
    });
    setCurrentIndex(0);
  };

  const handleResetToDefaults = async () => {
    if (!canAdmin) return;
    const restored = await resetVignettes();
    setVignettes(restored);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8F7F4] text-[#242220]">
      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
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
                Carregando laboratório de contato...
              </span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "experiment" && (
              <motion.div
                key="experiment-tab"
                role="tabpanel"
                id="fronteiras-panel-experiment"
                aria-labelledby="fronteiras-tab-experiment"
                tabIndex={-1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <VignettePlayer
                  vignette={currentVignette}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onRandom={handleRandom}
                  onSaveDiary={handleSaveDiary}
                  onOpenCatalog={() => setActiveTab("catalog")}
                  onOpenDiary={() => setActiveTab("diary")}
                />
              </motion.div>
            )}

            {activeTab === "catalog" && (
              <motion.div
                key="catalog-tab"
                role="tabpanel"
                id="fronteiras-panel-catalog"
                aria-labelledby="fronteiras-tab-catalog"
                tabIndex={-1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <VignetteCatalog
                  vignettes={vignettes}
                  onSelectVignette={handleSelectVignetteById}
                  onOpenNewVignetteModal={() => {
                    if (!canAdmin) return;
                    setActiveTab("admin");
                    setIsNewVignetteModalOpen(true);
                  }}
                  showAdmin={canAdmin}
                />
              </motion.div>
            )}

            {activeTab === "diary" && (
              <motion.div
                key="diary-tab"
                role="tabpanel"
                id="fronteiras-panel-diary"
                aria-labelledby="fronteiras-tab-diary"
                tabIndex={-1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DiaryView
                  entries={diaryEntries}
                  onDeleteEntry={handleDeleteDiary}
                  onSelectVignette={handleSelectVignetteById}
                  onGoToExperiment={() => setActiveTab("experiment")}
                />
              </motion.div>
            )}

            {activeTab === "theory" && (
              <motion.div
                key="theory-tab"
                role="tabpanel"
                id="fronteiras-panel-theory"
                aria-labelledby="fronteiras-tab-theory"
                tabIndex={-1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <TheoryGuide />
              </motion.div>
            )}

            {activeTab === "admin" && canAdmin && (
              <motion.div
                key="admin-tab"
                role="tabpanel"
                id="fronteiras-panel-admin"
                aria-labelledby="fronteiras-tab-admin"
                tabIndex={-1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <VignetteAdmin
                  vignettes={vignettes}
                  onSaveVignette={handleCreateVignette}
                  onUpdateVignette={handleUpdateVignette}
                  onDeleteVignette={handleDeleteVignette}
                  onResetToDefaults={handleResetToDefaults}
                  isOpenNewModal={isNewVignetteModalOpen}
                  onCloseNewModal={() => setIsNewVignetteModalOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#E3DDD1] bg-[#FAF8F5] py-5 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7163]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-[#40382E]">
              Fronteiras de Contato
            </span>
            <span>•</span>
            <span>Aprender & Experimentar</span>
            <span>•</span>
            <span>Instituto de Estudos Relacionais</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#8C8375]">
            <span>Escolhas livres de registro obrigatório</span>
            <span>•</span>
            <span>Diário armazenado neste dispositivo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
