"use client";

import type { PausePracticeConfig, PracticeId } from "../types";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface PauseChoiceGridProps {
  practices: PausePracticeConfig[];
  selectedId?: PracticeId;
  onSelect(id: PracticeId): void;
}

const cardVariants = cva(
  [
    "group relative flex flex-col gap-3 rounded-[24px] border p-5 text-left transition-all",
    "bg-paper border-border/60 hover:border-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
    "cursor-pointer min-h-[120px]",
  ],
  {
    variants: {
      isSelected: {
        true: ["border-primary bg-areia/60"],
        false: [],
      },
    },
  },
);

export function PauseChoiceGrid({
  practices,
  selectedId,
  onSelect,
}: PauseChoiceGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {practices.map((practice) => {
        const Icon = practice.iconComponent;
        const isSelected = selectedId === practice.id;

        return (
          <button
            key={practice.id}
            type="button"
            className={cardVariants({ isSelected })}
            onClick={() => onSelect(practice.id)}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-areia text-primary transition group-hover:border-terra/25",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="mt-1 block font-serif text-xl leading-tight text-primary">
              {practice.title}
            </span>
            <span className="block text-sm leading-relaxed text-text/70">
              {practice.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
