import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  BookMarked,
  HelpCircle,
  PenLine,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { Vignette, VignetteResponse, DiaryEntry } from "../types";
import { RelationalFieldCanvas } from "./RelationalFieldCanvas";

interface VignettePlayerProps {
  vignette: Vignette;
  onNext: () => void;
  onPrev: () => void;
  onRandom: () => void;
  onSaveDiary: (entry: Omit<DiaryEntry, "id" | "createdAt">) => Promise<void>;
  onOpenCatalog: () => void;
  onOpenDiary: () => void;
}

export const VignettePlayer: React.FC<VignettePlayerProps> = ({
  vignette,
  onNext,
  onPrev,
  onRandom,
  onSaveDiary,
  onOpenCatalog,
  onOpenDiary,
}) => {
  // Temporary state for the active vignette: NO automatic persistence of choices!
  const [selectedResponse, setSelectedResponse] =
    useState<VignetteResponse | null>(null);
  const [interactiveDistance, setInteractiveDistance] = useState<
    number | undefined
  >(undefined);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);

  // Reflection diary form state
  const [reflectionText, setReflectionText] = useState("");
  const [bodyAwareness, setBodyAwareness] = useState("");
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [diarySavedNotice, setDiarySavedNotice] = useState(false);

  // Active view tab for didactic analysis
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    "readings" | "institute"
  >("readings");

  // Handle selecting a response
  const handleSelectResponse = (resp: VignetteResponse) => {
    setSelectedResponse(resp);
    // Reset manual distance to match response dynamic
    setInteractiveDistance(resp.fieldDynamic.separationDistance);
  };

  const handleResetChoice = () => {
    setSelectedResponse(null);
    setInteractiveDistance(undefined);
  };

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    setIsSavingDiary(true);
    try {
      await onSaveDiary({
        vignetteId: vignette.id,
        vignetteTitle: vignette.title,
        vignetteContext: vignette.context,
        selectedResponseId: selectedResponse?.id,
        selectedResponseAction: selectedResponse?.actionText,
        selectedMovementLabel: selectedResponse?.relationalMovementLabel,
        reflectiveQuestion: vignette.reflectiveQuestion,
        reflectionText: reflectionText.trim(),
        bodyAwareness: bodyAwareness.trim() || undefined,
      });

      setDiarySavedNotice(true);
      setReflectionText("");
      setBodyAwareness("");
      setTimeout(() => setDiarySavedNotice(false), 5000);
    } finally {
      setIsSavingDiary(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Vignette Metadata & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1E9DB]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F1E9DB] text-[#4B4B49] border border-[#D8CFBE]">
            {vignette.category}
          </span>
          <button
            onClick={onOpenCatalog}
            className="text-xs text-[#6B6B63] hover:text-[#262B22] underline underline-offset-2"
          >
            Ver todas as vinhetas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-prev-vignette"
            onClick={() => {
              handleResetChoice();
              onPrev();
            }}
            className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors"
            title="Vinheta anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="btn-random-vignette"
            onClick={() => {
              handleResetChoice();
              onRandom();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D8CFBE] text-xs text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors"
            title="Sortear outra vinheta"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sortear</span>
          </button>

          <button
            id="btn-next-vignette"
            onClick={() => {
              handleResetChoice();
              onNext();
            }}
            className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors"
            title="Próxima vinheta"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Narrative Card: Contexto & Situação */}
      <section
        id="vignette-scenario-card"
        className="bg-paper rounded-2xl border border-[#F1E9DB] p-6 sm:p-7 "
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6B6B63]">
              Contexto Relacional
            </span>
            <p className="text-sm sm:text-base text-[#4B4B49] leading-relaxed mt-1">
              {vignette.context}
            </p>
          </div>

          <div className="pt-3 border-t border-[#F1E9DB]">
            <h2 className="font-serif text-xl sm:text-2xl text-[#262B22] font-normal tracking-tight">
              {vignette.title}
            </h2>
            <div className="mt-2 text-sm sm:text-base text-[#262B22] leading-relaxed bg-[#FDFAF4] p-4 rounded-xl border border-[#F1E9DB]">
              <strong className="font-medium text-[#6B6B63] block text-xs uppercase tracking-wide mb-1">
                Situação Concreta:
              </strong>
              {vignette.situation}
            </div>
          </div>
        </div>
      </section>

      {/* Relational Field Visual Canvas */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[#6B6B63] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6B6B63]" />
            Campo Relacional Interativo
          </h3>
          <button
            onClick={() => setInteractiveMode(!interactiveMode)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              interactiveMode
                ? "bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE]"
                : "bg-transparent text-[#6B6B63] border-[#F1E9DB] hover:bg-[#F1E9DB]"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>
              {interactiveMode ? "Modo Guiado" : "Ajustar Distância Livremente"}
            </span>
          </button>
        </div>

        <RelationalFieldCanvas
          fieldDynamic={selectedResponse?.fieldDynamic}
          selectedMovementType={selectedResponse?.movementType}
          interactiveDistance={interactiveDistance}
          onDistanceChange={setInteractiveDistance}
          interactiveMode={interactiveMode}
        />
      </section>

      {/* 3 Maneiras de Responder */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-serif text-lg text-[#262B22] font-normal">
              3 Maneiras de Responder
            </h3>
            <p className="text-xs text-[#6B6B63]">
              Selecione uma atitude relacional para observar como o campo e as
              fronteiras se reorganizam.
            </p>
          </div>
          {selectedResponse && (
            <button
              onClick={handleResetChoice}
              className="text-xs text-[#6B6B63] hover:text-[#262B22] underline underline-offset-2"
            >
              Limpar escolha
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {vignette.responses.map((resp, idx) => {
            const isSelected = selectedResponse?.id === resp.id;
            const letter = String.fromCharCode(65 + idx); // A, B, C

            // Movement tone accents
            const movementBadgeColor =
              resp.movementType === "approach"
                ? "bg-[#F1E9DB] text-[#96551F] border-[#D8CFBE]"
                : resp.movementType === "withdrawal"
                  ? "bg-[#F1E9DB] text-[#4B4B49] border-[#D8CFBE]"
                  : "bg-[#F1E9DB] text-[#4B4B49] border-[#D8CFBE]";

            return (
              <button
                key={resp.id}
                id={`response-card-${resp.id}`}
                onClick={() => handleSelectResponse(resp)}
                className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-[#FDFAF4] border-[#6B6B63] ring-2 ring-[#6B6B63]/20 "
                    : "bg-paper border-[#F1E9DB] hover:border-[#D8CFBE] hover:bg-[#FDFAF4]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#F1E9DB] text-[#4B4B49] font-mono text-xs flex items-center justify-center font-semibold">
                      {letter}
                    </span>
                    <span
                      className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${movementBadgeColor}`}
                    >
                      {resp.relationalMovementLabel.split("/")[0].trim()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#262B22] leading-relaxed">
                    {resp.actionText}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#F1E9DB] flex items-center justify-between text-[11px] text-[#6B6B63]">
                  <span>{resp.fieldDynamic.label}</span>
                  <span className="font-medium text-[#4B4B49]">
                    {resp.fieldDynamic.tensionLevel === "low"
                      ? "Baixa tensão"
                      : resp.fieldDynamic.tensionLevel === "moderate"
                        ? "Média tensão"
                        : "Alta tensão"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Deep Reflection and Didactic Analysis Section */}
      <AnimatePresence>
        {selectedResponse && (
          <motion.section
            id="didactic-analysis-container"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-paper rounded-2xl border border-[#D8CFBE] p-5 sm:p-7  space-y-5"
          >
            {/* Header: Selected Movement & Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1E9DB]">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6B6B63]">
                  Análise do Movimento Selecionado
                </span>
                <h4 className="font-serif text-lg text-[#262B22] font-normal mt-0.5">
                  {selectedResponse.relationalMovementLabel}
                </h4>
              </div>

              {/* Institute objective check badge */}
              <div>
                {!selectedResponse.instituteAnalysis.hasObjectiveAnswer ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#F1E9DB] text-[#6B6B63] border border-[#D8CFBE]">
                    <Info className="w-3.5 h-3.5 text-[#6B6B63]" />
                    Situação Ambígua (Sem resposta única pré-fabricada)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#F1E9DB] text-[#4B4B49] border border-[#D8CFBE]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6B6B63]" />
                    Referência Didática do Instituto
                  </span>
                )}
              </div>
            </div>

            {/* Tabs for separating "Possíveis Leituras" from "Conteúdo Didático do Instituto" */}
            <div className="flex items-center gap-2 border-b border-[#F1E9DB] pb-2">
              <button
                id="tab-readings"
                onClick={() => setActiveAnalysisTab("readings")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeAnalysisTab === "readings"
                    ? "bg-[#F1E9DB] text-[#262B22] border border-[#D8CFBE]"
                    : "text-[#6B6B63] hover:text-[#262B22]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Possíveis Leituras Fenomênicas</span>
              </button>

              <button
                id="tab-institute"
                onClick={() => setActiveAnalysisTab("institute")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeAnalysisTab === "institute"
                    ? "bg-[#F1E9DB] text-[#262B22] border border-[#D8CFBE]"
                    : "text-[#6B6B63] hover:text-[#262B22]"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Conteúdo Teórico do Instituto</span>
              </button>
            </div>

            {/* Tab 1: Possíveis Leituras */}
            {activeAnalysisTab === "readings" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-[#6B6B63]">
                  Em situações relacionais complexas, nenhum movimento é
                  puramente "certo" ou "errado". Cada escolha revela diferentes
                  intenções de autopreservação, conexão ou acomodação:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedResponse.possibleReadings.map((reading, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB] text-xs text-[#262B22] leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B63] mt-1.5 shrink-0" />
                      <span>{reading}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Conteúdo Didático do Instituto */}
            {activeAnalysisTab === "institute" && (
              <div className="space-y-3 pt-1">
                {selectedResponse.instituteAnalysis.conceptName && (
                  <div className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#F1E9DB] text-[#4B4B49] border border-[#D8CFBE]">
                    Conceito Teórico:{" "}
                    {selectedResponse.instituteAnalysis.conceptName}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#FDFAF4] border border-[#D8CFBE] text-sm text-[#262B22] leading-relaxed">
                  {selectedResponse.instituteAnalysis.objectiveAnswerNote && (
                    <div className="mb-2 font-medium text-xs text-[#4B4B49] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4B4B49]" />
                      {selectedResponse.instituteAnalysis.objectiveAnswerNote}
                    </div>
                  )}
                  <p>
                    {selectedResponse.instituteAnalysis.didacticExplanation}
                  </p>
                </div>

                {vignette.instituteCoreLesson && (
                  <p className="text-xs text-[#6B6B63] italic pl-2 border-l-2 border-[#6B6B63]">
                    Diretriz do Instituto: {vignette.instituteCoreLesson}
                  </p>
                )}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Pergunta Reflexiva & Diário de Contato */}
      <section
        id="reflective-question-card"
        className="bg-gradient-to-br from-[#FDFAF4] to-[#F1E9DB] rounded-2xl border border-[#D8CFBE] p-6 sm:p-7  space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#F1E9DB] text-[#4B4B49] shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6B6B63]">
              Pergunta Reflexiva para Consciência de Fronteira
            </span>
            <p className="font-serif text-base sm:text-lg text-[#262B22] font-normal leading-relaxed mt-1">
              "{vignette.reflectiveQuestion}"
            </p>
          </div>
        </div>

        {/* Action to open reflection diary form */}
        <div className="pt-3 border-t border-[#D8CFBE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#6B6B63]">
            Sua escolha de resposta é passageira e não foi salva. Deseja
            registrar suas impressões no Diário de Contato?
          </p>

          <button
            id="btn-toggle-diary-form"
            onClick={() => setShowDiaryForm(!showDiaryForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#262B22] text-[#FDFAF4] hover:bg-[#262B22] text-xs font-medium transition-colors  self-start sm:self-auto shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>
              {showDiaryForm ? "Recolher Diário" : "Salvar Reflexão no Diário"}
            </span>
          </button>
        </div>

        {/* Diary Saved Toast */}
        <AnimatePresence>
          {diarySavedNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl text-xs text-[#4B4B49] flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4B4B49]" />
                Reflexão salva com sucesso no seu Diário de Contato pessoal!
              </span>
              <button
                onClick={onOpenDiary}
                className="underline underline-offset-2 font-medium hover:text-[#262B22]"
              >
                Abrir Diário
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form to save personal reflection */}
        <AnimatePresence>
          {showDiaryForm && (
            <motion.form
              id="reflection-diary-form"
              onSubmit={handleSaveReflection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3.5 pt-2"
            >
              {selectedResponse && (
                <div className="p-2.5 rounded-lg bg-[#F1E9DB] text-[11px] text-[#4B4B49] flex items-center justify-between">
                  <span>
                    Associando à atitude experimentada:{" "}
                    <strong>{selectedResponse.relationalMovementLabel}</strong>
                  </span>
                  <span className="text-[10px] text-[#6B6B63]">(opcional)</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#4B4B49] mb-1">
                  Sua Reflexão Pessoal:
                </label>
                <textarea
                  required
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Como esta dinâmica reverbera na sua história de vida? Qual limite você gostaria de expressar de forma mais consciente?"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl bg-paper border border-[#D8CFBE] focus:border-[#6B6B63] focus:outline-none placeholder:text-[#6B6B63] text-[#262B22]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B4B49] mb-1">
                  Registro Somático (sensações no corpo durante a reflexão):
                </label>
                <input
                  type="text"
                  value={bodyAwareness}
                  onChange={(e) => setBodyAwareness(e.target.value)}
                  placeholder="Ex.: Tensão nos ombros, respiração mais profunda, alívio no estômago, calor no peito..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-paper border border-[#D8CFBE] focus:border-[#6B6B63] focus:outline-none placeholder:text-[#6B6B63] text-[#262B22]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDiaryForm(false)}
                  className="px-3 py-1.5 text-xs text-[#6B6B63] hover:text-[#262B22]"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-diary-entry"
                  type="submit"
                  disabled={isSavingDiary || !reflectionText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#4B4B49] hover:bg-[#262B22] text-paper text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isSavingDiary ? "Salvando..." : "Gravar no Diário"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};
