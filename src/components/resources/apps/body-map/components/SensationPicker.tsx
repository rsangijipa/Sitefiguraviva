import type { Sensation } from "../types";
import { sensations } from "../data/sensations";

interface SensationPickerProps {
  regionLabel: string;
  selectedSensation: Sensation | undefined;
  onChoose: (sensation: Sensation) => void;
  onClear: () => void;
}

export function SensationPicker({
  regionLabel,
  selectedSensation,
  onChoose,
  onClear,
}: SensationPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
        Sensação em {regionLabel}
      </p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {sensations.map((sensation) => {
          const isActive = selectedSensation === sensation.value;

          return (
            <button
              key={sensation.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChoose(sensation.value)}
              className={`flex min-h-11 items-center rounded-lg border px-3 py-2 text-left text-sm capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isActive
                  ? "border-terra bg-terra/10 font-semibold text-primary"
                  : "border-primary/15 text-primary hover:border-terra/45"
              }`}
            >
              {isActive && (
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: sensation.cssColor }}
                />
              )}
              {sensation.label}
            </button>
          );
        })}
      </div>
      {selectedSensation && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-text/50 underline-offset-2 hover:text-text/80 hover:underline"
        >
          Remover marcação
        </button>
      )}
    </div>
  );
}
