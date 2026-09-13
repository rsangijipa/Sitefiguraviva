import React from "react";
import {
  Pause,
  Play,
  ArrowRightLeft,
  CheckCircle2,
  Bookmark,
  Trash2,
} from "lucide-react";

interface SessionControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onSwitchChair: () => void;
  onEndSession: () => void;
  onSaveSession: () => void;
  onRequestDelete: () => void;
  hasTurns: boolean;
  activeChair: "A" | "B";
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isPaused,
  onTogglePause,
  onSwitchChair,
  onEndSession,
  onSaveSession,
  onRequestDelete,
  hasTurns,
  activeChair,
}) => {
  return (
    <div
      id="session-controls-bar"
      className="w-full max-w-2xl mx-auto bg-stone-100/90 border border-stone-200/80 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 shadow-2xs"
    >
      {/* Primary Interaction Controls */}
      <div className="flex items-center gap-1.5">
        {/* Trocar Cadeira */}
        <button
          type="button"
          id="btn-control-switch-chair"
          onClick={onSwitchChair}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200/90 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
          title="Mudar para a outra perspectiva"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-stone-600" />
          <span>
            Trocar Cadeira ({activeChair === "A" ? "Ir para B" : "Ir para A"})
          </span>
        </button>

        {/* Pausar / Retomar */}
        <button
          type="button"
          id="btn-control-pause-session"
          onClick={onTogglePause}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs cursor-pointer active:scale-95 ${
            isPaused
              ? "bg-amber-600 border-amber-700 text-white hover:bg-amber-700"
              : "bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          }`}
          title={
            isPaused ? "Retomar escrita" : "Pausar para respirar e observar"
          }
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Retomar</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pausar</span>
            </>
          )}
        </button>
      </div>

      {/* Session Lifecycle Controls */}
      <div className="flex items-center gap-1.5">
        {/* Salvar Reflexão */}
        <button
          type="button"
          id="btn-control-save-session"
          onClick={onSaveSession}
          disabled={!hasTurns}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs ${
            hasTurns
              ? "bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer active:scale-95"
              : "bg-stone-100 border-stone-200/50 text-stone-400 cursor-not-allowed"
          }`}
          title="Salvar reflexão na memória privada deste navegador"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Salvar Reflexão</span>
        </button>

        {/* Encerrar */}
        <button
          type="button"
          id="btn-control-end-session"
          onClick={onEndSession}
          disabled={!hasTurns}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-2xs ${
            hasTurns
              ? "bg-stone-900 border-stone-900 text-stone-50 hover:bg-stone-800 cursor-pointer active:scale-95"
              : "bg-stone-200 border-stone-200 text-stone-400 cursor-not-allowed"
          }`}
          title="Finalizar diálogo e abrir síntese"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Encerrar</span>
        </button>

        {/* Apagar Sessão */}
        <button
          type="button"
          id="btn-control-delete-session"
          onClick={onRequestDelete}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent text-xs font-medium text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
          title="Excluir sessão atual permanentemente"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Apagar Sessão</span>
        </button>
      </div>
    </div>
  );
};
