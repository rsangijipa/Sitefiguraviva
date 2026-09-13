"use client";
import type { ObservationRecord } from "../types";

interface CompletionScreenProps {
  record: ObservationRecord;
  onRestart: () => void;
}

export function CompletionScreen({ record, onRestart }: CompletionScreenProps) {
  return (
    <div className="flex h-full min-h-0 overflow-y-auto bg-paper p-6 text-center">
      <div className="m-auto space-y-4">
        <h2 className="font-serif text-4xl text-primary">
          Obrigado por permanecer com isso.
        </h2>

        {record.label && (
          <div className="space-y-1 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
              {record.label}
            </p>
            <p className="font-serif text-lg text-text/80">
              {record.intensity}/10
            </p>
          </div>
        )}

        {(record.bodySensation || record.need) && (
          <div className="mx-auto mt-6 max-w-md space-y-3 rounded-xl border border-primary/10 bg-areia p-4 text-left">
            {record.bodySensation && (
              <div className="space-y-1">
                <strong className="text-xs font-bold text-primary">
                  Corpo:
                </strong>
                <p className="text-sm text-text/80">{record.bodySensation}</p>
              </div>
            )}
            {record.need && (
              <div className="space-y-1 pt-2">
                <strong className="text-xs font-bold text-primary">
                  Necessidade:
                </strong>
                <p className="text-sm text-text/80">{record.need}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onRestart}
          className="resource-action mt-8 bg-primary text-paper"
        >
          Recomeçar
        </button>
      </div>
    </div>
  );
}
