import type { BodyMark } from "../types";
import { getRegion } from "../data/regions";
import { getSensation } from "../data/sensations";
import { Sparkles } from "lucide-react";

interface SummaryCardProps {
  markedRegions: BodyMark[];
  note: string;
  onReset: () => void;
}

export function SummaryCard({
  markedRegions,
  note,
  onReset,
}: SummaryCardProps) {
  return (
    <section className="flex min-h-full items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-2xl border-y border-primary/15 py-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-terra" aria-hidden="true" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Mapa conclu&iacute;do
        </p>
        <h2 tabIndex={-1} className="mt-3 font-serif text-4xl text-primary">
          O corpo que voc&ecirc; percebe agora
        </h2>

        {markedRegions.length > 0 ? (
          <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
            {markedRegions.map((mark) => {
              const region = getRegion(mark.region);
              const sensation = getSensation(mark.sensation);

              return (
                <li
                  key={mark.region}
                  className="flex items-center justify-between border-b border-primary/10 py-2 text-sm"
                >
                  <span className="font-medium text-primary">
                    {region.label}
                  </span>
                  <span className="flex items-center gap-2 text-text/65">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: sensation.cssColor }}
                    />
                    {sensation.label}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mx-auto mt-6 max-w-md text-text/70">
            Nenhuma regi&atilde;o foi marcada. Observar sem nomear tamb&eacute;m
            &eacute; uma forma v&aacute;lida de presen&ccedil;a.
          </p>
        )}

        {note ? (
          <p className="mx-auto mt-6 max-w-lg italic text-text/70">
            &ldquo;{note}&rdquo;
          </p>
        ) : null}

        <button
          type="button"
          onClick={onReset}
          className="resource-action resource-action--secondary mt-8"
        >
          Recome&ccedil;ar
        </button>
      </div>
    </section>
  );
}
