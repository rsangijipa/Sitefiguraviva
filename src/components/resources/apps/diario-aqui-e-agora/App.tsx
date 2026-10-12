/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Shield,
  Archive,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { QUESTIONS } from "./data/questions";
import { QuestionKey, PerceptionPayload, SavedPerception } from "./types";
import { OrganicBranch } from "./components/OrganicBranch";
import { QuestionCard } from "./components/QuestionCard";
import { CompletionView } from "./components/CompletionView";
import { WatercolorBackground } from "./components/WatercolorBackground";
import { SavedPerceptionsModal } from "./components/SavedPerceptionsModal";
import { playGentleBell } from "./utils/audio";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const STORAGE_KEY = "aqui_e_agora_perceptions_v1";
const AUDIO_PREF_KEY = "aqui_e_agora_audio_pref";

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [writtenAnswers, setWrittenAnswers] = useState<
    Record<QuestionKey, string>
  >({
    attention: "",
    body: "",
    feeling: "",
    need: "",
    reflection: "",
  });
  const [chosenTags, setChosenTags] = useState<Record<QuestionKey, string[]>>({
    attention: [],
    body: [],
    feeling: [],
    need: [],
    reflection: [],
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUDIO_PREF_KEY);
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [watercolorMode, setWatercolorMode] = useState<
    "subtle" | "soft" | "minimal"
  >("subtle");
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [savedPerceptions, setSavedPerceptions] = useState<SavedPerception[]>(
    [],
  );
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const privacyDialogRef = useFocusTrap<HTMLDivElement>(isPrivacyNoticeOpen);

  // Load saved perceptions safely from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setSavedPerceptions(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem(AUDIO_PREF_KEY, String(next));
    } catch {
      // safe
    }
    if (next) {
      playGentleBell(true);
    }
  };

  const currentQuestion = QUESTIONS[currentStepIndex];
  const isFinished = currentStepIndex >= QUESTIONS.length;

  // Build the clean JSON payload combining text and tags for each key
  const buildPayload = (): PerceptionPayload => {
    const keys: QuestionKey[] = [
      "attention",
      "body",
      "feeling",
      "need",
      "reflection",
    ];
    const payload: Partial<PerceptionPayload> = {};

    keys.forEach((k) => {
      const text = writtenAnswers[k].trim();
      const tags = chosenTags[k] || [];
      if (text && tags.length > 0) {
        // combine harmoniously
        const tagsPart = tags.join(", ");
        payload[k] = text.includes(tagsPart) ? text : `${tagsPart} — ${text}`;
      } else if (text) {
        payload[k] = text;
      } else if (tags.length > 0) {
        payload[k] = tags.join(", ");
      } else {
        payload[k] = "";
      }
    });

    return payload as PerceptionPayload;
  };

  const handleNextStep = () => {
    if (soundEnabled) {
      playGentleBell(true);
    }
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleSkipStep = () => {
    if (soundEnabled) {
      playGentleBell(true);
    }
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSelectStep = (targetIdx: number) => {
    if (targetIdx <= currentStepIndex || isFinished) {
      setCurrentStepIndex(targetIdx);
      if (isFinished) {
        setIsCurrentSaved(false);
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    if (!currentQuestion) return;
    const key = currentQuestion.id;
    setChosenTags((prev) => {
      const currentList = prev[key] || [];
      const isAlready = currentList.includes(tag);
      const nextList = isAlready
        ? currentList.filter((t) => t !== tag)
        : [...currentList, tag];
      return { ...prev, [key]: nextList };
    });
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    const key = currentQuestion.id;
    setWrittenAnswers((prev) => ({ ...prev, [key]: text }));
  };

  // Save perception only if requested
  const handleSavePerception = () => {
    const payload = buildPayload();
    const newRecord: SavedPerception = {
      ...payload,
      id: `perception_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newRecord, ...savedPerceptions];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      setSavedPerceptions(nextList);
      setIsCurrentSaved(true);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  // Finish without saving
  const handleFinishWithoutSaving = () => {
    // Reset state cleanly and return to initial stillness
    resetState();
  };

  const resetState = () => {
    setWrittenAnswers({
      attention: "",
      body: "",
      feeling: "",
      need: "",
      reflection: "",
    });
    setChosenTags({
      attention: [],
      body: [],
      feeling: [],
      need: [],
      reflection: [],
    });
    setCurrentStepIndex(0);
    setIsCurrentSaved(false);
  };

  const handleDeleteSaved = (id: string) => {
    const nextList = savedPerceptions.filter((item) => item.id !== id);
    setSavedPerceptions(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      // safe
    }
  };

  const handleClearAllSaved = () => {
    if (
      window.confirm(
        "Deseja realmente apagar o histórico de percepções deste dispositivo?",
      )
    ) {
      setSavedPerceptions([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // safe
      }
    }
  };

  const cycleWatercolor = () => {
    if (watercolorMode === "subtle") setWatercolorMode("soft");
    else if (watercolorMode === "soft") setWatercolorMode("minimal");
    else setWatercolorMode("subtle");
  };

  return (
    <div className="relative min-h-full flex flex-col justify-between overflow-x-hidden">
      {/* Subtle reactive watercolor background */}
      <WatercolorBackground
        currentQuestion={currentQuestion}
        isCompletion={isFinished}
        intensity={watercolorMode}
      />

      {/* Top Bar Header */}
      <header
        id="app-header"
        className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex flex-wrap gap-3 items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B63] font-semibold">
                Recurso · Aqui e Agora
              </span>
              <span className="text-[#D8CFBE] text-xs">/</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B63] font-semibold">
                Perceber
              </span>
            </div>
            <h2 className="font-serif-awareness text-lg sm:text-xl text-[#262B22] font-normal leading-tight">
              Check-in e Diário do Aqui e Agora
            </h2>
          </div>
        </div>

        {/* Quiet utility controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Subtle sound toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-full transition-colors ${
              soundEnabled
                ? "text-[#6B6B63] hover:bg-[#F1E9DB]"
                : "text-[#D8CFBE] hover:bg-[#F1E9DB]"
            }`}
            title={soundEnabled ? "Sino suave ativado" : "Sino desativado"}
            aria-label={
              soundEnabled ? "Silenciar som suave" : "Ativar som suave"
            }
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Watercolor background toggle */}
          <button
            id="btn-toggle-watercolor"
            type="button"
            onClick={cycleWatercolor}
            className="p-2 rounded-full text-[#6B6B63] hover:bg-[#F1E9DB] transition-colors"
            title={`Aquarela: ${watercolorMode}`}
            aria-label="Ajustar intensidade da aquarela"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Privacy pledge modal toggle */}
          <button
            id="btn-privacy-info"
            type="button"
            onClick={() => setIsPrivacyNoticeOpen(true)}
            className="p-2 rounded-full text-[#6B6B63] hover:bg-[#F1E9DB] transition-colors"
            title="Garantia de privacidade"
            aria-label="Abrir termo de privacidade"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Vault of saved perceptions */}
          <button
            id="btn-open-saved-modal"
            type="button"
            onClick={() => setIsSavedModalOpen(true)}
            className="relative p-2 rounded-full text-[#6B6B63] hover:bg-[#F1E9DB] transition-colors"
            title="Percepções guardadas"
            aria-label="Abrir percepções guardadas"
          >
            <Archive className="w-4 h-4" />
            {savedPerceptions.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#6B6B63] text-[#FDFAF4] rounded-full text-[10px] flex items-center justify-center font-medium">
                {savedPerceptions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Experience Arena */}
      <main
        id="awareness-flow-arena"
        className="relative z-10 flex-1 flex flex-col justify-center items-center py-4 sm:py-8"
      >
        {/* Fine SVG organic branch progress traversal */}
        {storageError && (
          <p
            role="alert"
            className="relative z-10 mx-auto mb-2 max-w-xl px-4 text-center text-xs text-[#96551F]"
          >
            Não foi possível guardar neste navegador. A percepção permanece
            apenas nesta tela.
          </p>
        )}
        <div className="w-full mb-2">
          <OrganicBranch
            questions={QUESTIONS}
            currentIndex={currentStepIndex}
            onSelectStep={handleSelectStep}
            isFinished={isFinished}
          />
        </div>

        {/* Questions or Completion view */}
        {!isFinished && currentQuestion ? (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            value={writtenAnswers[currentQuestion.id]}
            selectedTags={chosenTags[currentQuestion.id] || []}
            onChangeText={handleTextChange}
            onToggleTag={handleToggleTag}
            onNext={handleNextStep}
            onSkip={handleSkipStep}
            onPrevious={handlePreviousStep}
            canGoBack={currentStepIndex > 0}
          />
        ) : (
          <CompletionView
            payload={buildPayload()}
            onSave={handleSavePerception}
            onFinishWithoutSaving={handleFinishWithoutSaving}
            onStartNew={resetState}
            isSaved={isCurrentSaved}
          />
        )}
      </main>

      {/* Footer reassurance */}
      <footer
        id="app-footer"
        className="relative z-10 w-full max-w-xl mx-auto px-4 py-4 text-center text-xs text-[#6B6B63] select-none"
      >
        <p className="flex items-center justify-center gap-1.5 font-normal">
          <Shield className="w-3.5 h-3.5 opacity-70" />
          <span>
            Experiência íntima · Nenhum dado textual é disponibilizado a
            dashboards
          </span>
        </p>
      </footer>

      {/* Saved Perceptions Modal */}
      <SavedPerceptionsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedList={savedPerceptions}
        onDelete={handleDeleteSaved}
        onClearAll={handleClearAllSaved}
      />

      {/* Privacy modal */}
      {isPrivacyNoticeOpen && (
        <div
          id="privacy-dialog-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/45 "
          onClick={() => setIsPrivacyNoticeOpen(false)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            setIsPrivacyNoticeOpen(false);
          }}
        >
          <div
            id="privacy-dialog"
            ref={privacyDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FDFAF4] border border-[#F1E9DB] rounded-3xl p-6 "
          >
            <div className="flex items-center gap-2.5 text-[#6B6B63] mb-3">
              <Shield className="w-5 h-5" aria-hidden="true" />
              <h3
                id="privacy-dialog-title"
                className="font-serif-awareness text-xl text-[#262B22]"
              >
                Privacidade local
              </h3>
            </div>
            <div className="text-sm text-[#4B4B49] space-y-3 leading-relaxed">
              <p>
                O recurso <strong>Aqui e Agora</strong> foi concebido para o seu
                momento presente e reflexão genuína.
              </p>
              <p>
                • <strong>Registro pessoal:</strong> o que você escreve ou marca
                permanece no armazenamento local deste navegador, visível apenas
                neste dispositivo e neste site.
              </p>
              <p>
                • <strong>Sem métricas textuais:</strong> nenhuma palavra ou
                nota é enviada a dashboards de equipe, métricas administrativas
                ou serviços de IA.
              </p>
              <p>
                • <strong>Sua escolha:</strong> ao final do ciclo, você decide
                livremente se deseja guardar a percepção ou finalizar sem
                salvar.
              </p>
            </div>
            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setIsPrivacyNoticeOpen(false)}
                className="px-5 py-2 text-xs font-medium rounded-full bg-[#262B22] text-[#FDFAF4] hover:bg-[#262B22] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B6B63]"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
