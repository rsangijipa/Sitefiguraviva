"use client";
import type { ReactNode } from "react";
import type { EditorialItem } from "../editorial-schema";
import { C, KitDefs, KitFrame, Leaf, Ramo, Stain, useKitIds } from "./kit";

/**
 * Uma ilustração por conceito (Design System v1, seção 7.2 do prompt dos
 * Recursos v2). Arte provisória em SVG; a chave do conceito vem do título da
 * carta, com o baralho como reserva, então cartas novas criadas no editor
 * também ganham imagem sem mudança de código.
 */
export type ConceptKey =
  | "awareness" | "aqui-agora" | "autorregulacao" | "suspensao" | "descricao" | "corpo"
  | "eu-tu" | "inclusao" | "presenca" | "introjecao" | "projecao" | "retroflexao"
  | "confluencia" | "deflexao" | "egotismo" | "ajustamento" | "self-id" | "self-ego"
  | "self-personalidade" | "campo" | "fronteira" | "teoria-campo" | "figura-fundo"
  | "vazio-fertil" | "polaridades" | "territorio" | "autoria";

const KEYWORDS: [RegExp, ConceptKey][] = [
  [/awareness|dar-se conta/, "awareness"], [/aqui e agora|presente/, "aqui-agora"],
  [/autorregula/, "autorregulacao"], [/suspend|epoche|pressupost/, "suspensao"], [/descrev|descric/, "descricao"],
  [/corpo/, "corpo"], [/eu-tu|eu tu|buber/, "eu-tu"], [/inclus/, "inclusao"], [/presenca/, "presenca"],
  [/introje/, "introjecao"], [/proje/, "projecao"], [/retrofle/, "retroflexao"], [/conflu/, "confluencia"],
  [/defle/, "deflexao"], [/egotis/, "egotismo"], [/ajustamento/, "ajustamento"],
  [/funcao id|\bid\b/, "self-id"], [/funcao ego|\bego\b/, "self-ego"], [/personalidade/, "self-personalidade"],
  [/teoria de campo|lewin|espaco vital/, "teoria-campo"], [/fronteira/, "fronteira"], [/campo/, "campo"],
  [/figura e fundo|figura-fundo/, "figura-fundo"], [/vazio/, "vazio-fertil"], [/polaridade/, "polaridades"],
  [/krenak|fanon|freire|territ|decolonial/, "territorio"],
];
const DECK_DEFAULT: Record<string, ConceptKey> = {
  fundamentos: "awareness", fenomenologia: "descricao", "relacao-dialogica": "eu-tu", ajustamentos: "ajustamento",
  self: "self-id", campo: "campo", "autoras-autores": "autoria", territorio: "territorio",
};
const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

export function conceptKeyFor(item: Pick<EditorialItem, "title" | "deck">): ConceptKey {
  if (item.deck === "autoras-autores") return "autoria";
  const title = normalize(item.title);
  return KEYWORDS.find(([pattern]) => pattern.test(title))?.[1] ?? DECK_DEFAULT[item.deck] ?? "awareness";
}

/** Iniciais para o retrato tipográfico (cartas de autoria, sem foto). */
function initials(title: string) {
  const words = title.replace(/^di[aá]logo com\s+/i, "").split(/\s+/).filter(word => word.length > 2 || /^[A-Z]/.test(word));
  return (words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "");
}

