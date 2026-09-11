import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  Check,
  Compass,
  Feather,
  HeartHandshake,
  Info,
  Sparkles,
  Wind,
  Layers,
} from "lucide-react";
import {
  EmotionFamily,
  RelatedEmotion,
  EmotionNuance,
  DiaryEntry,
} from "../types";
import { SOMATIC_REGIONS, INTENSITY_LEVELS } from "../data/emotions";

interface ExplorationPanelProps {
  selectedFamily: EmotionFamily | null;
  selectedEmotion: RelatedEmotion | null;
  selectedNuance: EmotionNuance | null;
  customMode: boolean;
  customLabel: string;
  onCustomLabelChange: (val: string) => void;
  onExitCustomMode: () => void;
  onEnterCustomMode: () => void;
  onSaveToDiary: (payload: Omit<DiaryEntry, "id" | "created_at">) => void;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({
  selectedFamily,
  selectedEmotion,
  selectedNuance,
  customMode,
  customLabel,
  onCustomLabelChange,
  onExitCustomMode,
  onEnterCustomMode,
  onSaveToDiary,
}) => {
  const [bodyLocation, setBodyLocation] = useState<string>("");
  const [bodyNote, setBodyNote] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(3);
  const [reflection, setReflection] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Active label
  const activeLabel = customMode
    ? customLabel || "Sensação não rotulada"
    : selectedNuance?.label ||
      selectedEmotion?.label ||
      selectedFamily?.name ||
      "";

  const activeFamilyName =
    selectedFamily?.name || (customMode ? "Livre / Espontânea" : "");

  // Reset or initialize state when active selection changes
  useEffect(() => {
    setSavedSuccess(false);
  }, [selectedFamily?.id, selectedEmotion?.id, selectedNuance?.id, customMode]);

  // Handle saving
  const handleSave = () => {
    const intensityObj = INTENSITY_LEVELS.find((l) => l.value === intensity);

    const payload: Omit<DiaryEntry, "id" | "created_at"> = {
      emotion_family: activeFamilyName || "Exploração Livre",
      emotion_label: customMode
        ? customLabel.trim() || "Expressão livre"
        : activeLabel,
      custom_label:
        customMode && customLabel.trim() ? customLabel.trim() : undefined,
      intensity,
      intensity_label: intensityObj?.label,
      body_location: bodyLocation || undefined,
      body_note: bodyNote.trim() || undefined,
      reflection: reflection.trim() || undefined,
    };

    onSaveToDiary(payload);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  // Phenomenological description
  const description = selectedNuance
    ? selectedNuance.description
    : selectedEmotion
      ? selectedEmotion.description
      : selectedFamily
        ? selectedFamily.description
        : "";

  const somaticTendency = selectedNuance
    ? selectedNuance.somaticTendency
    : selectedEmotion
      ? selectedEmotion.somaticTendency
      : null;

  const hasSelection = Boolean(
    selectedFamily || selectedEmotion || selectedNuance || customMode,
  );

  return (
    <div
      className="bg-[#FAF8F5] border border-[#E3D8CA] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between min-h-[540px] text-[#2C2723]"
      id="exploration-panel"
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E9DFD2]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFE8DC] border border-[#DDD0C0] flex items-center justify-center text-[#735A47]">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#827468]">
                Espaço de Percepção
              </h2>
              <p className="text-[11px] text-[#A39689]">
                Exploração fenomenológica, não diagnóstica
              </p>
            </div>
          </div>

          {!customMode ? (
            <button
              type="button"
              id="btn-panel-custom-mode"
              onClick={onEnterCustomMode}
              className="text-xs text-[#6E5D50] hover:text-[#26201B] px-2.5 py-1 rounded-md bg-[#F2ECE3] hover:bg-[#E8DFC8] border border-[#DDD1C3] transition-colors"
            >
              Não encontrei palavra
            </button>
          ) : (
            <button
              type="button"
              id="btn-panel-exit-custom"
              onClick={onExitCustomMode}
              className="text-xs text-[#6E5D50] hover:text-[#26201B] px-2.5 py-1 rounded-md bg-[#F2ECE3] hover:bg-[#E8DFC8] border border-[#DDD1C3] transition-colors"
            >
              Voltar à roda
            </button>
          )}
        </div>

        {/* IF NOTHING SELECTED YET AND NOT IN CUSTOM MODE */}
        {!hasSelection && (
          <div
            className="py-8 px-4 text-center max-w-md mx-auto"
            id="panel-empty-state"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#EFE8DC] border border-[#DDD1C0] flex items-center justify-center text-[#826A55]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-medium text-[#2C2723] mb-2">
              Acolha o que está presente
            </h3>
            <p className="text-xs leading-relaxed text-[#6E645B] mb-5">
              Esta roda é um instrumento de ampliação do vocabulário interior.
              Não há estados certos ou errados, positivos ou negativos. Apenas
              nuances de uma experiência viva.
            </p>

            <div className="bg-[#F3EDE3] border border-[#E4D7C8] rounded-xl p-3.5 text-left text-xs text-[#524941] space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E5DCD0] flex items-center justify-center text-[10px] font-bold text-[#695B4F] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Toque em uma família no anel interno para abrir seu campo.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E5DCD0] flex items-center justify-center text-[10px] font-bold text-[#695B4F] shrink-0 mt-0.5">
                  2
                </span>
                <span>Toque na emoção relacionada no anel médio.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E5DCD0] flex items-center justify-center text-[10px] font-bold text-[#695B4F] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Escolha uma nuance no anel externo para afinar a percepção.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnterCustomMode}
              className="inline-flex items-center gap-1.5 text-xs text-[#735A47] hover:text-[#2C2723] font-medium underline underline-offset-4 decoration-[#D1C2AF]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Prefere descrever com suas próprias palavras?
            </button>
          </div>
        )}

        {/* ACTIVE SELECTION OR CUSTOM MODE */}
        {hasSelection && (
          <div className="space-y-5" id="panel-content-area">
            {/* Tag & Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {selectedFamily && (
                  <span
                    className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: selectedFamily.accent.bg,
                      color: selectedFamily.accent.text,
                      border: `1px solid ${selectedFamily.accent.border}`,
                    }}
                  >
                    Família: {selectedFamily.name}
                  </span>
                )}
                {selectedEmotion && (
                  <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EFE7DC] text-[#453A31] border border-[#D5C7B6]">
                    Emoção: {selectedEmotion.label}
                  </span>
                )}
                {selectedNuance && (
                  <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E5DDD1] text-[#29221C] border border-[#BAAB9A]">
                    Nuance
                  </span>
                )}
                {customMode && (
                  <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EDE4D8] text-[#544336] border border-[#CFBFAD]">
                    Expressão livre
                  </span>
                )}
              </div>

              {!customMode ? (
                <h3 className="font-display text-2xl font-medium text-[#241E1A] tracking-tight">
                  {activeLabel}
                </h3>
              ) : (
                <div className="mt-1">
                  <label
                    htmlFor="custom-label-input"
                    className="block text-xs font-semibold text-[#544B43] mb-1"
                  >
                    Como você descreveria essa sensação com suas próprias
                    palavras?
                  </label>
                  <input
                    id="custom-label-input"
                    type="text"
                    value={customLabel}
                    onChange={(e) => onCustomLabelChange(e.target.value)}
                    placeholder="Ex: uma névoa calma, vento abrindo janelas, recolher as asas..."
                    className="w-full text-base font-display px-3 py-2 bg-[#FFFFFF] border border-[#D2C5B5] rounded-lg text-[#26201B] placeholder-[#9E9083] focus:outline-none focus:border-[#38312B] focus:ring-1 focus:ring-[#38312B]"
                  />
                </div>
              )}
            </div>

            {/* Phenomenological description (without pathologizing) */}
            {!customMode && description && (
              <div
                className="bg-[#F4EEE5] border-l-3 border-[#947864] p-3 rounded-r-lg text-xs leading-relaxed text-[#4A423B]"
                id="phenomenological-description-box"
              >
                <div className="font-medium text-[11px] uppercase tracking-wider text-[#7A6A5C] mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  Descrição Fenomenológica
                </div>
                <p className="italic text-[#383029]">“{description}”</p>
                {somaticTendency && (
                  <div className="mt-2 pt-2 border-t border-[#E5DCD1] text-[11px] text-[#63574D]">
                    <span className="font-semibold text-[#4F443B]">
                      Ressonância no corpo:{" "}
                    </span>
                    {somaticTendency}
                  </div>
                )}
              </div>
            )}

            {/* INQUIRY 1: “Onde você percebe isso agora?” */}
            <div className="space-y-2" id="inquiry-body-location">
              <label className="block text-xs font-semibold text-[#3D352F]">
                1. Onde você percebe isso agora?
              </label>

              {/* Quick somatic regions */}
              <div className="flex flex-wrap gap-1.5">
                {SOMATIC_REGIONS.map((region) => {
                  const isSelected = bodyLocation === region.label;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() =>
                        setBodyLocation(isSelected ? "" : region.label)
                      }
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        isSelected
                          ? "bg-[#E3D9CB] border-[#2B2520] text-[#1E1916] font-semibold shadow-xs"
                          : "bg-[#F2EBE1] hover:bg-[#E8DFD3] border-[#DDD1C3] text-[#544A41]"
                      }`}
                      title={region.description}
                    >
                      {region.label}
                    </button>
                  );
                })}
              </div>

              {/* Somatic details note */}
              <input
                type="text"
                value={bodyNote}
                onChange={(e) => setBodyNote(e.target.value)}
                placeholder="Descreva a sensação física (ex: aperto morno, arrepio leve, expansão, formigamento...)"
                className="w-full text-xs px-3 py-2 bg-[#FFFFFF] border border-[#D5C8B8] rounded-lg text-[#26201B] placeholder-[#9E9083] focus:outline-none focus:border-[#38312B]"
              />
            </div>

            {/* INQUIRY 2: “Qual intensidade dessa experiência?” */}
            <div className="space-y-1.5" id="inquiry-intensity">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#3D352F]">
                  2. Qual a intensidade dessa experiência?
                </label>
                <span className="text-xs font-medium text-[#7A6A5C]">
                  {INTENSITY_LEVELS.find((l) => l.value === intensity)?.label}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {INTENSITY_LEVELS.map((level) => {
                  const isSelected = intensity === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setIntensity(level.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? "bg-[#E3D8CA] border-[#29221D] text-[#1F1916] font-semibold ring-1 ring-[#29221D]"
                          : "bg-[#F3ECE2] hover:bg-[#EAE1D4] border-[#DCD0C2] text-[#544B43]"
                      }`}
                    >
                      <span className="text-xs font-bold">{level.value}</span>
                      <span className="text-[10px] leading-tight truncate w-full mt-0.5">
                        {level.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#7E7166] italic">
                {
                  INTENSITY_LEVELS.find((l) => l.value === intensity)
                    ?.description
                }
              </p>
            </div>

            {/* INQUIRY 3: “O que chama sua atenção quando você fica com isso por alguns instantes?” */}
            <div className="space-y-1.5" id="inquiry-reflection">
              <label
                htmlFor="reflection-textarea"
                className="block text-xs font-semibold text-[#3D352F]"
              >
                3. O que chama sua atenção quando você fica com isso por alguns
                instantes?
              </label>
              <textarea
                id="reflection-textarea"
                rows={3}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Sem pressa de resolver ou justificar, apenas observe o que se desenrola na consciência..."
                className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#D5C8B8] rounded-lg text-[#26201B] placeholder-[#9E9083] focus:outline-none focus:border-[#38312B] resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS: Save to Diary */}
      {hasSelection && (
        <div className="pt-4 mt-4 border-t border-[#E6DCD0]" id="panel-footer">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-[#786D63]">
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1 text-[#3B6636] font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Percepção guardada no seu diário!
                </span>
              ) : (
                <span>Somente você tem acesso às anotações deste diário.</span>
              )}
            </div>

            <button
              type="button"
              id="btn-save-diary"
              onClick={handleSave}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-[#26201B] ${
                savedSuccess
                  ? "bg-[#55784E] text-white"
                  : "bg-[#2E2824] hover:bg-[#1E1916] text-[#FAF7F2] shadow-xs"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardado com sucesso</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Guardar no meu diário</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
