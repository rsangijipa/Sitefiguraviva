"use client";
import type { EditorialItem } from "../editorial-schema";
import { IllustrationSlot } from "./IllustrationSlot";
import { conceptSlot } from "./slots";

/**
 * Ilustração por conceito (seção 7.2 do guia). A chave vem do título da carta,
 * com o baralho como reserva, então cartas criadas no editor também ganham o
 * espaço certo. Cartas de autoria usam retrato tipográfico, sem imagem.
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

function initials(title: string) {
  const words = title.split(/\s+/).filter(word => word.length > 2);
  return (words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "");
}

export function ConceptIllustration({ item, decorative = false }: { item: Pick<EditorialItem, "title" | "deck">; decorative?: boolean }) {
  const key = conceptKeyFor(item);
  if (key === "autoria") return <div className="fv-author-portrait" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `Retrato tipográfico: ${item.title}`} aria-hidden={decorative || undefined}>
    <span>{initials(item.title)}</span>
  </div>;
  return <IllustrationSlot slot={conceptSlot(key)} decorative={decorative} />;
}
