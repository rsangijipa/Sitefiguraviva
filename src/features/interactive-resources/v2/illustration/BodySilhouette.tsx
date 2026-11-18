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
const OUTLINE = "M100 18 C116 18 124 30 124 44 C124 58 116 68 100 68 C84 68 76 58 76 44 C76 30 84 18 100 18Z M90 68 V78 C75 79 61 86 55 99 L38 198 Q32 213 34 224 Q37 238 44 232 L55 207 L68 124 L69 191 Q65 213 73 238 L78 306 L79 381 L72 393 Q70 402 85 401 L96 397 L98 301 L100 246 L102 301 L104 397 L115 401 Q130 402 128 393 L121 381 L122 306 L127 238 Q135 213 131 191 L132 124 L145 207 L156 232 Q163 238 166 224 Q168 213 162 198 L145 99 C139 86 125 79 110 78 V68";
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
    <path d={OUTLINE} fill={C.areia} fillOpacity={0.25} stroke={C.raiz} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
