"use client";

interface ObservationFormProps {
  label: string;
  onLabelChange: (label: string) => void;
  bodySensation: string;
  onBodySensation: (s: string) => void;
  need: string;
  onNeed: (n: string) => void;
}

export function ObservationForm({
  label,
  onLabelChange,
  bodySensation,
  onBodySensation,
  need,
  onNeed,
}: ObservationFormProps) {
  return (
    <div className="space-y-6">
      {/* Optional label */}
      <div className="space-y-2">
        <label
          className="block text-sm font-bold text-primary"
          htmlFor="intensidade-label"
        >
          Uma palavra, se quiser
        </label>
        <input
          id="intensidade-label"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="w-full rounded-xl border border-primary/20 bg-areia px-4 py-3 font-sans font-normal placeholder:text-text/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="ex.: presença, aperto, energia"
        />
      </div>

      {/* Two-column grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="block text-sm font-bold text-primary"
            htmlFor="body-sensation"
          >
            O que muda no seu corpo?
          </label>
          <textarea
            id="body-sensation"
            value={bodySensation}
            onChange={(e) => onBodySensation(e.target.value)}
            className="min-h-[7rem] w-full rounded-xl border border-primary/20 bg-areia p-3 font-sans font-normal placeholder:text-text/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="ex.: calor no peito, respiração leve, mãos relaxadas"
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-bold text-primary"
            htmlFor="immediate-need"
          >
            O que você precisa neste momento?
          </label>
          <textarea
            id="immediate-need"
            value={need}
            onChange={(e) => onNeed(e.target.value)}
            className="min-h-[7rem] w-full rounded-xl border border-primary/20 bg-areia p-3 font-sans font-normal placeholder:text-text/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="ex.: um respiro, água, movimento"
          />
        </div>
      </div>
    </div>
  );
}
