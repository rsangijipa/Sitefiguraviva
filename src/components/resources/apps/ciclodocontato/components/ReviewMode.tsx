import React from "react";
import { Bookmark, Compass, ArrowRight, Trash2 } from "lucide-react";
import { ContactStage } from "../types";

interface ReviewModeProps {
  stages: ContactStage[];
  savedStages: string[];
  onToggleSave: (slug: string) => void;
  onSelectStage: (slug: string) => void;
}

export function ReviewMode({
  stages,
  savedStages,
  onToggleSave,
  onSelectStage,
}: ReviewModeProps) {
  const savedItems = stages.filter((st) => savedStages.includes(st.slug));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96551F]">
          Modo Revisão
        </span>
        <h2 className="font-serif text-3xl font-bold text-[#262B22]">
          Conceitos e Etapas Guardadas
        </h2>
        <p className="mt-2 text-sm text-[#4B4B49]">
          Revise os momentos que você marcou durante sua travessia pelo Ciclo do
          Contato.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-10 text-center">
          <Bookmark
            className="mx-auto h-12 w-12 text-[#96551F]/40 mb-3"
            aria-hidden="true"
          />
          <p className="font-serif text-lg font-semibold text-[#262B22]">
            Nenhum item guardado ainda
          </p>
          <p className="mt-1 text-sm text-[#6B6B63] max-w-sm mx-auto">
            Ao explorar os momentos do ciclo ou o percurso guiado, clique em
            "Guardar" para marcá-los aqui para revisão posterior.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedItems.map((st) => (
            <div
              key={st.slug}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 transition hover:border-[#96551F]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
                  Momento {st.position}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#262B22] mt-1">
                  {st.label}
                </h3>
                <p className="text-sm text-[#4B4B49] mt-1 max-w-xl">
                  {st.shortDefinition}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => onSelectStage(st.slug)}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#005A1F] bg-[#005A1F] px-4 py-2 text-xs font-semibold text-[#FDFAF4] hover:bg-[#07614C]"
                >
                  <Compass size={14} aria-hidden="true" />
                  <span>Revisitar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleSave(st.slug)}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] px-3 py-2 text-xs font-semibold text-[#FE538B] hover:border-[#FE538B]"
                  title="Remover dos guardados"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
