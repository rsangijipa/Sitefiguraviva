import React, { useEffect, useState } from "react";
import {
  X,
  History,
  Clock,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { TelemetryRecord } from "../types";
import { fetchTelemetryHistory } from "../utils/telemetry";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<TelemetryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTelemetryHistory();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const formatDuration = (secs?: number) => {
    if (typeof secs !== "number") return "Em andamento";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181B]/40 backdrop-blur-[2px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div
        id="history-dialog"
        className="w-full max-w-md bg-[#FAF9F5] border border-[#DDD9CE] rounded-3xl p-6 shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#2C333A]" />
            <h2
              id="history-title"
              className="font-fraunces text-xl font-medium text-[#1E2328]"
            >
              Registros da Prática
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={loadData}
              className="p-1.5 rounded-full text-[#676F79] hover:text-[#1E2328] hover:bg-[#EAE7DE] transition-colors focus:outline-none"
              aria-label="Atualizar registros"
              title="Atualizar"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#676F79] hover:text-[#1E2328] hover:bg-[#EAE7DE] transition-colors focus:outline-none"
              aria-label="Fechar histórico"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy reassurance */}
        <div className="p-3 rounded-2xl bg-[#EFECE4] border border-[#D9D5CB] text-xs text-[#545C66] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#3D454E] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Conforme o padrão ético do recurso, são gravados unicamente os
            instantes de início, conclusão e tempo total. Nenhum objeto ou
            detalhe pessoal é salvo.
          </p>
        </div>

        {/* Session List */}
        <div className="flex flex-col gap-2.5 min-h-[160px]">
          {loading ? (
            <div className="flex items-center justify-center my-auto py-8 text-sm text-[#737B85]">
              Carregando registros...
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto py-8 text-center text-[#737B85]">
              <Clock className="w-8 h-8 text-[#A6ADB6] mb-2 stroke-[1.5]" />
              <p className="font-karla text-sm font-medium text-[#373F47]">
                Nenhum registro ainda
              </p>
              <p className="font-karla text-xs text-[#6F7680] mt-1 max-w-xs">
                Ao iniciar e concluir um exercício de ancoragem, o início, a
                conclusão e a duração aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((rec) => {
                const isComplete = !!rec.resource_completed;
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-[#F0EFEB] border border-[#DDD9CE] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-[#44505E] flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#8C939E] flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-[#1F252C]">
                          {formatDate(rec.resource_started)}
                        </div>
                        <div className="text-[#646B75] mt-0.5">
                          {isComplete ? "Concluído com sucesso" : "Iniciado"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-semibold font-mono text-[#232A32] bg-[#E5E2D8] px-2 py-0.5 rounded">
                        {formatDuration(rec.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8E5DC] pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-karla text-sm font-medium text-[#373F47] hover:bg-[#EAE7DE] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
