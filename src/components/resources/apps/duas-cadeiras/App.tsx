/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChairConfig, ChairId, DialogueTurn, ReflectionSession } from "./types";
import { AbstractChairs } from "./components/AbstractChairs";
import { PerspectiveInput } from "./components/PerspectiveInput";
import { DialogueExchange } from "./components/DialogueExchange";
import { SessionControls } from "./components/SessionControls";
import { TherapeuticNotice } from "./components/TherapeuticNotice";
import { ChairNamingModal } from "./components/ChairNamingModal";
import { SessionSummaryModal } from "./components/SessionSummaryModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { HistoryModal } from "./components/HistoryModal";
import {
  saveSessionToStorage,
  getSavedSessions,
  deleteSessionFromStorage,
} from "./utils/storage";
import { Settings2, History, Shield } from "lucide-react";

const DEFAULT_CHAIR_A: ChairConfig = {
  id: "A",
  name: "Voz Autocrítica",
  sublabel: "Exigências e cobranças",
  accentColor: "#1c1917", // stone-900
};

const DEFAULT_CHAIR_B: ChairConfig = {
  id: "B",
  name: "Voz Compassiva",
  sublabel: "Acolhimento e compreensão",
  accentColor: "#b45309", // amber-700
};

export default function App() {
  // Session State
  const [session, setSession] = useState<ReflectionSession>(() => ({
    id: `session_${Date.now()}`,
    title: "Diálogo: Autocrítica & Autocompaixão",
    chairA: DEFAULT_CHAIR_A,
    chairB: DEFAULT_CHAIR_B,
    turns: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCompleted: false,
  }));

  const [activeChair, setActiveChair] = useState<ChairId>("A");
  const [isPaused, setIsPaused] = useState(false);

  // Modals state
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<
    string | null
  >(null);
  const [saveState, setSaveState] = useState<"success" | "error" | null>(null);

  // Turn management
  const handleAddTurn = (text: string, switchNext: boolean) => {
    const speakerConfig = activeChair === "A" ? session.chairA : session.chairB;
    const newTurn: DialogueTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      chairId: activeChair,
      speakerName: speakerConfig.name,
      text,
      timestamp: Date.now(),
    };

    setSession((prev) => ({
      ...prev,
      turns: [...prev.turns, newTurn],
      updatedAt: Date.now(),
    }));

    if (switchNext) {
      setActiveChair((prev) => (prev === "A" ? "B" : "A"));
    }
  };

  const handleSwitchOnly = () => {
    setActiveChair((prev) => (prev === "A" ? "B" : "A"));
  };

  const handleDeleteTurn = (turnId: string) => {
    setSession((prev) => ({
      ...prev,
      turns: prev.turns.filter((t) => t.id !== turnId),
      updatedAt: Date.now(),
    }));
  };

  const handleSaveActive = () => {
    const saved = saveSessionToStorage(session);
    setSaveState(saved ? "success" : "error");
    window.setTimeout(() => setSaveState(null), 2400);
  };

  const handleUpdateReflection = (closingReflection: string) => {
    setSession((prev) => ({
      ...prev,
      closingReflection,
      updatedAt: Date.now(),
    }));
  };

  const handleRestartNewSession = () => {
    const freshSession: ReflectionSession = {
      id: `session_${Date.now()}`,
      title: "Novo Diálogo Reflexivo",
      chairA: { ...session.chairA },
      chairB: { ...session.chairB },
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isCompleted: false,
    };
    setSession(freshSession);
    setActiveChair("A");
    setIsPaused(false);
    setIsSummaryOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteSessionId) {
      deleteSessionFromStorage(pendingDeleteSessionId);
      if (pendingDeleteSessionId === session.id) {
        handleRestartNewSession();
      }
      setPendingDeleteSessionId(null);
    } else {
      // Deleting current active session
      deleteSessionFromStorage(session.id);
      handleRestartNewSession();
    }
  };

  const handleLoadSessionFromHistory = (selected: ReflectionSession) => {
    setSession(selected);
    setActiveChair("A");
    setIsPaused(false);
  };

  const activeConfig = activeChair === "A" ? session.chairA : session.chairB;
  const otherConfig = activeChair === "A" ? session.chairB : session.chairA;

  return (
    <div className="min-h-full bg-stone-50 text-stone-900 font-sans flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      <div className="border-b border-stone-200/80 bg-white/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-14 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-naming-modal"
              onClick={() => setIsNamingOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Renomear e definir as perspectivas das duas cadeiras"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nomear Cadeiras</span>
            </button>

            <button
              type="button"
              id="btn-open-history-modal"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Ver reflexões salvas no navegador"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Save confirmation toast */}
        {saveState && (
          <div
            id="save-success-notification"
            role="status"
            className={`w-full max-w-2xl mx-auto rounded-lg border px-3.5 py-2 text-xs flex items-center justify-between shadow-xs ${
              saveState === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>
              {saveState === "success"
                ? "Reflexão salva neste navegador. Você pode apagá-la no Histórico."
                : "Não foi possível salvar neste navegador. O diálogo permanece apenas na memória da página."}
            </span>
            <span className="font-mono text-[11px] opacity-70">
              {saveState === "success" ? "Local" : "Erro"}
            </span>
          </div>
        )}

        {/* Therapeutic Disclaimer Banner */}
        <TherapeuticNotice />

        {/* Spatial Two Chairs Stage */}
        <section
          id="stage-chairs-area"
          aria-label="Palco das Duas Cadeiras"
          className="rounded-2xl border border-stone-200/80 bg-white/70 backdrop-blur-xs p-3 sm:p-5 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between px-2 pt-1">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Espaço Dialógico &bull; Alternância de Perspectiva
            </h2>
            <button
              type="button"
              onClick={() => setIsNamingOpen(true)}
              className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 decoration-stone-300 transition-colors"
            >
              Alterar perspectivas
            </button>
          </div>

          <AbstractChairs
            activeChair={activeChair}
            onSelectChair={(chair) => {
              if (activeChair !== chair) {
                setActiveChair(chair);
              }
            }}
            chairA={session.chairA}
            chairB={session.chairB}
            disabled={isPaused}
          />

          {/* Active Perspective Input Field */}
          <PerspectiveInput
            activeChair={activeChair}
            activeConfig={activeConfig}
            otherConfig={otherConfig}
            onSubmitTurn={handleAddTurn}
            onSwitchOnly={handleSwitchOnly}
            isPaused={isPaused}
          />

          {/* Session Action Controls */}
          <SessionControls
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            onSwitchChair={handleSwitchOnly}
            onEndSession={() => setIsSummaryOpen(true)}
            onSaveSession={handleSaveActive}
            onRequestDelete={() => {
              setPendingDeleteSessionId(session.id);
              setIsDeleteModalOpen(true);
            }}
            hasTurns={session.turns.length > 0}
            activeChair={activeChair}
          />
        </section>

        {/* Dialogue Exchange Record */}
        <section id="dialogue-transcript-area">
          <DialogueExchange
            turns={session.turns}
            chairA={session.chairA}
            chairB={session.chairB}
            onDeleteTurn={handleDeleteTurn}
          />
        </section>
      </main>

      {/* Footer / Privacy & Philosophy notice */}
      <footer className="mt-auto border-t border-stone-200/80 bg-stone-100/50 py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span>
              Privacidade estrita: nada é gravado ou enviado enquanto você não
              escolher salvar. Nenhum dado vai para IA ou administradores.
            </span>
          </div>
          <span className="text-stone-400 text-[11px]">
            Inspirado no método dialógico gestáltico
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ChairNamingModal
        isOpen={isNamingOpen}
        onClose={() => setIsNamingOpen(false)}
        chairA={session.chairA}
        chairB={session.chairB}
        sessionTitle={session.title}
        onSave={(newA, newB, newTitle) => {
          setSession((prev) => ({
            ...prev,
            chairA: newA,
            chairB: newB,
            title: newTitle,
            updatedAt: Date.now(),
          }));
        }}
      />

      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        session={session}
        onUpdateReflection={handleUpdateReflection}
        onSaveSession={handleSaveActive}
        onRequestDelete={() => {
          setPendingDeleteSessionId(session.id);
          setIsSummaryOpen(false);
          setIsDeleteModalOpen(true);
        }}
        onRestartNewSession={handleRestartNewSession}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPendingDeleteSessionId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Apagar sessão?"
        description="Tem certeza de que deseja excluir permanentemente esta sessão de reflexão dialógica? Esta ação não pode ser desfeita."
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={getSavedSessions()}
        onSelectSession={handleLoadSessionFromHistory}
        onDeleteSession={(sessionId) => {
          setPendingDeleteSessionId(sessionId);
          setIsDeleteModalOpen(true);
        }}
      />
    </div>
  );
}
