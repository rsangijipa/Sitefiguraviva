import React from "react";
import { Volume2, VolumeX, Play, Pause, Settings2 } from "lucide-react";
import { AppSettings } from "../types";

interface HeaderProps {
  settings: AppSettings;
  isSpeaking: boolean;
  isPaused: boolean;
  onToggleAudio: () => void;
  onTogglePlayPauseNarration: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isSpeaking,
  isPaused,
  onToggleAudio,
  onTogglePlayPauseNarration,
  onOpenSettings,
}) => {
  return (
    <header
      id="app-header"
      className="w-full max-w-xl mx-auto px-5 py-4 flex items-center justify-between border-b border-[#E8E6DF]/80 select-none"
    >
      <div className="flex items-center gap-2.5">
        <span
          id="mode-badge"
          className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECEAE3] text-[#555E67] font-medium tracking-wide"
          title="Modo padrão: foco na percepção sem necessidade de escrever ou gravar objetos"
        >
          Sem registrar
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Play/Pause narration button when audio enabled */}
        {settings.audioEnabled && settings.voiceNarration && (
          <button
            id="narration-play-pause-btn"
            type="button"
            onClick={onTogglePlayPauseNarration}
            className="p-2 rounded-full text-[#434B54] hover:bg-[#EAE8E1] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2328]/30"
            aria-label={
              isSpeaking && !isPaused ? "Pausar narração" : "Ouvir instrução"
            }
            title={
              isSpeaking && !isPaused ? "Pausar narração" : "Ouvir instrução"
            }
          >
            {isSpeaking && !isPaused ? (
              <Pause className="w-4 h-4 text-[#1E2328]" />
            ) : (
              <Play className="w-4 h-4 text-[#1E2328]" />
            )}
          </button>
        )}

        {/* Master audio mute toggle */}
        <button
          id="audio-mute-btn"
          type="button"
          onClick={onToggleAudio}
          className="p-2 rounded-full text-[#434B54] hover:bg-[#EAE8E1] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2328]/30"
          aria-label={
            settings.audioEnabled ? "Desativar áudio" : "Ativar áudio"
          }
          title={
            settings.audioEnabled
              ? "Áudio ativado (clique para silenciar)"
              : "Áudio silenciado (clique para ativar)"
          }
        >
          {settings.audioEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#8C939B]" />
          )}
        </button>

        {/* Settings button */}
        <button
          id="settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-full text-[#434B54] hover:bg-[#EAE8E1] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2328]/30"
          aria-label="Configurações do exercício"
          title="Configurações"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
