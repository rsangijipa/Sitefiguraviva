"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export interface ResourceNavigationProps {
  title: string;
  category?: string;
  backLabel?: string;
  onBack: () => void;
  children?: ReactNode;
}

export function ResourceNavigation({
  title,
  category,
  backLabel = "Recursos",
  onBack,
  children,
}: ResourceNavigationProps) {
  return (
    <div className="flex w-full items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-primary/10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-primary/15 bg-white/85 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm transition hover:border-terra hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={`Voltar para ${backLabel}`}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>{backLabel}</span>
      </button>
      <div className="min-w-0">
        {category && (
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-terra">
            {category}
          </span>
        )}
        <h1 className="truncate font-serif text-xl font-medium text-primary sm:text-2xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
