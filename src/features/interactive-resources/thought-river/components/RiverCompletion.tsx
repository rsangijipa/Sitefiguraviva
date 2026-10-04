"use client";
import type { RiverTimingMode } from "../types";
export function RiverCompletion({
  reflection,
  onReflection,
  onSave,
  onDiscard,
  saving,
  mode,
  seconds,
}: {
  reflection: string;
  onReflection: (value: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
  mode: RiverTimingMode;
  seconds: number;
}) {
  return (
    <section className="riverCompletion">
      <p className="riverEyebrow">Rio dos Pensamentos</p>
      <h1>Você pode encerrar por aqui.</h1>
      <p>As frases que passaram pelo rio não serão guardadas.</p>
      <label htmlFor="river-reflection">
        Quer registrar algo sobre esta experiência? <span>(opcional)</span>
      </label>
      <textarea
        id="river-reflection"
        maxLength={500}
        value={reflection}
        onChange={(event) => onReflection(event.target.value)}
      />
      <p>{reflection.length}/500</p>
      <div>
        <button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar esta nota e a duração"}
        </button>
        <button type="button" onClick={onDiscard} disabled={saving}>
          Encerrar sem guardar
        </button>
      </div>
      <p className="riverHint">
        {mode === "free" ? "Modo livre" : `${mode} minutos planejados`} ·{" "}
        {Math.floor(seconds / 60)} min de prática ativa
      </p>
    </section>
  );
}
