"use client";

import type { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";

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
    <div className="flex min-h-14 w-full items-center gap-3 px-3 sm:px-5 py-2 border-b border-primary/10 bg-paper">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-primary/15 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary transition hover:border-terra hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={`Voltar para ${backLabel}`}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{backLabel}</span>
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
      <button
        type="button"
        onClick={onBack}
        className="ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-primary transition hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label="Fechar recurso"
      >
        <X size={20} aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
