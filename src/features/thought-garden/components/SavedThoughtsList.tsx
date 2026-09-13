"use client";

import { useState } from "react";
import type { SavedThoughtRecord } from "../types";

interface SavedThoughtsListProps {
  thoughts: SavedThoughtRecord[];
  onEdit?: (thought: SavedThoughtRecord) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function SavedThoughtsList({
  thoughts,
  onEdit,
  onDelete,
  emptyMessage = "Voc\u00ea ainda n\u00e3o guardou registros aqui.",
  loading = false,
}: SavedThoughtsListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-[#F1E9DB] animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (thoughts.length === 0 && !loading) {
    return (
      <div role="status" className="text-center py-8">
        <p className="font-serif text-base italic text-[#005A1F]/55">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-serif text-lg font-bold text-[#005A1F]">
        Pensamentos guardados ({thoughts.length})
      </h3>
      {thoughts.map((thought) => (
        <div
          key={thought.id}
          className="rounded-xl border border-[#D8CFBE] bg-white p-4 space-y-2"
        >
          <p className="font-serif text-sm text-[#262B22] leading-relaxed">
            {thought.thought_text}
          </p>
          {thought.optional_title && (
            <p className="text-xs text-[#6B6B63]">{thought.optional_title}</p>
          )}
          <div className="flex items-center gap-3 pt-1 border-t border-[#D8CFBE]/50">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(thought)}
                className="text-xs font-bold text-[#005A1F] underline min-h-[44px] inline-flex items-center"
              >
                Editar
              </button>
            )}
            {!confirmDeleteId ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(thought.id)}
                className="text-xs font-bold text-red-600 underline min-h-[44px] inline-flex items-center"
              >
                Excluir do hist\u00f3rico
              </button>
            ) : confirmDeleteId === thought.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B63]">
                  Confirmar exclus\u00e3o?
                </span>
                <button
                  type="button"
                  onClick={() => onDelete?.(thought.id)}
                  className="text-xs font-bold text-red-600 underline min-h-[44px] inline-flex items-center"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs font-bold text-[#6B6B63] underline min-h-[44px] inline-flex items-center"
                >
                  N\u00e3o
                </button>
              </div>
            ) : null}
            <span className="text-xs text-[#6B6B63] ml-auto">
              {new Date(thought.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
