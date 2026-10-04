"use client";

import { useState } from "react";
import { RodaDasEmocoes } from "./RodaDasEmocoes";
import { deleteDiary, readDiary } from "./localDiary";
import type { InteractiveResourceEntry } from "../../../types";

export default function EmotionWheelApp({
  user,
  onExit,
}: {
  user?: { id?: string; uid?: string; displayName?: string | null };
  onExit?: () => void;
}) {
  const ownerId = user?.id ?? user?.uid ?? "";
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [entries, setEntries] = useState<InteractiveResourceEntry[]>([]);
  const [error, setError] = useState("");
  const openDiary = () => {
    setError("");
    try { setEntries(readDiary(ownerId)); }
    catch { setEntries([]); setError("Não foi possível ler os registros deste navegador."); }
    setDiaryOpen(true);
  };
  const removeEntry = (id: string) => {
    try {
      deleteDiary(ownerId, id);
      setEntries(readDiary(ownerId));
      setError("");
    } catch { setError("Não foi possível apagar o registro. Tente novamente."); }
  };

  return (
    <>
      <div hidden={diaryOpen}>
        <RodaDasEmocoes key={ownerId} ownerId={ownerId}
          onBackToCatalog={onExit ?? (() => {})} onOpenDiaryModal={openDiary} />
      </div>
      {diaryOpen && (
        <section className="mx-auto max-w-2xl p-5 sm:p-8" aria-labelledby="wheel-diary-title">
          <button type="button" onClick={() => setDiaryOpen(false)} className="resource-action resource-action--secondary">Voltar à roda</button>
          <h2 id="wheel-diary-title" className="mt-6 font-serif text-3xl text-primary">Diário de Percepções</h2>
          <p className="mt-3 text-sm text-text/80">Guardado neste navegador, sem sincronização. Quem usa o mesmo perfil do navegador pode acessar os dados locais; não há proteção por senha neste recurso.</p>
          {error && <p role="alert" className="mt-4 text-warning">{error}</p>}
          {!entries.length && !error && <p role="status" className="mt-6 text-text">Você ainda não guardou percepções da Roda.</p>}
          <ul className="mt-6 space-y-4">
            {entries.map(entry => (
              <li key={entry.id} className="rounded-lg border border-primary/15 bg-paper p-4">
                <p className="text-xs text-text/80">{new Date(entry.created_at).toLocaleString("pt-BR")}</p>
                <h3 className="mt-2 font-serif text-xl text-primary">{entry.payload.custom_label || entry.payload.emotion_label || "Exploração aberta"}</h3>
                <p className="mt-1 text-sm text-text">Intensidade: {entry.payload.intensity ?? "—"} de 5</p>
                {entry.payload.body_note && <p className="mt-2 text-sm text-text">Corpo: {entry.payload.body_note}</p>}
                {entry.payload.reflection && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text">{entry.payload.reflection}</p>}
                <button type="button" onClick={() => removeEntry(entry.id)} className="mt-3 min-h-11 text-sm font-semibold text-primary underline" aria-label={`Apagar percepção ${entry.payload.custom_label || entry.payload.emotion_label || "aberta"}`}>Apagar este registro</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
