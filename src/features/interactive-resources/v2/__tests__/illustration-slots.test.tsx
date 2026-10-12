import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { CONCEPT_BRIEFS, SLOTS, conceptSlot } from "../illustration/slots";
import { IllustrationSlot } from "../illustration/IllustrationSlot";
import { ConceptIllustration, conceptKeyFor } from "../illustration/ConceptIllustration";

const manifest = readFileSync(join(process.cwd(), "docs/recursos-v2-ilustracoes.md"), "utf8");
const relative = (path: string) => path.replace("/brand/recursos/", "");

it("o manifesto de ilustrações lista todos os espaços do código", () => {
  for (const key of Object.keys(CONCEPT_BRIEFS).filter(key => key !== "autoria")) expect(manifest).toContain(relative(conceptSlot(key).path));
  for (const slot of [SLOTS.rubin, SLOTS.copa, SLOTS.cadeiras, SLOTS.fronteira]) expect(manifest).toContain(relative(slot.path));
  for (const practice of ["respirar", "observar", "pelos-sentidos", "ouvir", "movimentar", "desacelerar"]) expect(manifest).toContain(relative(SLOTS.practice(practice).path));
});

it("cada carta encontra um conceito com instrução de arte", () => {
  expect(conceptKeyFor({ title: "Introjeção", deck: "ajustamentos" })).toBe("introjecao");
  expect(conceptKeyFor({ title: "Teoria de campo", deck: "campo" })).toBe("teoria-campo");
  expect(conceptKeyFor({ title: "Carta nova sem palavra-chave", deck: "fenomenologia" })).toBe("descricao");
  expect(CONCEPT_BRIEFS[conceptKeyFor({ title: "Retroflexão", deck: "ajustamentos" })]).toBeDefined();
});

it("mostra o espaço vazio identificado enquanto a imagem não existe", () => {
  render(<IllustrationSlot slot={SLOTS.rubin} />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("img", { name: SLOTS.rubin.alt })).toHaveTextContent("Espaço para ilustração");
});

it("cartas de autoria usam retrato tipográfico, sem imagem", () => {
  render(<ConceptIllustration item={{ title: "Laura Perls", deck: "autoras-autores" }} />);
  expect(screen.getByRole("img", { name: "Retrato tipográfico: Laura Perls" })).toHaveTextContent("LP");
});
