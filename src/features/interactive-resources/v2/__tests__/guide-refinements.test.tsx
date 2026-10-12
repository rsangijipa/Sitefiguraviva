import { TextEncoder } from "node:util";
import { fireEvent, render, screen, within } from "@testing-library/react";
import content from "../../../../../supabase/manual/recursos-demo-content.json";
import { EditorialConfigSchema, type EditorialVersion } from "../editorial-schema";
import { PhenomenologyExperience, DialogicalExperience } from "../LearningExperiences";
import { FigureExperience } from "../StudyExperiences";
import { describeBody } from "../PerceptionExperiences";

beforeAll(() => { Object.assign(globalThis, { TextEncoder }); });
const version = (key: keyof typeof content): EditorialVersion => ({
  id: "fixture", resourceKey: key, version: 1, status: "published", configuration: EditorialConfigSchema.parse(content[key]),
  authoredBy: null, reviewerName: null, reviewerCrp: null, reviewedAt: null, updatedAt: "2026-10-13", reviewNote: null, returnedAt: null, demo: true,
});
const base = { emotions: [], needs: [], cases: [], concepts: [], onDraft: jest.fn(), onComplete: jest.fn() };

it("Laboratório: mostra a chave docente só depois e não trata leitura diferente como erro", () => {
  render(<PhenomenologyExperience {...base} mode="laboratorio" version={version("laboratorio-fenomenologico")} />);
  expect(screen.getByRole("heading", { name: "A janela" })).toBeInTheDocument();
  const phrase = screen.getByRole("group", { name: /Classificar: Ela olhou para o chão/ });
  fireEvent.click(within(phrase).getByRole("button", { name: "Observação" }));
  expect(screen.queryByText(/Leitura docente/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ver comentários da docência" }));
  expect(screen.getAllByText(/Leitura docente: Interpretação/)[0].parentElement).toHaveTextContent("Sua leitura foi outra; ela pode ser defensável.");
  for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  expect(screen.getByRole("heading", { name: "Uma possibilidade de descrição" })).toBeInTheDocument();
});

it("Figura e Fundo: na Mesa posta a figura muda com a necessidade escolhida", () => {
  render(<FigureExperience {...base} mode="clinico" version={version("figura-e-fundo")} />);
  for (let round = 0; round < 2; round += 1) fireEvent.click(screen.getByRole("button", { name: "Próxima rodada" }));
  expect(screen.getByRole("heading", { name: "Mesa posta" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Saudade/ }));
  expect(screen.getByText(/costuma virar figura/)).toHaveTextContent("a foto de alguém querido");
});

it("Figura na sessão: cada trecho é marcado como figura ou fundo", () => {
  render(<FigureExperience {...base} mode="sessao" version={version("figura-e-fundo")} />);
  fireEvent.click(screen.getByRole("button", { name: "Próxima rodada" }));
  fireEvent.click(within(screen.getByRole("group", { name: /Camada de: “Ele faria aniversário hoje”/ })).getByRole("button", { name: "Figura" }));
  expect(screen.getByText(/1 de 5 trechos marcados/)).toBeInTheDocument();
});

it("Escuta Dialógica: quatro respostas comentadas e nomeadas, depois da própria resposta", () => {
  render(<DialogicalExperience {...base} mode="escuta" version={version("escuta-dialogica")} />);
  expect(screen.queryByText("Aconselhar")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ver possibilidades comentadas" }));
  for (const kind of ["Interpretar", "Aconselhar", "Refletir", "Incluir"]) expect(screen.getByText(kind)).toBeInTheDocument();
});

it("Mapa do Corpo: fechamento só descreve o que foi marcado", () => {
  expect(describeBody([
    { region: "peito", view: "frente", sensation: "calor", intensity: 3, note: "" },
    { region: "pernas", view: "frente", sensation: "peso", intensity: 2, note: "" },
    { region: "pés", view: "frente", sensation: "não sei", intensity: 1, note: "" },
  ])).toBe("Você notou calor no peito e peso nas pernas.");
});
