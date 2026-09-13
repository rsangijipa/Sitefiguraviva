"use client";
import type { RiverLeaf } from "../types";
export function ActiveLeavesList({
  leaves,
  onRemove,
  reducedMotion,
  onNext,
}: {
  leaves: RiverLeaf[];
  onRemove: (id: string) => void;
  reducedMotion: boolean;
  onNext: () => void;
}) {
  return (
    <section className="riverCard">
      <h2>Folhas no campo de visão</h2>
      <p className="riverHint">
        O texto aparece aqui para que a prática funcione também sem Canvas.
      </p>
      {leaves.length ? (
        <ul>
          {leaves.map((leaf) => (
            <li key={leaf.id}>
              <span>{leaf.text}</span>
              <button type="button" onClick={() => onRemove(leaf.id)}>
                Retirar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma folha no rio agora. Você pode apenas observar.</p>
      )}
      {reducedMotion && leaves.length > 0 && (
        <button type="button" onClick={onNext}>
          Próxima folha
        </button>
      )}
    </section>
  );
}
