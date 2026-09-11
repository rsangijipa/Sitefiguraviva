"use client";

import React, { useState, useEffect } from "react";
import {
  EmotionFamily,
  EmotionNuance,
  EmotionSelectionEntry,
  WheelStep,
  ViewMode,
  EmotionRecord,
} from "./types";
import { initialEmotionFamilies } from "./content";
import { EmotionWheel } from "./components/EmotionWheel";
import { EmotionList } from "./components/EmotionList";
import { EmotionDetailPanel } from "./components/EmotionDetailPanel";
import { SelectedEmotions } from "./components/SelectedEmotions";
import { EmotionHistory } from "./components/EmotionHistory";
import {
  saveEmotionRecord,
  listEmotionRecords,
  deleteEmotionRecord,
} from "./repository";
import {
  Sparkles,
  Compass,
  List,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export function EmotionWheelExperience() {
  const [step, setStep] = useState<WheelStep>("intro");
  const [viewMode, setViewMode] = useState<ViewMode>("wheel");
  const [families] = useState<EmotionFamily[]>(initialEmotionFamilies);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(
    "alegria",
  );
  const [selectedNuance, setSelectedNuance] = useState<EmotionNuance | null>(
    null,
  );
  const [selectedFamily, setSelectedFamily] = useState<EmotionFamily | null>(
    null,
  );
  const [selectedEntries, setSelectedEntries] = useState<
    EmotionSelectionEntry[]
  >([]);
  const [isUnsure, setIsUnsure] = useState(false);
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await listEmotionRecords();
      setRecords(data);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectNuance = (nuance: EmotionNuance, fam: EmotionFamily) => {
    setSelectedNuance(nuance);
    setSelectedFamily(fam);
  };

  const handleAddEntry = (entry: EmotionSelectionEntry) => {
    if (selectedEntries.length >= 5) return;
    // Prevent duplicate nuances
    if (!selectedEntries.some((e) => e.labelSnapshot === entry.labelSnapshot)) {
      setSelectedEntries([...selectedEntries, entry]);
      setIsUnsure(false);
    }
    setSelectedNuance(null);
    setSelectedFamily(null);
  };

  const handleRemoveEntry = (index: number) => {
    const next = [...selectedEntries];
    next.splice(index, 1);
    setSelectedEntries(next);
  };

  const handleSaveRecord = async (note: string) => {
    try {
      setErrorMessage(null);
      const payload = {
        status: isUnsure ? ("unsure" as const) : ("named" as const),
        entries: selectedEntries,
        note: note.trim() || null,
      };
      await saveEmotionRecord(payload);
      await loadHistory();
      setStep("saved");
      setSuccessMessage("Registro salvo no seu histórico privado.");
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Não foi possível salvar. Seu registro continua nesta tela.",
      );
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteEmotionRecord(id);
      await loadHistory();
    } catch {
      // ignore
    }
  };

  if (step === "intro") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]">
        <div className="max-w-xl w-full bg-[#FDFAF4] border border-[#D8CFBE] p-8 sm:p-12 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-[#F1E9DB] text-[#005A1F] rounded-2xl flex items-center justify-center mx-auto border border-[#D8CFBE]">
            <Compass size={32} />
          </div>
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#96551F]">
              <Sparkles size={14} aria-hidden="true" /> Perceber · Figura Viva
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#005A1F]">
              O que ganha nome agora?
            </h1>
            <p className="text-[#262B22] text-base leading-relaxed">
              Explore famílias de emoções e suas nuances. Você pode escolher
              mais de uma, ou ainda não saber.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => setStep("exploring")}
              className="px-8 py-4 bg-[#005A1F] text-white rounded-2xl font-bold text-base hover:bg-[#07614C] transition shadow-sm min-h-[44px]"
            >
              Explorar a roda
            </button>
            <button
              type="button"
              onClick={() => setStep("history")}
              className="px-6 py-4 bg-[#F1E9DB] text-[#005A1F] rounded-2xl font-bold text-base hover:bg-[#D8CFBE] transition min-h-[44px] inline-flex items-center justify-center gap-2"
            >
              <History size={18} /> Ver histórico ({records.length})
            </button>
          </div>

          <p className="text-xs text-[#6B6B63] pt-4 border-t border-[#D8CFBE]">
            Você pode experimentar sem salvar. Para guardar no seu histórico,
            escolha Salvar ao finalizar.
          </p>
        </div>
      </div>
    );
  }

  if (step === "history") {
    return (
      <EmotionHistory
        records={records}
        onDeleteRecord={handleDeleteRecord}
        onBack={() => setStep("exploring")}
      />
    );
  }

  if (step === "saved") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]">
        <div className="max-w-md w-full bg-[#FDFAF4] border border-[#D8CFBE] p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-[#01C94D] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#005A1F]">
              Registro Concluído
            </h2>
            <p className="text-sm text-[#262B22]">
              {successMessage ||
                "Estas foram as palavras que você escolheu hoje."}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                setSelectedEntries([]);
                setIsUnsure(false);
                setStep("exploring");
              }}
              className="w-full py-3 bg-[#005A1F] text-white rounded-xl font-bold text-sm hover:bg-[#07614C] transition min-h-[44px]"
            >
              Novo registro
            </button>
            <button
              type="button"
              onClick={() => setStep("history")}
              className="w-full py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-sm hover:bg-[#D8CFBE] transition min-h-[44px]"
            >
              Ver meu histórico
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "reviewing") {
    return (
      <div className="py-8 px-4 bg-[#FDFAF4] min-h-[80vh]">
        <SelectedEmotions
          selectedEntries={selectedEntries}
          isUnsure={isUnsure}
          onRemoveEntry={handleRemoveEntry}
          onEditChoices={() => setStep("exploring")}
          onSave={handleSaveRecord}
          onExitWithoutSaving={() => setShowExitModal(true)}
          onToggleUnsure={(val) => setIsUnsure(val)}
        />

        {showExitModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-[#FDFAF4] border border-[#D8CFBE] max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#005A1F]">
                Deseja sair sem salvar?
              </h3>
              <p className="text-sm text-[#6B6B63]">
                Ao sair, este registro não será guardado no seu histórico.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-xs"
                >
                  Continuar aqui
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    setStep("intro");
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs"
                >
                  Sair sem salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#FDFAF4]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#D8CFBE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#96551F]">
            O que ganha nome agora?
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#005A1F] mt-1">
            Roda das Emoções
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F1E9DB] p-1 rounded-xl flex items-center border border-[#D8CFBE]">
            <button
              type="button"
              onClick={() => setViewMode("wheel")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition min-h-[38px] ${
                viewMode === "wheel"
                  ? "bg-[#005A1F] text-white"
                  : "text-[#262B22] hover:bg-[#D8CFBE]/50"
              }`}
            >
              Roda
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition min-h-[38px] ${
                viewMode === "list"
                  ? "bg-[#005A1F] text-white"
                  : "text-[#262B22] hover:bg-[#D8CFBE]/50"
              }`}
            >
              Lista
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep("history")}
            className="px-4 py-2.5 bg-[#F1E9DB] text-[#005A1F] rounded-xl text-xs font-bold hover:bg-[#D8CFBE] transition inline-flex items-center gap-2 min-h-[44px]"
          >
            <History size={16} /> Histórico ({records.length})
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Experience Layout: Stage (60%) & Panel (40%) on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#D8CFBE] shadow-sm flex flex-col items-center justify-center">
          {viewMode === "wheel" ? (
            <EmotionWheel
              families={families}
              selectedEntries={selectedEntries}
              activeFamilyId={activeFamilyId}
              onSelectFamily={(fId) => setActiveFamilyId(fId)}
              onSelectNuance={handleSelectNuance}
            />
          ) : (
            <EmotionList
              families={families}
              selectedEntries={selectedEntries}
              onSelectNuance={handleSelectNuance}
            />
          )}
        </div>

        {/* Selected / Summary Sidebar */}
        <div className="lg:col-span-5 bg-[#F1E9DB]/50 p-6 rounded-3xl border border-[#D8CFBE] space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#005A1F]">
              Suas escolhas
            </h2>
            <p className="text-xs text-[#6B6B63] mt-1">
              Até 5 palavras ou nuances selecionadas.
            </p>
          </div>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-[#6B6B63] italic">
              Nenhuma nuance selecionada ainda. Toque em uma nuance na roda ou
              na lista para ver sua descrição e adicioná-la.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#D8CFBE]"
                >
                  <span className="font-bold text-[#005A1F] text-sm">
                    {entry.labelSnapshot}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(idx)}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-[#D8CFBE] space-y-3">
            <button
              type="button"
              onClick={() => setStep("reviewing")}
              disabled={selectedEntries.length === 0}
              className="w-full py-3.5 bg-[#005A1F] text-white rounded-xl font-bold text-sm hover:bg-[#07614C] transition disabled:opacity-50 min-h-[44px]"
            >
              Revisar e Salvar ({selectedEntries.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setIsUnsure(true);
                setStep("reviewing");
              }}
              className="w-full py-3 bg-white text-[#005A1F] border border-[#005A1F] rounded-xl font-bold text-sm hover:bg-[#005A1F]/10 transition min-h-[44px]"
            >
              Ainda não sei nomear
            </button>
          </div>
        </div>
      </div>

      {/* Nuance Detail Drawer / Modal */}
      <EmotionDetailPanel
        selectedNuance={selectedNuance}
        family={selectedFamily}
        selectedEntries={selectedEntries}
        onAddEntry={handleAddEntry}
        onClose={() => {
          setSelectedNuance(null);
          setSelectedFamily(null);
        }}
      />
    </div>
  );
}
