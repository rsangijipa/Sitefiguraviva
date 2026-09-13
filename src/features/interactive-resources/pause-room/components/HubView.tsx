"use client";

import type { PausePracticeConfig, PracticeId } from "../types";
import type { PauseSessionRecord } from "../types";
import { PauseChoiceGrid } from "./PauseChoiceGrid";
import { DurationPicker } from "./DurationPicker";
import { ChevronRight, Clock3, History } from "lucide-react";

interface HubViewProps {
  practices: PausePracticeConfig[];
  selectedDuration: number;
  selectedPracticeId?: PracticeId;
  onDurationChange(duration: number): void;
  onSelectPractice(id: PracticeId): void;
  onStart(practiceId: PracticeId, duration: number): void;
  previousSessions?: PauseSessionRecord[];
}

function formatDistanceAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

export function HubView({
  practices,
  selectedDuration,
  selectedPracticeId,
  onDurationChange,
  onSelectPractice,
  onStart,
  previousSessions,
}: HubViewProps) {
  const hasSelection = Boolean(selectedPracticeId);

  return (
    <div className="mx-auto w-full max-w-[800px] space-y-8 px-4 py-8">
      {/* Editorial Greeting */}
      <header className="text-center">
        <span className="fv-eyebrow">Regular</span>
        <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">
          Sala de Pausa
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text/70 sm:text-lg">
          Que tipo de pausa cabe agora? Escolha o apoio que faz sentido neste
          momento e respire com cuidado.
        </p>
      </header>

      {/* Recent Sessions */}
      {previousSessions && previousSessions.length > 0 && (
        <section aria-label="Pausas recentes" className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted">
            <History size={15} />
            Suas pausas recentes
          </div>
          <ul className="space-y-2">
            {previousSessions.slice(0, 3).map((session) => {
              const prac = practices.find((p) => p.id === session.practiceId);
              return (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-paper px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {prac && (
                      <prac.iconComponent className="h-4 w-4 text-terra" />
                    )}
                    <span className="font-medium text-text">
                      {prac?.title || session.practiceId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      {session.plannedDurationSeconds / 60}min
                    </span>
                    <span>{formatDistanceAgo(session.createdAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Duration Picker */}
      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="pause-duration"
          className="text-sm font-semibold text-text"
        >
          Quanto tempo você quer pausar?
        </label>
        <DurationPicker
          durations={[2, 3, 5]}
          value={selectedDuration}
          onChange={onDurationChange}
        />
      </div>

      {/* Choice Grid */}
      <PauseChoiceGrid
        practices={practices}
        selectedId={selectedPracticeId}
        onSelect={onSelectPractice}
      />

      {/* CTA */}
      <div className="flex flex-col items-center pt-4">
        <button
          type="button"
          onClick={() => {
            if (hasSelection && selectedPracticeId) {
              onStart(selectedPracticeId, selectedDuration);
            }
          }}
          disabled={!hasSelection}
          className="resource-action resource-action--secondary inline-flex min-h-[52px] items-center gap-3 rounded-full bg-primary px-10 py-3 text-base font-bold text-paper transition disabled:opacity-40 hover:bg-primary-dark hover:text-paper"
        >
          Entrar na sala
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        {!hasSelection && (
          <p className="mt-2 text-xs text-muted">
            Selecione uma prática acima para começar
          </p>
        )}
      </div>
    </div>
  );
}
