import React from "react";
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AppSettings } from "../types";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/40 -[2px] transition-opacity"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        ref={dialogRef}
        id="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        className="w-full max-w-md bg-[#FDFAF4] border border-[#D8CFBE] rounded-3xl p-6  flex flex-col gap-6 max-h-[90vh] overflow-y-auto [&_[role=switch]:focus-visible]:outline-none [&_[role=switch]:focus-visible]:ring-2 [&_[role=switch]:focus-visible]:ring-[#262B22]/40 [&_[role=switch]:focus-visible]:ring-offset-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1E9DB] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#262B22]" />
            <h2
              id="settings-title"
              className="font-fraunces text-xl font-medium text-[#262B22]"
            >
              Configurações
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] transition-colors focus:outline-none"
            aria-label="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="flex flex-col gap-5">
          {/* Áudio */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#6B6B63]">
              Áudio & Sons
            </span>

            {/* Master Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
              <div className="flex items-center gap-3">
                {settings.audioEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#262B22]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-[#6B6B63]" />
                )}
                <div>
                  <label
                    htmlFor="toggle-master-audio"
                    className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                  >
                    Áudio geral
                  </label>
                  <span className="font-karla text-xs text-[#6B6B63]">
                    {settings.audioEnabled
                      ? "Com áudio ativado"
                      : "Sem áudio (silencioso)"}
                  </span>
                </div>
              </div>
              <button
                id="toggle-master-audio"
                type="button"
                role="switch"
                aria-checked={settings.audioEnabled}
                onClick={() =>
                  onUpdateSettings({ audioEnabled: !settings.audioEnabled })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.audioEnabled ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.audioEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Voice Narration */}
            {settings.audioEnabled && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
                <div>
                  <label
                    htmlFor="toggle-voice"
                    className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                  >
                    Narração de voz
                  </label>
                  <span className="font-karla text-xs text-[#6B6B63]">
                    Lê as instruções de cada etapa em voz alta
                  </span>
                </div>
                <button
                  id="toggle-voice"
                  type="button"
                  role="switch"
                  aria-checked={settings.voiceNarration}
                  onClick={() =>
                    onUpdateSettings({
                      voiceNarration: !settings.voiceNarration,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.voiceNarration ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voiceNarration
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Chime Sound */}
            {settings.audioEnabled && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
                <div>
                  <label
                    htmlFor="toggle-chime"
                    className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                  >
                    Sino meditativo ao tocar
                  </label>
                  <span className="font-karla text-xs text-[#6B6B63]">
                    Som sutil e relaxante a cada percepção
                  </span>
                </div>
                <button
                  id="toggle-chime"
                  type="button"
                  role="switch"
                  aria-checked={settings.chimeSound}
                  onClick={() =>
                    onUpdateSettings({ chimeSound: !settings.chimeSound })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.chimeSound ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.chimeSound ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Ritmo & Navegação */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#6B6B63]">
              Ritmo & Controle
            </span>

            {/* Ritmo Livre */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
              <div>
                <label
                  htmlFor="toggle-free-rhythm"
                  className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                >
                  Ritmo livre
                </label>
                <span className="font-karla text-xs text-[#6B6B63]">
                  Sem contagem regressiva; você dita seu tempo
                </span>
              </div>
              <button
                id="toggle-free-rhythm"
                type="button"
                role="switch"
                aria-checked={settings.freeRhythm}
                onClick={() =>
                  onUpdateSettings({ freeRhythm: !settings.freeRhythm })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.freeRhythm ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.freeRhythm ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Avanço Manual */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
              <div>
                <label
                  htmlFor="toggle-manual-advance"
                  className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                >
                  Avanço manual
                </label>
                <span className="font-karla text-xs text-[#6B6B63]">
                  Avança apenas quando você clica em próximo
                </span>
              </div>
              <button
                id="toggle-manual-advance"
                type="button"
                role="switch"
                aria-checked={settings.manualAdvance}
                onClick={() =>
                  onUpdateSettings({ manualAdvance: !settings.manualAdvance })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.manualAdvance ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.manualAdvance ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modo & Movimento */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#6B6B63]">
              Modo & Acessibilidade
            </span>

            {/* Fazer sem registrar (Modo Padrão) */}
            <div className="p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#262B22]" />
                  <span className="font-karla text-sm font-semibold text-[#262B22]">
                    “Fazer sem registrar” (Modo Padrão)
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#262B22] text-paper">
                  Ativo
                </span>
              </div>
              <p className="font-karla text-xs text-[#6B6B63] leading-normal">
                Você foca diretamente no ambiente real ao redor. Nenhuma
                digitação nem listagem de objetos é solicitada.
              </p>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F1E9DB] border border-[#D8CFBE]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#4B4B49]" />
                <div>
                  <label
                    htmlFor="toggle-reduced-motion"
                    className="font-karla text-sm font-semibold text-[#262B22] block cursor-pointer"
                  >
                    Movimento reduzido
                  </label>
                  <span className="font-karla text-xs text-[#6B6B63]">
                    Remove pulsação e transições expansivas
                  </span>
                </div>
              </div>
              <button
                id="toggle-reduced-motion"
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                onClick={() =>
                  onUpdateSettings({ reducedMotion: !settings.reducedMotion })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.reducedMotion ? "bg-[#262B22]" : "bg-[#D8CFBE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Backend Transparency */}
          <div className="p-3.5 rounded-2xl bg-[#FDFAF4] border border-[#F1E9DB] text-xs text-[#6B6B63] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4B4B49] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#262B22]">Privacidade</p>
              <p className="leading-relaxed">
                Nenhum dado desta prática é armazenado ou enviado. As percepções
                permanecem exclusivamente no seu presente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#F1E9DB] pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-karla text-sm font-semibold bg-[#262B22] text-paper hover:bg-[#262B22] transition-colors"
          >
            Salvar e fechar
          </button>
        </div>
      </div>
    </div>
  );
};
