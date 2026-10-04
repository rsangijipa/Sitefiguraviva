"use client";
import type { RiverTimingMode } from "../types";
interface Props {
  paused: boolean;
  reducedMotion: boolean;
  mode: RiverTimingMode;
  onTogglePause: () => void;
  onReducedMotion: () => void;
  onMode: (mode: RiverTimingMode) => void;
  onEnd: () => void;
}
export function RiverControls({
  paused,
  reducedMotion,
  mode,
  onTogglePause,
  onReducedMotion,
  onMode,
  onEnd,
}: Props) {
  return (
    <section className="riverControls" aria-label="Controles do rio">
      <label>
        Tempo{" "}
        <select
          value={mode}
          onChange={(event) =>
            onMode(
              event.target.value === "free"
                ? "free"
                : (Number(event.target.value) as Exclude<
                    RiverTimingMode,
                    "free"
                  >),
            )
          }
        >
          <option value="free">Livre</option>
          <option value="2">2 minutos</option>
          <option value="3">3 minutos</option>
          <option value="5">5 minutos</option>
        </select>
      </label>
      <button type="button" onClick={onTogglePause}>
        {paused ? "Retomar" : "Pausar movimento"}
      </button>
      <button type="button" onClick={onReducedMotion}>
        {reducedMotion ? "Usar movimento" : "Reduzir movimento"}
      </button>
      <button type="button" className="riverEnd" onClick={onEnd}>
        Encerrar
      </button>
    </section>
  );
}
