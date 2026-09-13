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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DDD1]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#E7E2D7] text-[#554C40] border border-[#DDD5C7]">
            {vignette.category}
          </span>
          <button
            onClick={onOpenCatalog}
            className="text-xs text-[#7A7163] hover:text-[#2E2922] underline underline-offset-2"
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
            className="p-1.5 rounded-lg border border-[#DDD5C7] text-[#635A4D] hover:bg-[#EAE4D9] transition-colors"
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs text-[#635A4D] hover:bg-[#EAE4D9] transition-colors"
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
            className="p-1.5 rounded-lg border border-[#DDD5C7] text-[#635A4D] hover:bg-[#EAE4D9] transition-colors"
            title="Próxima vinheta"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Narrative Card: Contexto & Situação */}
      <section
        id="vignette-scenario-card"
        className="bg-white rounded-2xl border border-[#E3DDD1] p-6 sm:p-7 shadow-xs"
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#877D6D]">
              Contexto Relacional
            </span>
            <p className="text-sm sm:text-base text-[#4C453B] leading-relaxed mt-1">
              {vignette.context}
            </p>
          </div>

          <div className="pt-3 border-t border-[#F0EBE1]">
            <h2 className="font-serif text-xl sm:text-2xl text-[#24211D] font-normal tracking-tight">
              {vignette.title}
            </h2>
            <div className="mt-2 text-sm sm:text-base text-[#2E2A25] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE5D9]">
              <strong className="font-medium text-[#786653] block text-xs uppercase tracking-wide mb-1">
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
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[#736A5B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8A735E]" />
            Campo Relacional Interativo
          </h3>
          <button
            onClick={() => setInteractiveMode(!interactiveMode)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              interactiveMode
                ? "bg-[#E5DFD4] text-[#3B342A] border-[#CDC4B6]"
                : "bg-transparent text-[#7B7163] border-[#E3DDD1] hover:bg-[#EDE8DE]"
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
            <h3 className="font-serif text-lg text-[#26231F] font-normal">
              3 Maneiras de Responder
            </h3>
            <p className="text-xs text-[#736A5B]">
              Selecione uma atitude relacional para observar como o campo e as
              fronteiras se reorganizam.
            </p>
          </div>
          {selectedResponse && (
            <button
              onClick={handleResetChoice}
              className="text-xs text-[#827768] hover:text-[#2B2721] underline underline-offset-2"
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
                ? "bg-[#F2E8E1] text-[#7A4E38] border-[#E2D2C5]"
                : resp.movementType === "withdrawal"
                  ? "bg-[#E8EDEA] text-[#3D5C53] border-[#D1DDD8]"
                  : "bg-[#EDEBE4] text-[#555045] border-[#DDD8CD]";

            return (
              <button
                key={resp.id}
                id={`response-card-${resp.id}`}
                onClick={() => handleSelectResponse(resp)}
                className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-[#FAF8F4] border-[#8C7661] ring-2 ring-[#8C7661]/20 shadow-sm"
                    : "bg-white border-[#E4DDD1] hover:border-[#CFC5B4] hover:bg-[#FDFBF7]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#EAE4D9] text-[#4E4639] font-mono text-xs flex items-center justify-center font-semibold">
                      {letter}
                    </span>
                    <span
                      className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${movementBadgeColor}`}
                    >
                      {resp.relationalMovementLabel.split("/")[0].trim()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#2E2A24] leading-relaxed">
                    {resp.actionText}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#EFE9DF] flex items-center justify-between text-[11px] text-[#786E61]">
                  <span>{resp.fieldDynamic.label}</span>
                  <span className="font-medium text-[#50473A]">
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
            className="bg-white rounded-2xl border border-[#E1D9CC] p-5 sm:p-7 shadow-xs space-y-5"
          >
            {/* Header: Selected Movement & Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE7DC]">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8A7D6C]">
                  Análise do Movimento Selecionado
                </span>
                <h4 className="font-serif text-lg text-[#25211D] font-normal mt-0.5">
                  {selectedResponse.relationalMovementLabel}
                </h4>
              </div>

              {/* Institute objective check badge */}
              <div>
                {!selectedResponse.instituteAnalysis.hasObjectiveAnswer ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#F4EFE6] text-[#695D4D] border border-[#DDD4C5]">
                    <Info className="w-3.5 h-3.5 text-[#8A7A66]" />
                    Situação Ambígua (Sem resposta única pré-fabricada)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#EAF2ED] text-[#2C5946] border border-[#CDE0D4]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D7A5E]" />
                    Referência Didática do Instituto
                  </span>
                )}
              </div>
            </div>

            {/* Tabs for separating "Possíveis Leituras" from "Conteúdo Didático do Instituto" */}
            <div className="flex items-center gap-2 border-b border-[#EDE7DC] pb-2">
              <button
                id="tab-readings"
                onClick={() => setActiveAnalysisTab("readings")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeAnalysisTab === "readings"
                    ? "bg-[#EFEAE1] text-[#2B2620] border border-[#DDD5C7]"
                    : "text-[#736B5E] hover:text-[#2B2620]"
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
                    ? "bg-[#EFEAE1] text-[#2B2620] border border-[#DDD5C7]"
                    : "text-[#736B5E] hover:text-[#2B2620]"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Conteúdo Teórico do Instituto</span>
              </button>
            </div>

            {/* Tab 1: Possíveis Leituras */}
            {activeAnalysisTab === "readings" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-[#6F6658]">
                  Em situações relacionais complexas, nenhum movimento é
                  puramente "certo" ou "errado". Cada escolha revela diferentes
                  intenções de autopreservação, conexão ou acomodação:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedResponse.possibleReadings.map((reading, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D7] text-xs text-[#3D372E] leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8E7964] mt-1.5 shrink-0" />
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
                  <div className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#EDE6D9] text-[#4F4537] border border-[#DDD3C2]">
                    Conceito Teórico:{" "}
                    {selectedResponse.instituteAnalysis.conceptName}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#F6F3EC] border border-[#E3D9C9] text-sm text-[#2E2820] leading-relaxed">
                  {selectedResponse.instituteAnalysis.objectiveAnswerNote && (
                    <div className="mb-2 font-medium text-xs text-[#3F6352] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3F6352]" />
                      {selectedResponse.instituteAnalysis.objectiveAnswerNote}
                    </div>
                  )}
                  <p>
                    {selectedResponse.instituteAnalysis.didacticExplanation}
                  </p>
                </div>

                {vignette.instituteCoreLesson && (
                  <p className="text-xs text-[#6B6153] italic pl-2 border-l-2 border-[#8E7964]">
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
        className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE2] rounded-2xl border border-[#E0D7C9] p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#E4DDD0] text-[#554C3E] shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7F7363]">
              Pergunta Reflexiva para Consciência de Fronteira
            </span>
            <p className="font-serif text-base sm:text-lg text-[#24201B] font-normal leading-relaxed mt-1">
              "{vignette.reflectiveQuestion}"
            </p>
          </div>
        </div>

        {/* Action to open reflection diary form */}
        <div className="pt-3 border-t border-[#E3DACB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#6B6153]">
            Sua escolha de resposta é passageira e não foi salva. Deseja
            registrar suas impressões no Diário de Contato?
          </p>

          <button
            id="btn-toggle-diary-form"
            onClick={() => setShowDiaryForm(!showDiaryForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#39342D] text-[#FAF7F2] hover:bg-[#28241F] text-xs font-medium transition-colors shadow-xs self-start sm:self-auto shrink-0"
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
              className="p-3 bg-[#EAF3EE] border border-[#CDE0D4] rounded-xl text-xs text-[#2A5943] flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#357555]" />
                Reflexão salva com sucesso no seu Diário de Contato pessoal!
              </span>
              <button
                onClick={onOpenDiary}
                className="underline underline-offset-2 font-medium hover:text-[#183B2B]"
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
                <div className="p-2.5 rounded-lg bg-[#EFEAE0] text-[11px] text-[#554D41] flex items-center justify-between">
                  <span>
                    Associando à atitude experimentada:{" "}
                    <strong>{selectedResponse.relationalMovementLabel}</strong>
                  </span>
                  <span className="text-[10px] text-[#7A7163]">(opcional)</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#484033] mb-1">
                  Sua Reflexão Pessoal:
                </label>
                <textarea
                  required
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Como esta dinâmica reverbera na sua história de vida? Qual limite você gostaria de expressar de forma mais consciente?"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white border border-[#D5CCBC] focus:border-[#7A6B59] focus:outline-none placeholder:text-[#A19788] text-[#292520]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#484033] mb-1">
                  Registro Somático (sensações no corpo durante a reflexão):
                </label>
                <input
                  type="text"
                  value={bodyAwareness}
                  onChange={(e) => setBodyAwareness(e.target.value)}
                  placeholder="Ex.: Tensão nos ombros, respiração mais profunda, alívio no estômago, calor no peito..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-white border border-[#D5CCBC] focus:border-[#7A6B59] focus:outline-none placeholder:text-[#A19788] text-[#292520]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDiaryForm(false)}
                  className="px-3 py-1.5 text-xs text-[#73695A] hover:text-[#292520]"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-diary-entry"
                  type="submit"
                  disabled={isSavingDiary || !reflectionText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#4A4035] hover:bg-[#383027] text-white text-xs font-medium transition-colors disabled:opacity-50"
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
