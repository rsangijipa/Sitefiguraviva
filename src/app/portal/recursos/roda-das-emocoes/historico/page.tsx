"use client";

import React, { useEffect, useState } from "react";
import { EmotionRecord } from "@/features/interactive-resources/emotion-wheel/types";
import {
  listEmotionRecords,
  deleteEmotionRecord,
} from "@/features/interactive-resources/emotion-wheel/repository";
import { Calendar, Trash2, Download, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EmotionHistorySubroutePage() {
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listEmotionRecords();
      setRecords(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEmotionRecord(id);
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 bg-[#FDFAF4] min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b border-[#D8CFBE]">
        <Link
          href="/portal/recursos/roda-das-emocoes"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#005A1F] hover:underline min-h-[44px]"
        >
          <ArrowLeft size={18} /> Voltar à Roda das Emoções
        </Link>
      </div>

      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#07614C]">
          <Sparkles size={14} aria-hidden="true" /> Histórico privado
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#005A1F]">
          Histórico da Roda das Emoções
        </h1>
        <p className="text-sm text-[#6B6B63]">
          Este registro fica no seu histórico privado. Professores e outros
          alunos não têm acesso por esta ferramenta.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-stone-500 py-12">
          Carregando histórico...
        </p>
      ) : records.length === 0 ? (
        <div className="p-12 text-center bg-[#F1E9DB]/50 rounded-3xl border border-[#D8CFBE] space-y-4">
          <p className="text-[#6B6B63]">
            Você ainda não guardou registros aqui.
          </p>
          <Link
            href="/portal/recursos/roda-das-emocoes"
            className="inline-block px-6 py-3 bg-[#005A1F] text-white rounded-xl text-xs font-bold"
          >
            Fazer um registro agora
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((rec) => {
            const dateStr = new Date(rec.created_at).toLocaleDateString(
              "pt-BR",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const payload = rec.payload;

            return (
              <div
                key={rec.id}
                className="bg-white border border-[#D8CFBE] rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs text-[#6B6B63]">
                    <Calendar size={14} /> {dateStr}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(rec.id)}
                    className="p-2 text-[#6B6B63] hover:text-red-600 rounded-lg hover:bg-red-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                    aria-label="Excluir registro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {payload.status === "unsure" ? (
                  <p className="italic text-[#262B22] font-serif">
                    “Ainda não sei nomear neste momento.”
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {payload.entries?.map((entry, eIdx) => (
                      <div
                        key={eIdx}
                        className="px-3.5 py-1.5 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE] text-xs font-medium text-[#262B22] flex items-center gap-2"
                      >
                        <span className="font-bold text-[#005A1F]">
                          {entry.labelSnapshot}
                        </span>
                        <span className="text-[#6B6B63]">
                          {entry.intensity
                            ? `• Intensidade: ${entry.intensity}/5`
                            : "• Intensidade não informada"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {payload.note && (
                  <div className="p-3 bg-[#FDFAF4] rounded-xl border border-[#D8CFBE]/60 text-sm text-[#262B22] italic">
                    “{payload.note}”
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
