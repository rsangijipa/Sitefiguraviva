"use client";
import type { KeyboardEvent, ReactNode } from "react";
import { C, KitDefs, KitFrame, Leaf, Ramo, Stain, useKitIds, type KitColor } from "./kit";

const activate = (action: () => void) => (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
};

/**
 * A árvore de Rubin (seção 7.3): dois perfis em Creme, frente a frente, sobre
 * Verde Raiz. O espaço entre eles é o tronco, coroado pela copa em aquarela.
 */
export function RubinTree({ className }: { className?: string }) {
  const ids = useKitIds();
  const profile = "M0 0 C0 40 4 62 18 78 C10 86 12 96 22 100 C16 106 18 112 26 114 C22 122 26 130 36 132 C40 150 30 168 40 196 L0 196Z";
  return <KitFrame label="Árvore de Rubin: dois perfis frente a frente; o espaço entre eles forma o tronco de uma árvore com a copa colorida." viewBox="0 0 320 260" className={className}>
    <KitDefs ids={ids} seed={11} />
    <rect width={320} height={260} rx={12} fill={C.raiz} />
    <path d={profile} transform="translate(40 64)" fill={C.creme} />
    <path d={profile} transform="translate(280 64) scale(-1 1)" fill={C.creme} />
    <g filter={`url(#${ids.aquarela})`}>
      <ellipse cx={160} cy={66} rx={70} ry={48} fill={C.vazante} />
      <ellipse cx={124} cy={60} rx={40} ry={34} fill={C.aurora} />
      <ellipse cx={198} cy={56} rx={40} ry={34} fill={C.broto} />
    </g>
  </KitFrame>;
}

/** Copa do ritual "Colher uma carta" (seção 7.4): 10 folhas tocáveis. */
export function Canopy({ onPick, still = false, picked }: { onPick: (leaf: number) => void; still?: boolean; picked?: number | null }) {
  const ids = useKitIds();
  const leaves = [[96, 90], [132, 62], [172, 54], [212, 70], [240, 104], [214, 132], [172, 118], [128, 126], [92, 124], [158, 88]] as const;
  // Cada folha contrasta com a mancha onde pousa: rosa à esquerda, amarelo no alto, verde à direita.
  const colors: KitColor[] = ["broto", "broto", "aurora", "aurora", "aurora", "vazante", "aurora", "vazante", "vazante", "igarape"];
  return <svg viewBox="0 0 320 300" className="fv-canopy" data-still={still} role="group" aria-label="Copa: escolha uma folha para colher uma carta" data-placeholder-art>
    <KitDefs ids={ids} seed={5} />
    <Ramo d="M160 290 C158 250 162 210 156 170 M156 190 C140 176 128 168 116 150 M158 200 C176 184 192 176 206 158" color="barro" width={5} />
    <g filter={`url(#${ids.aquarela})`} opacity={0.95}>
      <ellipse cx={120} cy={104} rx={66} ry={54} fill={C.aurora} />
      <ellipse cx={170} cy={82} rx={76} ry={58} fill={C.vazante} />
      <ellipse cx={210} cy={112} rx={62} ry={52} fill={C.broto} />
    </g>
    {leaves.map(([x, y], index) => <g key={index} role="button" tabIndex={0} aria-label={`Folha ${index + 1}`} aria-pressed={picked === index}
      className="fv-canopy-leaf" style={{ animationDelay: `${index * -0.6}s` }} onClick={() => onPick(index)} onKeyDown={activate(() => onPick(index))}>
      <circle cx={x} cy={y} r={24} fill="transparent" />
      <g stroke={C.creme} strokeWidth={1.5}><Leaf x={x} y={y} size={1.45} rotate={(index * 37) % 70 - 35} color={colors[index]} opacity={1} /></g>
      {picked === index && <circle cx={x} cy={y} r={24} fill="none" stroke={C.raiz} strokeWidth={2.5} />}
    </g>)}
  </svg>;
}

type FieldSegment = { id: string; text: string };
const SPOTS = [[90, 80], [210, 70], [150, 150], [70, 190], [235, 185], [150, 40]] as const;
const SHAPES: KitColor[] = ["vazante", "broto", "aurora", "igarape", "barro", "vazante"];
/**
 * Campo de figura e fundo (seção 7.3): cada opção da rodada é um elemento do
 * campo. O escolhido vira figura (opacidade plena e contorno); os demais
 * recuam para o fundo, sem sumir. No modo de texto, os elementos são as frases.
 */
export function FigureField({ segments, selected, onSelect, variant }: { segments: FieldSegment[]; selected: string; onSelect: (id: string) => void; variant: "formas" | "texto" }) {
  const ids = useKitIds();
  return <svg viewBox="0 0 300 230" className="fv-figure-field" role="group" aria-label="Campo perceptivo: escolha o que se torna figura" data-placeholder-art>
    <KitDefs ids={ids} seed={segments.length + 2} />
    <rect width={300} height={230} rx={12} fill={C.areia} />
    {segments.slice(0, SPOTS.length).map((segment, index) => {
      const [x, y] = SPOTS[index];
      const figure = selected === segment.id;
      const ground = !!selected && !figure;
      return <g key={segment.id} role="button" tabIndex={0} aria-label={segment.text} aria-pressed={figure} className="fv-field-element"
        opacity={ground ? 0.32 : 1} onClick={() => onSelect(segment.id)} onKeyDown={activate(() => onSelect(segment.id))}>
        {variant === "formas" ? <>
          <Stain cx={x} cy={y} rx={figure ? 46 : 38} ry={figure ? 38 : 32} rotate={index * 23} color={SHAPES[index]} opacity={0.9} filter={ids.aquarela} />
          {index % 2 === 1 && <Ramo d={`M${x - 30} ${y + 24} C${x - 10} ${y - 10} ${x + 12} ${y + 18} ${x + 30} ${y - 22}`} color="barro" width={2.5} />}
        </> : <>
          <rect x={x - 62} y={y - 18} width={124} height={36} rx={18} fill={figure ? C.raiz : C.creme} stroke={C.nevoa} strokeWidth={1.5} />
          <text x={x} y={y + 5} textAnchor="middle" fontSize={11} fontWeight={figure ? 700 : 500} fill={figure ? C.creme : C.mata}>{segment.text.length > 22 ? `${segment.text.slice(0, 21)}…` : segment.text}</text>
        </>}
        {figure && variant === "formas" && <ellipse cx={x} cy={y} rx={52} ry={44} fill="none" stroke={C.raiz} strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />}
      </g>;
    })}
  </svg>;
}

