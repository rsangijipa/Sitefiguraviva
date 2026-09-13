import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type {
  RegionId,
  Sensation,
} from "@/components/resources/apps/body-map/types";
import { regions } from "@/components/resources/apps/body-map/data/regions";
import { sensations } from "@/components/resources/apps/body-map/data/sensations";
import { BodySilhouette } from "@/components/resources/apps/body-map/components/BodySilhouette";
import type { CheckInState, CheckInActions } from "../types";
import { StepIndicator } from "./StepIndicator";

interface BodyMappingStepProps {
  state: Pick<CheckInState, "bodyMarks" | "bodyNotes" | "arrivalAnswers">;
  actions: Pick<
    CheckInActions,
    "handleBodyMark" | "setBodyNote" | "advanceStep" | "completeFlow"
  >;
  totalSteps: number;
}

type LocalState = {
  selectedRegion: RegionId;
};

export function BodyMappingStep({
  state,
  actions,
  totalSteps,
}: BodyMappingStepProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("chest");
  const [localMarks, setLocalMarks] = useState(state.bodyMarks);
  const [localNotes, setLocalNotes] = useState(state.bodyNotes);

  // Sync internal state when prop state changes
  const syncMarks = useCallback((m: typeof state.bodyMarks) => {
    setLocalMarks(m);
  }, []);

  const syncNotes = useCallback((n: typeof state.bodyNotes) => {
    setLocalNotes(n);
  }, []);

  useEffect(() => {
    syncMarks(state.bodyMarks);
  }, [state.bodyMarks, syncMarks]);
  useEffect(() => {
    syncNotes(state.bodyNotes);
  }, [state.bodyNotes, syncNotes]);

  const handleSelectRegion = useCallback((id: RegionId) => {
    setSelectedRegion(id);
  }, []);

  const handleChooseSensation = useCallback(
    (sensation: Sensation) => {
      setLocalMarks((prev) => ({ ...prev, [selectedRegion]: sensation }));
      actions.handleBodyMark(selectedRegion, sensation);
    },
    [selectedRegion, actions],
  );

  const handleClearSensation = useCallback(() => {
    setLocalMarks((prev) => ({ ...prev, [selectedRegion]: undefined }));
    actions.handleBodyMark(selectedRegion, undefined);
  }, [selectedRegion, actions]);

  const handleSetNote = useCallback(
    (value: string) => {
      setLocalNotes((prev) => ({ ...prev, [selectedRegion]: value }));
      actions.setBodyNote(selectedRegion, value);
    },
    [selectedRegion, actions],
  );

  const markedCount = Object.values(localMarks).filter(Boolean).length;

  const handleComplete = useCallback(() => {
    actions.completeFlow();
  }, [actions]);

  return (
    <section
      aria-labelledby="mapping-title"
      className="flex min-h-full w-full flex-col bg-paper"
    >
      <header className="border-b border-primary/10 px-4 py-5 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Perceber · Check-in Corporal
        </p>
        <h2
          id="mapping-title"
          tabIndex={-1}
          className="mt-2 font-serif text-3xl text-primary sm:text-4xl"
        >
          Onde isso se manifesta?
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-text/70 sm:text-base">
          Clique em uma região do corpo abaixo e associe a sensação mais
          próxima. Não precisa marcar tudo.
        </p>
        <StepIndicator currentStep={1} totalSteps={totalSteps} />
      </header>

      <div className="flex-1 px-4 py-4 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-5 md:grid-cols-[1fr_1.2fr_1fr] lg:grid-cols-[15rem_1fr_16rem]">
          {/* Left: Region list */}
          <div className="space-y-3">
            <div
              role="progressbar"
              aria-valuenow={markedCount}
              aria-valuemin={0}
              aria-valuemax={9}
              aria-label={`${markedCount} de 9 regiões marcadas`}
              className="space-y-1"
            >
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out-soft"
                  style={{ width: `${(markedCount / 9) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-text/50">
                {markedCount} de 9 regiões
              </p>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
              Região
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {regions.map((region) => {
                const active = region.id === selectedRegion;
                const mark = localMarks[region.id];

                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleSelectRegion(region.id)}
                    className={`flex min-h-11 flex-col justify-center rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      active
                        ? "border-primary bg-primary text-paper"
                        : "border-primary/15 bg-surface text-primary hover:border-terra/40"
                    }`}
                  >
                    <span>{region.label}</span>
                    {mark ? (
                      <span className="mt-0.5 block text-[11px] opacity-75 capitalize">
                        {mark}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Silhouette */}
          <div className="flex items-center justify-center py-4">
            <BodySilhouette
              selectedRegion={selectedRegion}
              marks={localMarks}
              onRegionSelect={handleSelectRegion}
            />
          </div>

          {/* Right: Sensation picker + Note */}
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
                Sensação em{" "}
                {regions.find((r) => r.id === selectedRegion)?.label ?? ""}
              </p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {sensations.map((sensation) => {
                  const isActive =
                    localMarks[selectedRegion] === sensation.value;

                  return (
                    <button
                      key={sensation.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleChooseSensation(sensation.value)}
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
              {localMarks[selectedRegion] && (
                <button
                  type="button"
                  onClick={handleClearSensation}
                  className="text-xs text-text/50 underline-offset-2 hover:text-text/80 hover:underline"
                >
                  Remover marcação
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor={`body-note-${selectedRegion}`}
                className="block text-xs font-bold uppercase tracking-widest text-primary/60"
              >
                Nota sobre{" "}
                {regions.find((r) => r.id === selectedRegion)?.shortLabel ?? ""}
              </label>
              <textarea
                id={`body-note-${selectedRegion}`}
                value={localNotes[selectedRegion] ?? ""}
                onChange={(e) => handleSetNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-primary/15 bg-surface p-3 font-sans text-sm text-primary placeholder:text-text/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="O que chama atenção nesta região?"
              />
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={
                markedCount === 0 &&
                !Object.values(localNotes).some((n) => n.trim().length > 0)
              }
              className="resource-action flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-paper disabled:opacity-40"
            >
              <Sparkles size={16} aria-hidden="true" /> Ver reflexão
            </button>
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {localMarks[selectedRegion]
          ? `${regions.find((r) => r.id === selectedRegion)?.label}: ${localMarks[selectedRegion]}`
          : `${regions.find((r) => r.id === selectedRegion)?.label} selecionado`}
      </p>
    </section>
  );
}
