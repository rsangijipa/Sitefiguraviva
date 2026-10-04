"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveLeavesList } from "./components/ActiveLeavesList";
import { RiverCanvas } from "./components/RiverCanvas";
import { RiverCompletion } from "./components/RiverCompletion";
import { RiverComposer } from "./components/RiverComposer";
import { RiverControls } from "./components/RiverControls";
import { advanceScene } from "./engine/riverScene";
import { useRiverLoop } from "./hooks/useRiverLoop";
import styles from "./thought-river.module.css";
import {
  MAX_ACTIVE_LEAVES,
  MAX_LEAF_LENGTH,
  MAX_REFLECTION_LENGTH,
  type RiverLeaf,
  type RiverPhase,
  type RiverTimingMode,
  type ThoughtRiverExperienceProps,
} from "./types";
import { makeLeaf } from "./engine/leafMotion";
import { deleteRiverSession, listRiverSessions } from "./repository";
import type { RiverSessionRecord } from "./types";

function plannedSeconds(mode: RiverTimingMode) {
  return mode === "free" ? null : mode * 60;
}
function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function ThoughtRiverExperience({
  onSave,
  onExit,
  onComplete,
  initialTimingMode = "free",
  initialView = "experience",
  className,
}: ThoughtRiverExperienceProps) {
  const [view, setView] = useState<"experience" | "history">(initialView);
  const [phase, setPhase] = useState<RiverPhase>("intro");
  const [mode, setMode] = useState<RiverTimingMode>(initialTimingMode);
  const [draft, setDraft] = useState("");
  const [leaves, setLeaves] = useState<RiverLeaf[]>([]);
  const leavesRef = useRef<RiverLeaf[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notice, setNotice] = useState("");
  const [reflection, setReflection] = useState("");
  const [activeSeconds, setActiveSeconds] = useState(0);
  const activeMsRef = useRef(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const hiddenRef = useRef(false);

  const publishLeaves = useCallback((next: RiverLeaf[]) => {
    leavesRef.current = next;
    setLeaves(next);
  }, []);
  const pause =
    phase === "paused" ||
    phase === "completion" ||
    reducedMotion ||
    hiddenRef.current;
  const running = phase === "running" && !pause;
  const end = useCallback(() => {
    setPhase("completion");
    onComplete?.({
      activeDurationSeconds: Math.floor(activeMsRef.current / 1000),
      mode,
      plannedDurationSeconds: plannedSeconds(mode),
    });
  }, [mode, onComplete]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    const visibility = () => {
      hiddenRef.current = document.hidden;
      if (document.hidden)
        setNotice("O movimento foi pausado enquanto esta aba estava oculta.");
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useRiverLoop(running, (deltaMs) => {
    activeMsRef.current += deltaMs;
    setActiveSeconds(Math.floor(activeMsRef.current / 1000));
    const next = advanceScene(leavesRef.current, deltaMs);
    publishLeaves(next.active);
    if (next.exited.length) setNotice("Uma folha saiu do campo de visão.");
    const planned = plannedSeconds(mode);
    if (planned && activeMsRef.current >= planned * 1000) {
      setNotice(
        "O tempo sugerido chegou ao fim. Você pode continuar ou encerrar.",
      );
      setPhase("paused");
    }
  });

  const addLeaf = () => {
    const text = draft.trim();
    if (!text) {
      setNotice(
        "Escreva uma frase com algum conteúdo ou observe o rio sem enviar nada.",
      );
      return;
    }
    if (
      text.length > MAX_LEAF_LENGTH ||
      leavesRef.current.length >= MAX_ACTIVE_LEAVES
    )
      return;
    publishLeaves([...leavesRef.current, makeLeaf(makeId(), text, Date.now())]);
    setDraft("");
    setNotice("Uma folha entrou no rio.");
  };
  const nextLeaf = () => {
    const [first, ...rest] = leavesRef.current;
    if (first) {
      publishLeaves(rest);
      setNotice("Uma folha saiu do campo de visão.");
    }
  };
  const discard = () => {
    publishLeaves([]);
    onExit?.();
  };
  const save = async () => {
    if (!onSave) {
      discard();
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        activeDurationSeconds: Math.floor(activeMsRef.current / 1000),
        mode,
        plannedDurationSeconds: plannedSeconds(mode),
        reflection: reflection.trim() || null,
      });
      publishLeaves([]);
    } catch {
      setSaveError(
        "Não foi possível salvar. Seu registro continua nesta tela.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (view === "history")
    return (
      <main className={`${styles.root} ${className ?? ""}`}>
        <RiverHistory onBack={() => setView("experience")} />
      </main>
    );
  if (phase === "intro")
    return (
      <main className={`${styles.root} ${className ?? ""}`}>
        <section className="intro">
          <p className="riverEyebrow">Rio dos Pensamentos</p>
          <h1>Você pode observar o que passa.</h1>
          <p>
            Escreva uma frase, se quiser, e acompanhe uma folha. Não é preciso
            fazer o pensamento desaparecer.
          </p>
          <p className="riverHint">
            As frases não serão guardadas nesta prática.
          </p>
          <button type="button" onClick={() => setPhase("ready")}>
            Observar o rio
          </button>
        </section>
      </main>
    );
  if (phase === "completion")
    return (
      <main className={`${styles.root} ${className ?? ""}`}>
        <RiverCompletion
          reflection={reflection}
          onReflection={(value) =>
            setReflection(value.slice(0, MAX_REFLECTION_LENGTH))
          }
          onSave={save}
          onDiscard={discard}
          saving={saving}
          mode={mode}
          seconds={activeSeconds}
        />
        {saveError && <p role="alert">{saveError}</p>}
      </main>
    );
  return (
    <main className={`${styles.root} ${className ?? ""}`}>
      <p className="riverEyebrow">Rio dos Pensamentos</p>
      <h1>Observe pensamentos passando, sem precisar afastá-los.</h1>
      <p className="riverHint">
        Você pode experimentar sem salvar. Para guardar no seu histórico,
        escolha Salvar ao finalizar.
      </p>
      <div className="riverLayout">
        <div>
          <div className="riverStage">
            <RiverCanvas leaves={leaves} reducedMotion={reducedMotion} />
          </div>
          {reducedMotion && (
            <p className="riverHint">
              Sem movimento: acompanhe as folhas pela lista e use “Próxima
              folha”.
            </p>
          )}
          <RiverControls
            paused={phase === "paused"}
            reducedMotion={reducedMotion}
            mode={mode}
            onMode={setMode}
            onTogglePause={() =>
              setPhase(phase === "paused" ? "running" : "paused")
            }
            onReducedMotion={() => setReducedMotion((value) => !value)}
            onEnd={end}
          />
        </div>
        <aside>
          <RiverComposer
            draft={draft}
            onDraftChange={setDraft}
            onSend={addLeaf}
            disabled={phase === "paused"}
            atCapacity={leaves.length >= MAX_ACTIVE_LEAVES}
          />
          <ActiveLeavesList
            leaves={leaves}
            onRemove={(id) =>
              publishLeaves(leavesRef.current.filter((leaf) => leaf.id !== id))
            }
            reducedMotion={reducedMotion}
            onNext={nextLeaf}
          />
        </aside>
      </div>
      <p className="live" aria-live="polite">
        {notice}
      </p>
      {phase === "ready" && (
        <button type="button" onClick={() => setPhase("running")}>
          Começar a observar
        </button>
      )}
    </main>
  );
}

function RiverHistory({ onBack }: { onBack: () => void }) {
  const [records, setRecords] = useState<RiverSessionRecord[]>([]);
  const [message, setMessage] = useState("Carregando registros...");
  useEffect(() => {
    let mounted = true;
    listRiverSessions().then((result) => {
      if (!mounted) return;
      if (result.ok === true) {
        setRecords(result.data.items);
        setMessage(
          result.data.items.length
            ? ""
            : "Você ainda não guardou registros aqui.",
        );
      } else setMessage(result.error);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const remove = async (id: string) => {
    const result = await deleteRiverSession(id);
    if (result.ok === false) {
      setMessage(result.error);
      return;
    }
    setRecords((items) => items.filter((record) => record.id !== id));
  };
  return (
    <section className="riverCompletion">
      <p className="riverEyebrow">Histórico privado</p>
      <h1>Registros do Rio</h1>
      <p>As frases das folhas não são guardadas aqui.</p>
      <button type="button" onClick={onBack}>
        Voltar ao rio
      </button>
      {message && <p role="status">{message}</p>}
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <span>
              {new Date(record.createdAt).toLocaleDateString("pt-BR")} ·{" "}
              {Math.floor(record.activeDurationSeconds / 60)} min
              {record.reflection ? ` · ${record.reflection}` : ""}
            </span>
            <button type="button" onClick={() => remove(record.id)}>
              Excluir registro
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ThoughtRiverExperience;
