"use client";

import type { PausePracticeConfig } from "../types";
import { RotateCcw } from "lucide-react";

interface PauseStageProps {
  practice: PausePracticeConfig;
  contentComponent: React.ReactNode;
  onSwitch(): void;
}

export function PauseStage({
  practice,
  contentComponent,
  onSwitch,
}: PauseStageProps) {
  const Icon = practice.iconComponent;

  return (
    <div className="mx-auto w-full max-w-[800px] px-4">
      <div className="relative flex items-start justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-areia text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-2xl text-primary sm:text-3xl">
              {practice.title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitch}
          className="resource-action resource-action--secondary inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Trocar prática
        </button>
      </div>

      <div className="rounded-[24px] border border-border/40 bg-paper p-6 sm:p-10">
        {contentComponent}
      </div>
    </div>
  );
}
