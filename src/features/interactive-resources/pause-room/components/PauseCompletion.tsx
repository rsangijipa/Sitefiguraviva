"use client";

import { PausePracticeConfig } from "../types";
import { Save, ArrowLeftFromLine } from "lucide-react";

interface PauseCompletionProps {
  practice: PausePracticeConfig;
  duration: number;
  activeDuration: number;
  endedBy: string;
  reflection: string;
  onReflectionChange(value: string): void;
  onSave(): void;
  onReturn(): void;
  saving?: boolean;
  error?: string | null;
}

export function PauseCompletion({
  practice,
  duration,
  activeDuration,
  endedBy,
  reflection,
  onReflectionChange,
  onSave,
  onReturn,
  saving,
  error,
}: PauseCompletionProps) {
  const maxChars = 500;
  const charCount = reflection.length;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 rounded-[24px] border border-border/60 bg-paper p-6 sm:p-10">
      <header className="text-center">
        <h2 className="font-serif text-3xl text-primary sm:text-4xl">
          Sua pausa pode terminar aqui.
        </h2>
        <p className="mt-2 text-sm text-muted">
          {practice.title} · {duration} minutos previstos ·{" "}
          {Math.round(activeDuration)} segundos ativos
        </p>
        <p className="mt-1 text-xs text-muted">
          Encerrada por:{" "}
          {endedBy === "timer"
            ? "tempo esgotado"
            : endedBy === "user"
              ? "você"
              : "troca de prática"}
        </p>
      </header>

      {error && (
        <div
          className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error"
          role="alert"
        >
          Não foi possível salvar. Seu registro continua nesta tela.
        </div>
      )}

      <div className="space-y-3">
        <label
          htmlFor="pause-reflection"
          className="block text-sm font-semibold text-text"
        >
          Como você percebeu esta pausa?
        </label>
        <textarea
          id="pause-reflection"
          rows={4}
          value={reflection}
          onChange={(e) => onReflectionChange(e.target.value)}
          maxLength={maxChars}
          placeholder="O que chamou sua atenção..."
          className="w-full resize-none rounded-xl border border-border/60 bg-paper px-4 py-3 text-sm leading-relaxed text-text placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-gold"
          aria-describedby="reflection-count"
        />
        <div
          id="reflection-count"
          className={`flex justify-end text-xs ${charCount >= maxChars ? "text-error" : "text-muted"}`}
        >
          {charCount}/{maxChars}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="resource-action flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper transition disabled:opacity-40 hover:bg-primary-dark"
        >
          <Save size={16} aria-hidden="true" />
          {saving ? "Salvando..." : "Salvar esta pausa"}
        </button>
        <button
          type="button"
          onClick={onReturn}
          className="resource-action resource-action--secondary flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/80 px-6 py-3 text-sm font-semibold text-text transition hover:border-terra hover:bg-areia"
        >
          <ArrowLeftFromLine size={16} aria-hidden="true" />
          Voltar ao catálogo
        </button>
      </div>
    </div>
  );
}
