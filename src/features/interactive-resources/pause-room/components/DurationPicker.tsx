"use client";

interface DurationPickerProps {
  durations: number[];
  value: number;
  onChange(duration: number): void;
}

export function DurationPicker({
  durations,
  value,
  onChange,
}: DurationPickerProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-paper p-1.5"
      role="radiogroup"
      aria-label="Duração da pausa"
    >
      {durations.map((d) => {
        const selected = d === value;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(d)}
            className={
              selected
                ? "rounded-full bg-terra px-4 py-1.5 text-sm font-bold text-paper transition"
                : "rounded-full px-4 py-1.5 text-sm font-semibold text-text/70 hover:bg-areia hover:text-text"
            }
          >
            {d} min
          </button>
        );
      })}
    </div>
  );
}
