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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181B]/40 backdrop-blur-[2px] transition-opacity"
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
        className="w-full max-w-md bg-[#FAF9F5] border border-[#DDD9CE] rounded-3xl p-6 shadow-xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto [&_[role=switch]:focus-visible]:outline-none [&_[role=switch]:focus-visible]:ring-2 [&_[role=switch]:focus-visible]:ring-[#1E2328]/40 [&_[role=switch]:focus-visible]:ring-offset-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#2C333A]" />
            <h2
              id="settings-title"
              className="font-fraunces text-xl font-medium text-[#1E2328]"
            >
              Configurações
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#676F79] hover:text-[#1E2328] hover:bg-[#EAE7DE] transition-colors focus:outline-none"
            aria-label="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="flex flex-col gap-5">
          {/* Áudio */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#727983]">
              Áudio & Sons
            </span>

            {/* Master Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
              <div className="flex items-center gap-3">
                {settings.audioEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#242A31]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-[#888F98]" />
                )}
                <div>
                  <label
                    htmlFor="toggle-master-audio"
                    className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                  >
                    Áudio geral
                  </label>
                  <span className="font-karla text-xs text-[#636B75]">
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
                  settings.audioEnabled ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
                <div>
                  <label
                    htmlFor="toggle-voice"
                    className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                  >
                    Narração de voz
                  </label>
                  <span className="font-karla text-xs text-[#636B75]">
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
                    settings.voiceNarration ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
                <div>
                  <label
                    htmlFor="toggle-chime"
                    className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                  >
                    Sino meditativo ao tocar
                  </label>
                  <span className="font-karla text-xs text-[#636B75]">
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
                    settings.chimeSound ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
            <span className="text-xs uppercase tracking-widest font-semibold text-[#727983]">
              Ritmo & Controle
            </span>

            {/* Ritmo Livre */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
              <div>
                <label
                  htmlFor="toggle-free-rhythm"
                  className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                >
                  Ritmo livre
                </label>
                <span className="font-karla text-xs text-[#636B75]">
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
                  settings.freeRhythm ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
              <div>
                <label
                  htmlFor="toggle-manual-advance"
                  className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                >
                  Avanço manual
                </label>
                <span className="font-karla text-xs text-[#636B75]">
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
                  settings.manualAdvance ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
            <span className="text-xs uppercase tracking-widest font-semibold text-[#727983]">
              Modo & Acessibilidade
            </span>

            {/* Fazer sem registrar (Modo Padrão) */}
            <div className="p-3.5 rounded-2xl bg-[#ECEAE3] border border-[#D5D0C3]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2E363E]" />
                  <span className="font-karla text-sm font-semibold text-[#1F252C]">
                    “Fazer sem registrar” (Modo Padrão)
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#232A31] text-white">
                  Ativo
                </span>
              </div>
              <p className="font-karla text-xs text-[#59616B] leading-normal">
                Você foca diretamente no ambiente real ao redor. Nenhuma
                digitação nem listagem de objetos é solicitada.
              </p>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0EFEB] border border-[#DDD8CE]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#4D555F]" />
                <div>
                  <label
                    htmlFor="toggle-reduced-motion"
                    className="font-karla text-sm font-semibold text-[#1F252C] block cursor-pointer"
                  >
                    Movimento reduzido
                  </label>
                  <span className="font-karla text-xs text-[#636B75]">
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
                  settings.reducedMotion ? "bg-[#232A31]" : "bg-[#D1CDC3]"
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
          <div className="p-3.5 rounded-2xl bg-[#F4F3EF] border border-[#E0DCD2] text-xs text-[#5A636E] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3E454F] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#252C34]">Privacidade</p>
              <p className="leading-relaxed">
                Nenhum dado desta prática é armazenado ou enviado. As percepções
                permanecem exclusivamente no seu presente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8E5DC] pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-karla text-sm font-semibold bg-[#21272E] text-white hover:bg-[#15191E] transition-colors"
          >
            Salvar e fechar
          </button>
        </div>
      </div>
    </div>
  );
};
