"use client";
import type { KeyboardEvent } from "react";
import type { BODY_REGIONS, BodyPoint } from "../contracts";
import { C, KitDefs, Stain, useKitIds } from "./kit";

type Region = typeof BODY_REGIONS[number];
/**
 * Silhueta neutra (seção 7.6): linha contínua de 2 px em Verde Raiz, sem
 * marcação de gênero. Cada região é botão com foco visível; a marcação é uma
 * mancha cujo tamanho indica a intensidade 1–5, sempre com o número ao lado.
 * A lista HTML do seletor continua sendo a alternativa completa.
 */
const OUTLINE = "M100 18 C116 18 124 30 124 44 C124 58 116 68 100 68 C84 68 76 58 76 44 C76 30 84 18 100 18Z M90 68 V80 M110 68 V80 M90 80 C70 82 58 88 54 100 L44 168 L40 214 M110 80 C130 82 142 88 146 100 L156 168 L160 214 M66 104 L68 200 C70 220 76 232 80 300 L84 392 M134 104 L132 200 C130 220 124 232 120 300 L116 392 M100 236 L96 300 L94 392 M100 236 L104 300 L106 392";
const HITS: Record<Region, { label: string; shapes: [number, number, number, number][] }> = {
  "cabeça": { label: "Cabeça", shapes: [[100, 43, 26, 27]] },
  "pescoço": { label: "Pescoço", shapes: [[100, 75, 14, 8]] },
  ombros: { label: "Ombros", shapes: [[70, 90, 16, 10], [130, 90, 16, 10]] },
  peito: { label: "Peito", shapes: [[100, 118, 30, 22]] },
  "abdômen": { label: "Abdômen", shapes: [[100, 166, 28, 24]] },
  "braços": { label: "Braços", shapes: [[50, 140, 10, 34], [150, 140, 10, 34]] },
  "mãos": { label: "Mãos", shapes: [[40, 222, 11, 13], [160, 222, 11, 13]] },
  quadril: { label: "Quadril", shapes: [[100, 214, 32, 16]] },
  pernas: { label: "Pernas", shapes: [[86, 290, 14, 52], [114, 290, 14, 52]] },
  "pés": { label: "Pés", shapes: [[86, 392, 14, 8], [114, 392, 14, 8]] },
};

export function BodySilhouette({ view, points, current, onSelect }: { view: "frente" | "costas"; points: BodyPoint[]; current: Region; onSelect: (region: Region) => void }) {
  const ids = useKitIds();
  const marked = points.filter(point => point.view === view);
  const key = (region: Region) => (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(region); } };
  return <svg viewBox="0 0 200 410" className="fv-body" role="group" aria-label={`Silhueta do corpo, vista de ${view}`} data-placeholder-art>
    <KitDefs ids={ids} seed={view === "frente" ? 4 : 8} />
    <ellipse cx={100} cy={400} rx={70} ry={8} fill={C.areia} />
    {marked.map(point => HITS[point.region].shapes.map(([x, y], index) =>
      <Stain key={`${point.region}-${index}`} cx={x} cy={y} rx={8 + (point.intensity ?? 1) * 4} color="aurora" opacity={0.55} filter={ids.aquarela} />))}
    <path d={OUTLINE} fill="none" stroke={C.raiz} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    {view === "costas" && <path d="M100 84 V230" stroke={C.raiz} strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" opacity={0.6} />}
    {(Object.keys(HITS) as Region[]).map(region => {
      const point = marked.find(item => item.region === region);
      return <g key={region} role="button" tabIndex={0} aria-pressed={current === region} className="fv-body-region"
        aria-label={`${HITS[region].label}${point ? `: ${point.sensation}, intensidade ${point.intensity ?? 1} de 5` : ""}`}
        onClick={() => onSelect(region)} onKeyDown={key(region)}>
        {HITS[region].shapes.map(([x, y, rx, ry], index) => <ellipse key={index} cx={x} cy={y} rx={rx} ry={ry} fill="transparent"
          stroke={current === region ? C.raiz : "transparent"} strokeWidth={2} strokeDasharray={current === region ? "3 4" : undefined} />)}
        {point && <text x={HITS[region].shapes[0][0] + HITS[region].shapes[0][2] + 6} y={HITS[region].shapes[0][1] + 4} fontSize={12} fontWeight={700} fill={C.mata}>{point.intensity ?? 1}</text>}
      </g>;
    })}
  </svg>;
}
