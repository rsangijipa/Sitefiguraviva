"use client";
import { C, KitDefs, KitFrame, Stain, useKitIds } from "./kit";
import { IllustrationSlot } from "./IllustrationSlot";
import { SLOTS } from "./slots";

/** Copa do ritual "Colher uma carta" (seção 7.4): imagem + 10 folhas como botões. */
export function Canopy({ onPick, picked }: { onPick: (leaf: number) => void; picked?: number | null }) {
  return <div className="fv-canopy">
    <IllustrationSlot slot={SLOTS.copa} />
    <ul className="fv-canopy-leaves" aria-label="Folhas da copa">
      {Array.from({ length: 10 }, (_, index) => <li key={index}>
        <button type="button" className="fv-leaf-button" aria-pressed={picked === index} onClick={() => onPick(index)}>
          <svg viewBox="-12 -16 24 32" aria-hidden="true"><path d="M0 -14 C9 -8 9 6 0 14 C-9 6 -9 -8 0 -14Z" /></svg>
          <span>Folha {index + 1}</span>
        </button>
      </li>)}
    </ul>
  </div>;
}

export const RubinTree = () => <IllustrationSlot slot={SLOTS.rubin} className="fv-rubin" />;
export const TwoChairsArt = () => <IllustrationSlot slot={SLOTS.cadeiras} decorative className="fv-slot--banner" />;
export const ContactBoundary = () => <IllustrationSlot slot={SLOTS.fronteira} decorative className="fv-slot--banner" />;
export const PracticeArt = ({ practice, className }: { practice: string; className?: string }) =>
  <IllustrationSlot slot={SLOTS.practice(practice)} decorative className={className ?? "fv-slot--banner"} />;

/**
 * Diagrama funcional do ciclo (não é ilustração): curva orgânica fechada, não
 * escada; mostra as fases marcadas pela pessoa e também as descreve em texto.
 */
export function CycleDiagram({ phases, marked }: { phases: { id: string; text: string }[]; marked: string[] }) {
  const ids = useKitIds();
  const count = Math.max(phases.length, 1);
  const point = (index: number) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return [150 + 112 * Math.cos(angle), 118 + 82 * Math.sin(angle)] as const;
  };
  return <KitFrame label={`Ciclo com ${phases.length} momentos. Marcados: ${phases.filter(item => marked.includes(item.id)).map(item => item.text).join(", ") || "nenhum"}.`} viewBox="0 0 300 236" className="fv-illustration fv-cycle">
    <KitDefs ids={ids} seed={count} />
    <ellipse cx={150} cy={118} rx={112} ry={82} fill="none" stroke={C.nevoa} strokeWidth={3} filter={`url(#${ids.borda})`} />
    {phases.map((phase, index) => {
      const [x, y] = point(index); const on = marked.includes(phase.id);
      return <g key={phase.id}>
        {on && <Stain cx={x} cy={y} rx={17} color="broto" opacity={0.75} filter={ids.aquarela} />}
        <circle cx={x} cy={y} r={on ? 9 : 6} fill={on ? C.raiz : C.creme} stroke={C.raiz} strokeWidth={2} />
        <text x={x} y={y + (y > 118 ? 24 : -14)} textAnchor="middle" fontSize={10} fontWeight={on ? 700 : 500} fill={on ? C.raiz : C.pedra}>{phase.text.length > 18 ? `${phase.text.slice(0, 17)}…` : phase.text}</text>
      </g>;
    })}
  </KitFrame>;
}