export function ConceptIllustration({ item, decorative = false, className }: { item: Pick<EditorialItem, "title" | "deck">; decorative?: boolean; className?: string }) {
  const ids = useKitIds();
  const key = conceptKeyFor(item);
  const a = ids.aquarela;
  const scenes: Record<ConceptKey, ReactNode> = {
    awareness: <><Stain cx={150} cy={95} rx={130} ry={70} color="areia" opacity={1} filter={a} />
      {[46, 32, 20].map((r, i) => <circle key={r} cx={150} cy={92} r={r} fill="none" stroke={C.vazante} strokeWidth={1.5} opacity={0.18 + i * 0.12} />)}
      <Stain cx={150} cy={92} rx={11} color="vazante" opacity={1} filter={a} /></>,
    "aqui-agora": <><Ramo d="M30 120 C90 120 120 120 150 92" color="nevoa" />
      <Ramo d="M150 92 C180 120 210 120 270 120" color="nevoa" /><Stain cx={150} cy={90} rx={26} color="vazante" filter={a} />
      <circle cx={150} cy={90} r={4} fill={C.raiz} /></>,
    autorregulacao: <><Stain cx={110} cy={100} rx={46} color="aurora" opacity={0.35} filter={a} /><Stain cx={190} cy={95} rx={52} color="broto" opacity={0.7} filter={a} />
      <Ramo d="M110 100 C140 60 170 60 190 95" color="raiz" /><path d="M184 86 l7 9 -10 3" fill="none" stroke={C.raiz} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></>,
    suspensao: <><Stain cx={150} cy={92} rx={44} color="broto" opacity={0.6} filter={a} />
      <Ramo d="M92 40 C70 70 70 115 92 145" color="raiz" /><Ramo d="M208 40 C230 70 230 115 208 145" color="raiz" /></>,
    descricao: <><Stain cx={78} cy={92} rx={36} color="vazante" opacity={0.75} filter={a} />
      {[60, 82, 104, 126].map((y, i) => <line key={y} x1={140} x2={140 + [120, 96, 110, 70][i]} y1={y} y2={y} stroke={C.pedra} strokeWidth={3} strokeLinecap="round" opacity={0.55} />)}</>,
    corpo: <><Stain cx={150} cy={100} rx={70} ry={60} color="areia" opacity={1} filter={a} />
      <circle cx={150} cy={46} r={14} fill="none" stroke={C.raiz} strokeWidth={2} />
      <path d="M150 60 V122 M126 78 C136 70 164 70 174 78 M150 122 L134 160 M150 122 L166 160" fill="none" stroke={C.raiz} strokeWidth={2} strokeLinecap="round" />
      <Stain cx={150} cy={88} rx={13} color="aurora" opacity={0.8} filter={a} /></>,
    "eu-tu": <><Stain cx={150} cy={92} rx={30} ry={52} color="vazante" opacity={0.9} filter={a} />
      <Stain cx={92} cy={92} rx={40} ry={52} color="igarape" opacity={0.85} filter={a} /><Stain cx={208} cy={92} rx={40} ry={52} color="barro" opacity={0.8} filter={a} /></>,
    inclusao: <><circle cx={124} cy={92} r={52} fill={C.igarape} opacity={0.35} /><circle cx={176} cy={92} r={52} fill={C.barro} opacity={0.3} />
      <circle cx={124} cy={92} r={52} fill="none" stroke={C.igarape} strokeWidth={2} /><circle cx={176} cy={92} r={52} fill="none" stroke={C.barro} strokeWidth={2} /></>,
    presenca: <><Stain cx={150} cy={95} rx={56} ry={50} color="broto" opacity={0.75} filter={a} />
      <circle cx={150} cy={95} r={70} fill="none" stroke={C.raiz} strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" /></>,
    introjecao: <><Stain cx={150} cy={92} rx={90} ry={66} color="broto" opacity={0.55} filter={a} />
      <rect x={124} y={68} width={52} height={48} rx={4} fill={C.barro} opacity={0.9} /><rect x={124} y={68} width={52} height={48} rx={4} fill="none" stroke={C.mata} strokeWidth={2} /></>,
    projecao: <><Stain cx={96} cy={92} rx={42} color="aurora" opacity={0.9} filter={a} /><Stain cx={210} cy={96} rx={58} ry={50} color="nevoa" opacity={1} filter={a} />
      <Stain cx={214} cy={98} rx={30} color="aurora" opacity={0.4} filter={a} /><Ramo d="M138 92 C160 80 178 84 190 92" color="pedra" width={2} strokeDasharray="4 6" /></>,
    retroflexao: <><Stain cx={96} cy={120} rx={22} color="raiz" opacity={0.85} filter={a} />
      <Ramo d="M96 120 C120 40 230 30 236 92 C240 140 160 150 104 126" color="barro" /></>,
    confluencia: <><Stain cx={124} cy={92} rx={64} ry={54} color="aurora" opacity={0.7} filter={a} /><Stain cx={176} cy={92} rx={64} ry={54} color="broto" opacity={0.6} filter={a} /></>,
    deflexao: <><Stain cx={226} cy={92} rx={50} color="igarape" opacity={0.75} filter={a} />
      <Ramo d="M30 130 C100 120 150 104 168 92 C176 86 170 60 150 36" color="barro" /></>,
    egotismo: <><Stain cx={150} cy={92} rx={34} color="vazante" opacity={0.9} filter={a} />
      <rect x={98} y={42} width={104} height={100} rx={8} fill="none" stroke={C.mata} strokeWidth={2} /><rect x={110} y={54} width={80} height={76} rx={6} fill="none" stroke={C.pedra} strokeWidth={1.5} /></>,
    ajustamento: <><rect x={128} y={70} width={44} height={70} rx={6} fill={C.nevoa} />
      <Ramo d="M40 150 C90 150 110 60 150 52 C190 44 210 120 250 104" color="barro" /><Leaf x={250} y={96} size={1.2} rotate={30} color="broto" /><Leaf x={240} y={88} size={0.9} rotate={-30} color="vazante" /></>,
    "self-id": <><Stain cx={150} cy={100} rx={70} ry={58} color="aurora" opacity={0.35} filter={a} /><Stain cx={150} cy={112} rx={30} color="aurora" opacity={0.85} filter={a} />
      <Ramo d="M150 112 C146 86 156 66 150 44" color="barro" width={2} /></>,
    "self-ego": <><Stain cx={110} cy={96} rx={40} color="broto" opacity={0.75} filter={a} /><Stain cx={200} cy={96} rx={40} color="nevoa" opacity={0.9} filter={a} />
      <Ramo d="M150 40 V150" color="raiz" /><circle cx={150} cy={96} r={6} fill={C.raiz} /></>,
    "self-personalidade": <>{[70, 52, 34].map((r, i) => <circle key={r} cx={150} cy={94} r={r} fill={[C.areia, C.vazante, C.broto][i]} opacity={[1, 0.6, 0.75][i]} />)}
      <circle cx={150} cy={94} r={70} fill="none" stroke={C.raiz} strokeWidth={1.5} /></>,
    campo: <><rect x={20} y={20} width={260} height={144} rx={10} fill={C.areia} />
      <Stain cx={130} cy={98} rx={34} color="raiz" opacity={0.85} filter={a} /><Stain cx={200} cy={86} rx={58} ry={46} color="broto" opacity={0.35} filter={a} />
      <Stain cx={84} cy={60} rx={30} color="vazante" opacity={0.45} filter={a} /></>,
    fronteira: <><Stain cx={100} cy={92} rx={78} ry={66} color="igarape" opacity={0.85} filter={a} /><Stain cx={204} cy={92} rx={78} ry={66} color="vazante" opacity={0.8} filter={a} />
      <path d="M152 26 C140 60 164 120 150 160" fill="none" stroke={C.creme} strokeWidth={3} strokeDasharray="1 8" strokeLinecap="round" /></>,
    "teoria-campo": <>{[[60, 50], [120, 130], [180, 60], [240, 120], [150, 96]].map(([x, y], i, list) => <g key={i}>
      {list.slice(i + 1).map(([x2, y2], j) => <line key={j} x1={x} y1={y} x2={x2} y2={y2} stroke={C.pedra} strokeWidth={1.5} opacity={0.4} />)}
      <circle cx={x} cy={y} r={8} fill={[C.raiz, C.barro, C.igarape, C.raiz, C.barro][i]} /></g>)}</>,
    "figura-fundo": <><rect x={40} y={20} width={220} height={144} rx={10} fill={C.raiz} />
      <path d="M150 164 V104" stroke={C.creme} strokeWidth={10} strokeLinecap="round" />
      <path d="M96 164 C112 140 98 128 112 112 C122 100 112 88 124 80 L124 164Z M204 164 C188 140 202 128 188 112 C178 100 188 88 176 80 L176 164Z" fill={C.creme} />
      <Stain cx={150} cy={70} rx={40} ry={34} color="vazante" opacity={1} filter={a} /><Stain cx={130} cy={62} rx={22} color="aurora" opacity={1} filter={a} /><Stain cx={170} cy={60} rx={22} color="broto" opacity={1} filter={a} /></>,
    "vazio-fertil": <><rect x={20} y={20} width={260} height={144} rx={10} fill={C.areia} /><Stain cx={262} cy={150} rx={28} color="broto" opacity={0.8} filter={a} /></>,
    polaridades: <><defs><linearGradient id={`${ids.base}-pol`} x1="0" x2="1"><stop stopColor={C.aurora} /><stop offset="0.5" stopColor={C.vazante} /><stop offset="1" stopColor={C.broto} /></linearGradient></defs>
      <rect x={60} y={86} width={180} height={12} rx={6} fill={`url(#${ids.base}-pol)`} opacity={0.75} />
      <Stain cx={56} cy={92} rx={34} color="aurora" opacity={0.95} filter={a} /><Stain cx={244} cy={92} rx={34} color="broto" opacity={0.95} filter={a} /></>,
    territorio: <><Stain cx={150} cy={64} rx={110} ry={34} color="broto" opacity={0.45} filter={a} />
      <path d="M20 128 C80 112 120 146 180 128 S260 114 280 124 V164 H20Z" fill={C.igarape} opacity={0.85} />
      <Ramo d="M60 128 C62 100 54 86 62 66" color="barro" /><Leaf x={62} y={62} rotate={-10} color="broto" /><Leaf x={70} y={78} size={0.8} rotate={40} color="vazante" /></>,
    autoria: <><rect x={20} y={20} width={260} height={144} rx={10} fill={C.areia} />
      <text x={150} y={112} textAnchor="middle" fontFamily="var(--font-serif), Georgia, serif" fontWeight={600} fontSize={64} fill={C.raiz}>{initials(item.title)}</text>
      <line x1={110} x2={190} y1={132} y2={132} stroke={C.barro} strokeWidth={2} strokeLinecap="round" /></>,
  };
  return <KitFrame label={`Ilustração: ${item.title}`} decorative={decorative} className={className}>
    <KitDefs ids={ids} seed={key.length} />{scenes[key]}
  </KitFrame>;
}