/** Duas cadeiras em traço Ramo sobre chão Areia; a ativa em Verde Raiz (seção 7.7). */
export function TwoChairs({ active, names }: { active: 0 | 1; names: [string, string] }) {
  const chair = (x: number, flip: boolean, on: boolean) => <g transform={`translate(${x} 0) ${flip ? "scale(-1 1)" : ""}`}>
    <Ramo d="M-28 64 V128 M-28 100 H26 M26 100 V128 M-28 64 C-30 50 -26 44 -18 42" color={on ? "raiz" : "barro"} width={on ? 4 : 3} />
  </g>;
  return <KitFrame label={`Duas cadeiras. Cadeira ativa: ${names[active] || `lado ${active + 1}`}.`} viewBox="0 0 300 160" className="fv-illustration fv-chairs">
    <rect x={10} y={124} width={280} height={24} rx={12} fill={C.areia} />
    <line x1={150} x2={150} y1={40} y2={140} stroke={C.nevoa} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
    {chair(86, false, active === 0)}{chair(214, true, active === 1)}
    <text x={86} y={28} textAnchor="middle" fontSize={12} fontWeight={700} fill={active === 0 ? C.raiz : C.pedra}>{names[0] || "Lado 1"}</text>
    <text x={214} y={28} textAnchor="middle" fontSize={12} fontWeight={700} fill={active === 1 ? C.raiz : C.pedra}>{names[1] || "Lado 2"}</text>
  </KitFrame>;
}

/** Ciclo como curva orgânica fechada, não como escada (seção 1.4 do prompt-mestre). */
export function CycleDiagram({ phases, marked }: { phases: FieldSegment[]; marked: string[] }) {
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

/** Dois campos que se tocam por membrana pontilhada (Fronteiras de Contato). */
export function ContactBoundary() {
  const ids = useKitIds();
  return <KitFrame label="Dois campos de cor que se tocam por uma membrana pontilhada: a fronteira de contato." viewBox="0 0 300 120" className="fv-illustration fv-banner">
    <KitDefs ids={ids} seed={9} />
    <Stain cx={100} cy={60} rx={90} ry={46} color="igarape" opacity={0.8} filter={ids.aquarela} />
    <Stain cx={204} cy={60} rx={90} ry={46} color="vazante" opacity={0.75} filter={ids.aquarela} />
    <path d="M152 12 C140 40 164 80 150 108" fill="none" stroke={C.creme} strokeWidth={3} strokeDasharray="1 8" strokeLinecap="round" />
  </KitFrame>;
}

/** Uma ilustração abstrata por prática da Sala de Pausa (seção 7.7). */
export function PracticeArt({ practice, className }: { practice: string; className?: string }) {
  const ids = useKitIds(); const a = ids.aquarela;
  const art: Record<string, ReactNode> = {
    respirar: <>{[54, 40, 26].map((r, i) => <circle key={r} cx={150} cy={60} r={r} fill={C.broto} opacity={0.14 + i * 0.12} />)}</>,
    observar: <><Stain cx={150} cy={60} rx={70} ry={40} color="areia" opacity={1} filter={a} /><circle cx={150} cy={60} r={9} fill={C.vazante} /><circle cx={150} cy={60} r={22} fill="none" stroke={C.raiz} strokeWidth={1.5} /></>,
    "pelos-sentidos": <>{[70, 110, 150, 190, 230].map((x, i) => <Stain key={x} cx={x} cy={60 + (i % 2 ? 10 : -8)} rx={16} color={(["aurora", "vazante", "broto", "igarape", "barro"] as KitColor[])[i]} opacity={0.85} filter={a} />)}</>,
    ouvir: <>{[0, 1, 2].map(i => <Ramo key={i} d={`M40 ${46 + i * 14} C90 ${30 + i * 14} 120 ${62 + i * 14} 150 ${46 + i * 14} S220 ${30 + i * 14} 260 ${46 + i * 14}`} color={i === 1 ? "raiz" : "nevoa"} width={2.5} />)}</>,
    movimentar: <><Ramo d="M50 96 C90 20 150 110 190 40 S250 60 260 30" color="barro" /><Leaf x={260} y={28} rotate={30} color="broto" /></>,
    desacelerar: <><rect x={20} y={14} width={260} height={92} rx={14} fill={C.igarape} opacity={0.85} />{[40, 26, 12].map(r => <ellipse key={r} cx={150} cy={60} rx={r * 2} ry={r} fill="none" stroke={C.creme} strokeWidth={1.5} opacity={0.5} />)}</>,
  };
  return <KitFrame label="" decorative viewBox="0 0 300 120" className={className ?? "fv-illustration fv-banner"}>
    <KitDefs ids={ids} seed={practice.length} />{art[practice] ?? art.respirar}
  </KitFrame>;
}
