"use client";
import type { ChangeEvent } from "react";
interface Props {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  atCapacity: boolean;
}
export function RiverComposer({
  draft,
  onDraftChange,
  onSend,
  disabled,
  atCapacity,
}: Props) {
  return (
    <section className="riverCard">
      <label htmlFor="river-thought">Escreva uma frase, se quiser</label>
      <textarea
        id="river-thought"
        value={draft}
        maxLength={280}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          onDraftChange(event.target.value)
        }
        placeholder="Uma frase que está passando por aqui..."
      />
      <div className="riverComposerFooter">
        <span>{draft.length}/280</span>
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || atCapacity}
        >
          {atCapacity ? "Aguarde uma folha sair" : "Enviar para o rio"}
        </button>
      </div>
      {atCapacity && (
        <p role="status">Há oito folhas no rio. Seu rascunho continua aqui.</p>
      )}
    </section>
  );
}
