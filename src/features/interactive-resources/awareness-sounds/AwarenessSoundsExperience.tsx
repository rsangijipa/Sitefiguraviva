"use client";
import { useEffect, useMemo, useState } from "react";
import { Headphones, History, Trash2 } from "lucide-react";
import {
  TEXTUAL_SCENES,
  type AudioStatus,
  type ListeningObservation,
  type SceneDistance,
  type ScenePosition,
} from "./types";
import {
  deleteListeningSession,
  listListeningSessions,
  saveListeningSession,
} from "./repository";

const directions: ScenePosition[] = [
  "left",
  "center",
  "right",
  "front",
  "behind",
];
const label: Record<string, string> = {
  left: "Esquerda",
  center: "Centro",
  right: "Direita",
  front: "Frente",
  behind: "Atrás",
  near: "Perto",
  medium: "Intermediário",
  far: "Longe",
  unsure: "Não sei",
};
const qualities = ["suave", "contínuo", "intermitente", "grave", "agudo"];

export function AwarenessSoundsExperience({
  initialHistory = false,
  activeSection,
}: {
  initialHistory?: boolean;
  activeSection?: string;
}) {
  const historyView = initialHistory || activeSection === "history";
  const [status, setStatus] = useState<AudioStatus>(
    historyView ? "completion" : "setup",
  );
  const [scene, setScene] = useState(0);
  const [direction, setDirection] = useState<ScenePosition | "unsure">(
    "unsure",
  );
  const [distance, setDistance] = useState<SceneDistance | "unsure">("unsure");
  const [chosen, setChosen] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [reflection, setReflection] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const observation = useMemo<ListeningObservation>(
    () => ({
      qualities: chosen,
      perceivedDirection: direction,
      perceivedDistance: distance,
      customQuality: custom.trim() || null,
    }),
    [chosen, direction, distance, custom],
  );
  const load = async () => {
    try {
      setRecords(await listListeningSessions());
    } catch {
      setRecords([]);
    }
  };
  useEffect(() => {
    if (historyView) void load();
  }, [historyView]);
  const begin = () => {
    setStartedAt(Date.now());
    setStatus("ready");
  };
  const complete = () => setStatus("completion");
  const save = async () => {
    try {
      await saveListeningSession({
        mode: "text",
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        observations: [observation],
        reflection: reflection.trim() || null,
        contentVersion: "text-v1",
        clientRequestId: crypto.randomUUID(),
      });
      setMessage("Registro salvo no seu histórico privado.");
      await load();
    } catch {
      setMessage("Não foi possível salvar. Seu registro continua nesta tela.");
    }
  };
  if (historyView)
    return (
      <section className="mx-auto max-w-3xl space-y-5 p-6 bg-paper min-h-dvh">
        <h1 className="font-serif text-3xl text-primary">
          Histórico de escuta
        </h1>
        <p className="text-text/70">
          Este registro fica no seu histórico privado. Professores e outros
          alunos não têm acesso por esta ferramenta.
        </p>
        {records.length === 0 ? (
          <p className="rounded-3xl border border-[#D8CFBE] bg-[#F1E9DB] p-8 text-[#6B6B63]">
            Você ainda não guardou registros aqui.
          </p>
        ) : (
          records.map((r) => (
            <article
              key={r.id}
              className="rounded-3xl border border-[#D8CFBE] bg-white p-5"
            >
              <div className="flex justify-between gap-3">
                <p className="text-sm text-text/70">
                  {new Date(r.createdAt).toLocaleString("pt-BR")}
                </p>
                <button
                  className="min-h-11 min-w-11 text-terra"
                  aria-label="Excluir registro"
                  onClick={async () => {
                    await deleteListeningSession(r.id);
                    await load();
                  }}
                >
                  <Trash2 />
                </button>
              </div>
              <p className="mt-2 text-text">
                {r.reflection || "Sem reflexão escrita."}
              </p>
            </article>
          ))
        )}
      </section>
    );
  if (status === "setup")
    return (
      <section className="mx-auto max-w-2xl p-6 sm:p-10 bg-paper">
        <div className="rounded-3xl border-2 border-[#96551F] bg-[#F1E9DB] p-7 text-center space-y-5">
          <Headphones className="mx-auto text-primary" size={38} />
          <p className="text-xs uppercase tracking-widest font-bold text-terra">
            Perceber
          </p>
          <h1 className="font-serif text-4xl text-primary">
            Escutar, com curiosidade.
          </h1>
          <p className="text-text leading-relaxed">
            Observe direção, distância e textura. Sua percepção não precisa
            corresponder a uma resposta certa.
          </p>
          <p className="text-sm text-text/70">
            Comece com volume baixo e ajuste para ficar confortável. Fones podem
            tornar a direção mais perceptível. Você também pode usar
            alto-falantes.
          </p>
          <p className="rounded-2xl border border-[#D8CFBE] bg-paper p-4 text-sm text-text">
            Nesta versão, você pode explorar descrições, sem áudio. As cenas
            sonoras aguardam arquivos licenciados.
          </p>
          <button
            className="resource-action min-h-11 bg-primary text-paper px-6"
            onClick={begin}
          >
            Explorar descrições, sem áudio
          </button>
        </div>
      </section>
    );
  if (status === "completion")
    return (
      <section className="mx-auto max-w-2xl p-6 sm:p-10 bg-paper">
        <div className="rounded-3xl border border-[#D8CFBE] bg-[#F1E9DB] p-7 space-y-5">
          <h1 className="font-serif text-3xl text-primary">
            O que você notou?
          </h1>
          <p className="text-text">
            Não há resposta certa nesta exploração. Você pode encerrar sem
            salvar ou guardar esta observação no histórico privado.
          </p>
          <label
            className="block text-sm font-bold text-primary"
            htmlFor="reflection"
          >
            Uma reflexão, se quiser
          </label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value.slice(0, 500))}
            className="w-full rounded-2xl border border-[#D8CFBE] bg-paper p-3 text-text"
            rows={4}
            maxLength={500}
          />
          <div className="flex flex-wrap gap-3">
            <button
              className="resource-action min-h-11 bg-primary text-paper px-5"
              onClick={save}
            >
              Salvar no histórico
            </button>
            <button
              className="min-h-11 px-5 text-primary underline"
              onClick={() => {
                setStatus("setup");
                setReflection("");
              }}
            >
              Encerrar sem salvar
            </button>
          </div>
          {message && (
            <p role="status" className="text-sm text-primary">
              {message}
            </p>
          )}
        </div>
      </section>
    );
  const current = TEXTUAL_SCENES[scene];
  return (
    <section className="mx-auto max-w-6xl bg-paper p-4 sm:p-7">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest font-bold text-terra">
          Modo textual
        </p>
        <h1 className="font-serif text-3xl text-primary">
          Sons para Awareness
        </h1>
        <p className="mt-2 text-text/70">
          As descrições não são equivalentes a ouvir som espacial.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-[24px] border border-[#D8CFBE] bg-[#F1E9DB] p-6">
          <div
            aria-hidden="true"
            className="mx-auto flex aspect-square max-w-sm items-center justify-center rounded-full border-[6px] border-[#96551F] bg-paper"
          >
            <span className="rounded-full bg-primary px-4 py-2 text-sm text-paper">
              Você
            </span>
          </div>
          <h2 className="mt-5 font-serif text-2xl text-primary">
            {current.title}
          </h2>
          <p className="mt-2 text-text">{current.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TEXTUAL_SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setScene(i)}
                className={`min-h-11 rounded-full border px-4 text-sm ${i === scene ? "bg-primary text-paper" : "border-[#D8CFBE] text-primary"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-5 rounded-[24px] border border-[#D8CFBE] p-5">
          <fieldset>
            <legend className="font-bold text-primary">
              De que direção parece vir?
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[...directions, "unsure" as const].map((v) => (
                <button
                  key={v}
                  onClick={() => setDirection(v)}
                  className={`min-h-11 rounded-xl border px-3 text-sm ${direction === v ? "border-primary bg-primary text-paper" : "border-[#D8CFBE] text-primary"}`}
                >
                  {label[v]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-bold text-primary">
              Parece perto ou longe?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["near", "medium", "far", "unsure"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setDistance(v)}
                  className={`min-h-11 rounded-xl border px-3 text-sm ${distance === v ? "border-primary bg-primary text-paper" : "border-[#D8CFBE] text-primary"}`}
                >
                  {label[v]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-bold text-primary">
              Como você descreveria?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    setChosen((x) =>
                      x.includes(q)
                        ? x.filter((i) => i !== q)
                        : x.length < 5
                          ? [...x, q]
                          : x,
                    )
                  }
                  aria-pressed={chosen.includes(q)}
                  className={`min-h-11 rounded-xl border px-3 text-sm ${chosen.includes(q) ? "border-primary bg-primary text-paper" : "border-[#D8CFBE] text-primary"}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <input
              aria-label="Outro termo"
              maxLength={120}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="mt-3 w-full rounded-xl border border-[#D8CFBE] p-3"
              placeholder="Outro termo, se quiser"
            />
          </fieldset>
          <button
            className="resource-action min-h-11 w-full bg-primary text-paper"
            onClick={complete}
          >
            Continuar
          </button>
        </div>
      </div>
    </section>
  );
}
