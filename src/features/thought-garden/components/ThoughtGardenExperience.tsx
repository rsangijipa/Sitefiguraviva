"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GardenStep,
  MAX_EPHEMERAL_LEAVES,
  type ClientThought as TypeClientThought,
} from "../types";
import { useSessionState } from "../use-session-state";
import {
  saveGardenThought,
  listSavedThoughts,
  deleteGardenThought,
} from "../repository";
import { GardenStage } from "./GardenStage";
import { ThoughtComposer } from "./ThoughtComposer";
import { SavedThoughtsList } from "./SavedThoughtsList";
import { GardenCompletion } from "./GardenCompletion";
import { GardenExitModal } from "./GardenExitModal";
import { GardenLoading } from "./GardenLoading";
import { GardenErrorState } from "./GardenErrorState";
import { GardenEmptyState } from "./GardenEmptyState";
import {
  Leaf,
  Compass,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface ThoughtGardenExperienceProps {
  onSectionChange?: (section: string) => void;
  activeSection?: string;
}

export default function ThoughtGardenExperience({
  onSectionChange,
}: ThoughtGardenExperienceProps) {
  const [step, setStep] = useState<GardenStep>("intro");
  const [savedThoughts, setSavedThoughts] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(
    null,
  );
  const [isFloating, setIsFloating] = useState<Set<string>>(new Set());

  const {
    leaves,
    addLeaf,
    removeLeaf: removeLeafFromSession,
    clearAll,
    updateStatus,
  } = useSessionState();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await listSavedThoughts();
      setSavedThoughts(data);
    } catch {
      // ignore history load error
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddLeaf = useCallback(
    (text: string) => {
      setErrorMessage(null);
      const result = addLeaf(text);
      if (!result.success) {
        setErrorMessage(
          result.error || "N\u00e3o foi poss\u00edvel adicionar o pensamento.",
        );
      }
    },
    [addLeaf],
  );

  const handleSaveLeaf = async (leafId: string) => {
    const leaf = leaves.find((l) => l.id === leafId);
    if (!leaf) return;

    try {
      setErrorMessage(null);
      const savedRecord = await saveGardenThought(
        leaf.thoughtText,
        leaf.id,
        leaf.optionalTitle,
      );
      updateStatus(leafId, "saved");
      // Update with saved record ID in local state
      setTimeout(() => {
        loadHistory();
      }, 100);
      setSuccessMessage("Registro salvo no seu hist\u00f3rico privado.");
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "N\u00e3o foi poss\u00EDvel salvar. Seu registro continua nesta tela.",
      );
    }
  };

  const handleFloatLeaf = useCallback(
    (leafId: string) => {
      updateStatus(leafId, "floating");
      setIsFloating((prev) => new Set([...prev, leafId]));
    },
    [updateStatus],
  );

  const handleRemoveLeaf = useCallback(
    (leafId: string) => {
      const leaf = leaves.find((l) => l.id === leafId);
      if (leaf && !leaf.savedRecordId) {
        setShowRemoveConfirm(leafId);
      } else {
        removeLeafFromSession(leafId);
      }
    },
    [leaves, removeLeafFromSession],
  );

  const confirmRemove = useCallback(() => {
    if (showRemoveConfirm) {
      removeLeafFromSession(showRemoveConfirm);
      setShowRemoveConfirm(null);
    }
  }, [showRemoveConfirm, removeLeafFromSession]);

  const cancelRemove = useCallback(() => {
    setShowRemoveConfirm(null);
  }, []);

  const handleClearAll = useCallback(() => {
    if (leaves.length > 0) {
      clearAll();
    }
  }, [leaves.length, clearAll]);

  const handleDeleteSaved = async (id: string) => {
    try {
      await deleteGardenThought(id);
      await loadHistory();
    } catch {
      setErrorMessage("N\u00e3o foi poss\u00EDvel excluir do hist\u00f3rico.");
    }
  };

  const handleExit = useCallback(() => {
    setShowExitModal(true);
  }, []);

  const continueWithoutSaving = useCallback(() => {
    setShowExitModal(false);
    setStep("completion");
    clearAll();
  }, [clearAll]);

  if (step === "intro") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]">
        <div className="max-w-xl w-full bg-[#FDFAF4] border border-[#D8CFBE] p-8 sm:p-12 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-[#F1E9DB] text-[#005A1F] rounded-2xl flex items-center justify-center mx-auto border border-[#D8CFBE]">
            <Compass size={32} />
          </div>
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#96551F]">
              <Leaf size={14} aria-hidden="true" /> Regrar · Jardim de
              Pensamentos
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#005A1F]">
              D\u00ea uma forma passageira ao que passa pela sua mente.
            </h1>
            <p className="text-[#262B22]/80 text-base leading-relaxed">
              Um lugar para pousar pensamentos. Escreva se quiser. Voc\u00ea
              pode guardar, observar ou deixar a folha sair desta
              experi\u00eancia.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => setStep("observing")}
              className="px-8 py-4 bg-[#005A1F] text-white rounded-2xl font-bold text-base hover:bg-[#07614C] transition shadow-sm min-h-[44px]"
            >
              Entrar no jardim
            </button>
          </div>

          <p className="text-xs text-[#6B6B63] pt-4 border-t border-[#D8CFBE]">
            Voc\u00ea pode experimentar sem salvar. Para guardar no seu
            hist\u00f3rico, escolha Salvar ao finalizar. Uma folha sair da tela
            n\u00e3o significa que um pensamento precisa desaparecer.
          </p>
        </div>
      </div>
    );
  }

  if (step === "completion") {
    return (
      <GardenCompletion
        onContinue={() => setStep("observing")}
        onViewHistory={() => setStep("history")}
      />
    );
  }

  if (step === "history") {
    return (
      <div className="py-8 px-4 bg-[#FDFAF4] min-h-[80vh] max-w-3xl mx-auto">
        <Link
          href="/portal/recursos/jardim-de-pensamentos"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#005A1F] hover:underline mb-6 min-h-[44px]"
        >
          \u2190 Voltar ao jardim
        </Link>
        <h2 className="font-serif text-2xl font-bold text-[#005A1F] mb-6">
          Meu hist\u00f3rico de pensamentos guardados
        </h2>
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm mb-4">
            <AlertCircle size={20} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <SavedThoughtsList
          thoughts={savedThoughts}
          onDelete={handleDeleteSaved}
          loading={loadingHistory}
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 bg-[#FDFAF4] min-h-[100dvh] max-w-7xl mx-auto">
      <Link
        href="/portal/materials"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#005A1F] hover:underline mb-6 min-h-[44px]"
      >
        \u2190 Voltar aos recursos
      </Link>

      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Composer + Stage (65%) */}
        <div className="lg:col-span-7 space-y-6">
          <ThoughtComposer
            onAdd={handleAddLeaf}
            placeholder="Escreva uma frase, se quiser..."
            helpText="Um pensamento que est\u00e1 presente..."
          />
          <GardenStage
            leaves={leaves.filter((l) => l.status !== "draft")}
            onSaveLeaf={handleSaveLeaf}
            onRemoveLeaf={handleRemoveLeaf}
            onFloatLeaf={handleFloatLeaf}
          />
          {leaves.length > 0 && leaves.some((l) => l.savedRecordId == null) && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleExit}
                className="text-sm text-[#005A1F] underline min-h-[44px]"
              >
                Encerrar e limpar folhas ef\u00eameras
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-600 underline min-h-[44px]"
              >
                Limpar tudo sem salvar
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: History (35%) */}
        <div className="lg:col-span-5 bg-[#F1E9DB]/50 rounded-[24px] border border-[#D8CFBE] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#005A1F]">
                Hist\u00f3rico privado
              </h3>
              <p className="text-xs text-[#6B6B63] mt-0.5">
                Seus pensamentos guardados ficam aqui. Professores e outros
                alunos n\u00e3o t\u00eam acesso por esta ferramenta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("history")}
              className="px-4 py-2.5 bg-[#F1E9DB] text-[#005A1F] rounded-xl text-xs font-bold hover:bg-[#D8CFBE] transition inline-flex items-center gap-2 min-h-[44px]"
            >
              <History size={16} /> Ver todos
            </button>
          </div>
          <SavedThoughtsList
            thoughts={savedThoughts.slice(0, 5)}
            loading={loadingHistory}
          />
        </div>
      </div>

      {/* Floating animation for floating leaves */}
      {leaves
        .filter((l) => isFloating.has(l.id))
        .map((leaf) => (
          <style key={leaf.id}>{`
          @keyframes fv-float-${leaf.id} {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          .fv-floating-${leaf.id} {
            animation: fv-float-${leaf.id} 4s ease-in-out infinite;
          }
        `}</style>
        ))}

      {showExitModal && (
        <GardenExitModal
          onContinue={() => setShowExitModal(false)}
          onExit={continueWithoutSaving}
        />
      )}

      {showRemoveConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FDFAF4] border border-[#D8CFBE] max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#005A1F]">
              Retirar deste jardim?
            </h3>
            <p className="text-sm text-[#6B6B63]">
              Este pensamento n\u00e3o foi guardado. Se voc\u00ea retir\u00e1-lo
              agora, o texto ser\u00e1 perdido e n\u00e3o poder\u00e1 ser
              recuperado.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={cancelRemove}
                className="flex-1 py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-xs hover:bg-[#D8CFBE] transition min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition min-h-[44px]"
              >
                Sim, retirar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
