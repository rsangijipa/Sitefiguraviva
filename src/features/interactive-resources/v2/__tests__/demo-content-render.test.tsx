import { TextEncoder } from "node:util";
import { fireEvent, render, screen } from "@testing-library/react";
import content from "../../../../../supabase/manual/recursos-demo-content.json";
import { ResourceHost, type ResourceSnapshot } from "../ResourceHost";
import { EditorialConfigSchema, type EditorialVersion } from "../editorial-schema";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("next/dynamic", () => () => () => null);
jest.mock("@/components/providers/ThemeProvider", () => ({ useTheme: () => ({ theme: "light", toggle: jest.fn() }) }));
jest.mock("../SaveBar", () => ({ SaveBar: () => null }));

const published = (key: string): EditorialVersion => ({
  id: `00000000-0000-4000-8000-${String(Object.keys(content).indexOf(key)).padStart(12, "0")}`, resourceKey: key, version: 1, status: "published",
  configuration: EditorialConfigSchema.parse(content[key as keyof typeof content]), authoredBy: null,
  reviewerName: null, reviewerCrp: null, reviewedAt: null, updatedAt: "2026-10-13T00:00:00.000Z", reviewNote: null, returnedAt: null, demo: true,
});
const snapshot = (key: string): ResourceSnapshot => ({
  version: published(key), concepts: published("cartas-gestalticas").configuration.items,
  emotions: key === "chegada" ? published("roda-das-emocoes").configuration.items : [],
  needs: key === "chegada" ? published("necessidades-agora").configuration.items : [],
  cases: key === "atelie-do-experimento" ? published("casoteca").configuration.items : [],
});

beforeAll(() => {
  Object.assign(globalThis, { TextEncoder });
  window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }) as unknown as typeof window.matchMedia;
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

it.each(Object.keys(content))("%s mostra o conteúdo de demonstração com o aviso", key => {
  render(<ResourceHost slug={key} snapshot={snapshot(key)} />);
  expect(screen.getByRole("note")).toHaveTextContent("Conteúdo de demonstração · ainda sem revisão docente");
  const start = screen.queryByRole("button", { name: "Iniciar recurso" });
  if (start) fireEvent.click(start);
  expect(screen.queryByRole("heading", { name: "O acervo aguarda revisão docente" })).not.toBeInTheDocument();
});
