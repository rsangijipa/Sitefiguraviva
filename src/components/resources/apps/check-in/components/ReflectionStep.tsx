import { Sparkles } from "lucide-react";
import type { CheckInState, CheckInActions, MarkedRegion } from "../types";
import { getSensation } from "@/components/resources/apps/body-map/data/sensations";

interface ReflectionState {
  arrivalAnswers: string[];
  bodyMarks: Record<string, string | undefined>;
  bodyNotes: Record<string, string>;
}

interface ReflectionStepProps {
  state: ReflectionState;
  actions: Pick<CheckInActions, "resetAll"> & { markedRegions: MarkedRegion[] };
}

function buildReflection(state: ReflectionState): string {
  const answers = state.arrivalAnswers.filter((a) => a.trim().length > 0);
  const marksCount = Object.values(state.bodyMarks).filter(Boolean).length;

  if (answers.length === 0 && marksCount === 0 && !state.bodyNotes) {
    return "Você escolheu observar em silêncio. Essa presença já é suficiente.";
  }

  const parts: string[] = [];

  // Reflect arrival words
  if (answers.length > 0) {
    const lastAnswer = answers[answers.length - 1];
    const firstAnswer = answers[0];

    if (marksCount > 0) {
      parts.push(`Você chegou trazendo ${firstAnswer}.`);
      parts.push(
        `${lastAnswer ? `E no corpo, ${lastAnswer}.` : "O corpo guardou o que a palavra não alcançou."}`,
      );
    } else {
      parts.push(
        `Neste momento, há ${firstAnswer}${answers.length > 1 ? `, além de ${answers.slice(1, 3).join(", ")}.` : ""}`,
      );
    }
  }

  // Reflect body marks
  if (marksCount > 0) {
    const regionsWithMarks = Object.entries(state.bodyMarks)
      .filter(([, s]) => s)
      .map(([region, sensation]) => ({ region, sensation }));

    if (regionsWithMarks.length === 1) {
      const { region, sensation } = regionsWithMarks[0];
      const regionNames: Record<string, string> = {
        head: "cabeça",
        neck: "pescoço",
        chest: "peito",
        abdomen: "abdômen",
        "left-arm": "braço esquerdo",
        "right-arm": "braço direito",
        "left-leg": "perna esquerda",
        "right-leg": "perna direita",
        feet: "pés",
      };

      const feelingDescs: Record<string, string> = {
        tensão: "se contrai",
        calor: "acende um fogo interno",
        peso: "carrega algo que ainda não foi colocado no chão",
        formigamento: "vibra com algo vivo",
        leveza: "flutua um pouco mais",
      };

      parts.push(
        `Na ${regionNames[region] ?? region}, o sentimento de ${sensation} ${feelingDescs[sensation] ?? "chama atenção"}.`,
      );
    } else {
      const sensWords = regionsWithMarks
        .map((m) => m.sensation)
        .filter(Boolean);
      const uniqueSensations = [...new Set(sensWords)];
      parts.push(
        `${marksCount} lugares no corpo pedem presença — ${uniqueSensations.join(" e ")}.`,
      );
    }
  }

  // Reflect body notes
  const notableNote = Object.values(state.bodyNotes).find((n) => n?.trim());
  if (notableNote && notableNote.trim().length > 0) {
    parts.push(`Diz alguém: "${notableNote.trim()}"`);
  }

  return parts.join(" ");
}

export function ReflectionStep({ state, actions }: ReflectionStepProps) {
  const reflection = buildReflection(state);
  const { markedRegions } = actions;

  return (
    <section className="flex min-h-full items-center justify-center bg-paper px-5 py-8">
      <div className="w-full max-w-2xl border-y border-primary/10 py-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-terra" aria-hidden="true" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Check-in concluído
        </p>
        <h2 tabIndex={-1} className="mt-3 font-serif text-4xl text-primary">
          O corpo que você percebe agora
        </h2>

        <blockquote className="mx-auto mt-8 max-w-xl font-serif text-lg leading-relaxed text-text">
          {reflection}
        </blockquote>

        {markedRegions.length > 0 && (
          <ul
            className="mx-auto mt-8 grid max-w-md gap-2 text-left sm:grid-cols-2"
            role="list"
          >
            {markedRegions.map((mark) => {
              const sensation = getSensation(mark.sensation);

              return (
                <li
                  key={mark.region}
                  className="flex items-center justify-between rounded-lg border border-primary/10 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-primary">
                    {mark.regionLabel}
                  </span>
                  <span className="flex items-center gap-2 text-text/65 capitalize">
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
        )}

        <p className="mt-4 max-w-md text-center text-xs text-text/50">
          Este check-in não é uma avaliação clínica. É um gesto de presença
          consigo mesmo.
        </p>

        <button
          type="button"
          onClick={actions.resetAll}
          className="resource-action resource-action--secondary mx-auto mt-8 rounded-xl border border-primary/20 px-6 py-3 text-primary hover:bg-areia"
        >
          Recomeçar
        </button>
      </div>
    </section>
  );
}
