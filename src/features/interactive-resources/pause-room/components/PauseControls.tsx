"use client";

import { Pause, Play, RotateCcw, LogOut } from "lucide-react";

interface PauseControlsProps {
  isPaused: boolean;
  active: boolean;
  onTogglePause(): void;
  onSwitch(): void;
  onEnd(): void;
}

export function PauseControls({
  isPaused,
  active,
  onTogglePause,
  onSwitch,
  onEnd,
}: PauseControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
      <button
        type="button"
        onClick={onSwitch}
        className="resource-action resource-action--secondary inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border/80 px-5 py-2.5 text-sm font-semibold text-text transition hover:border-terra hover:bg-areia"
      >
        <RotateCcw size={16} aria-hidden="true" />
        Trocar prática
      </button>

      {active && !isPaused && (
        <button
          type="button"
          onClick={onTogglePause}
          className="resource-action inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-primary-dark"
        >
          <Pause size={16} aria-hidden="true" />
          Pausar
        </button>
      )}

      {active && isPaused && (
        <button
          type="button"
          onClick={onTogglePause}
          className="resource-action inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-igarape px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-igarape/90"
        >
          <Play size={16} aria-hidden="true" />
          Retomar
        </button>
      )}

      {!active && (
        <button
          type="button"
          onClick={onEnd}
          className="resource-action resource-action--secondary inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border/80 px-5 py-2.5 text-sm font-semibold text-text transition hover:border-terra hover:bg-areia"
        >
          <LogOut size={16} aria-hidden="true" />
          Voltar ao catálogo
        </button>
      )}

      {active && (
        <button
          type="button"
          onClick={onEnd}
          className="resource-action resource-action--secondary inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border/80 px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra"
        >
          <LogOut size={16} aria-hidden="true" />
          Encerrar
        </button>
      )}
    </div>
  );
}
