import { TextEncoder } from "node:util";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ResourceApprovalBoard } from "../ResourceApprovalBoard";
import { editorialIssues, emptyEditorialConfig, emptyEditorialItem, type EditorialConfig } from "../editorial-schema";
import type { ApprovalVersionDetail, ApprovalVersionSummary, EditorialOverview } from "../approval.actions";

const getEditorialOverview = jest.fn();
const getEditorialVersion = jest.fn();
const returnEditorialVersion = jest.fn();
const transitionEditorialVersion = jest.fn();
jest.mock("../approval.actions", () => ({
  getEditorialOverview: () => getEditorialOverview(),
  getEditorialVersion: (id: string) => getEditorialVersion(id),
  returnEditorialVersion: (input: unknown) => returnEditorialVersion(input),
  saveEditorialRole: jest.fn(), removeEditorialRole: jest.fn(),
}));
jest.mock("../editorial.actions", () => ({ transitionEditorialVersion: (input: unknown) => transitionEditorialVersion(input) }));

const complete: EditorialConfig = {
  ...emptyEditorialConfig("chegada"),
  items: [{ ...emptyEditorialItem("guidance", "item-1"), title: "Orientação neutra", text: "Texto neutro de teste" }],
};
const summary = (patch: Partial<ApprovalVersionSummary>): ApprovalVersionSummary => ({
  id: "00000000-0000-4000-8000-000000000001", version: 1, status: "draft", updatedAt: "2026-10-12T10:00:00.000Z", itemCount: 1, issues: [],
  authorName: "Autoria fictícia", reviewerName: null, reviewerCrp: null, reviewedAt: null, reviewNote: null, returnedAt: null, ...patch,
});
const overview = (team: EditorialOverview["team"] = []): EditorialOverview => ({
  team,
  resources: [
    { key: "chegada", title: "Chegada", category: "PERCEBER", access: "public", visibility: "published", published: null,
      inProgress: [summary({ status: "reviewed", reviewerName: "Revisão fictícia", reviewerCrp: "00/0000", reviewedAt: "2026-10-12T11:00:00.000Z" })] },
    { key: "igarape", title: "Igarapé", category: "PAUSAR", access: "public", visibility: "published", published: null, inProgress: [] },
  ],
});
const detail: ApprovalVersionDetail = {
  id: "00000000-0000-4000-8000-000000000001", resourceKey: "chegada", version: 1, status: "reviewed", configuration: complete,
  authoredBy: "00000000-0000-4000-8000-000000000003", reviewerName: "Revisão fictícia", reviewerCrp: "00/0000", reviewedAt: "2026-10-12T11:00:00.000Z",
  updatedAt: "2026-10-12T11:00:00.000Z", reviewNote: null, returnedAt: null, authorName: "Autoria fictícia", issues: [],
};

beforeAll(() => {
  Object.assign(globalThis, { TextEncoder });
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
beforeEach(() => { jest.clearAllMocks(); getEditorialVersion.mockResolvedValue({ ok: true, data: detail }); });

describe("editorialIssues", () => {
  it("lists every missing requirement instead of stopping at the first", () => {
    const item = { ...emptyEditorialItem("card", "c-1"), title: "Carta", text: "", asset: "/brand/carta.png" };
    expect(editorialIssues({ ...emptyEditorialConfig("cartas-gestalticas"), items: [item] })).toEqual([
      "Carta: falta texto docente.", "Carta: falta referência bibliográfica.", "Carta: arte sem licença.", "Carta: arte sem curadoria registrada.",
    ]);
    expect(editorialIssues(complete)).toEqual([]);
  });
});

describe("ResourceApprovalBoard", () => {
  it("summarizes stages, warns about a missing editorial team and queues signed versions first", async () => {
    getEditorialOverview.mockResolvedValue({ ok: true, data: overview() });
    render(<ResourceApprovalBoard />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Falta um docente revisor.");
    const queue = screen.getByRole("region", { name: "Fila de aprovação" });
    expect(within(queue).getByText("Chegada")).toBeInTheDocument();
    expect(within(queue).getByRole("button", { name: "Analisar e publicar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Prontas para publicar/ })).toHaveTextContent(/^1Prontas/);
    expect(screen.getByRole("button", { name: /Sem conteúdo/ })).toHaveTextContent(/^1Sem/);
    expect(screen.getByText("Criar a primeira versão e atribuir autoria docente.")).toBeInTheDocument();
  });

  it("only publishes after the administrator confirms the review", async () => {
    getEditorialOverview.mockResolvedValue({ ok: true, data: overview() });
    transitionEditorialVersion.mockResolvedValue({ ok: true, data: { ...detail, status: "published" } });
    render(<ResourceApprovalBoard />);
    fireEvent.click(await screen.findByRole("button", { name: "Analisar e publicar" }));
    const dialog = await screen.findByRole("dialog", { name: "Chegada · versão 1" });
    expect(within(dialog).getByText("Texto neutro de teste")).toBeInTheDocument();
    const publish = within(dialog).getByRole("button", { name: "Publicar versão" });
    expect(publish).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Conferi o conteúdo e a assinatura" }));
    fireEvent.click(publish);
    await waitFor(() => expect(transitionEditorialVersion).toHaveBeenCalledWith(expect.objectContaining({ action: "publish", versionId: detail.id })));
    expect(await within(dialog).findByRole("status")).toHaveTextContent("Versão publicada.");
  });

  it("returns a version to authoring only with a written note", async () => {
    getEditorialOverview.mockResolvedValue({ ok: true, data: overview() });
    returnEditorialVersion.mockResolvedValue({ ok: true, data: { ...detail, status: "draft", reviewNote: "Conferir a referência." } });
    render(<ResourceApprovalBoard />);
    fireEvent.click(await screen.findByRole("button", { name: "Analisar e publicar" }));
    const dialog = await screen.findByRole("dialog", { name: "Chegada · versão 1" });
    await within(dialog).findByText("Texto neutro de teste");
    fireEvent.click(within(dialog).getByRole("button", { name: "Devolver para ajustes" }));
    const confirm = within(dialog).getByRole("button", { name: "Confirmar devolução" });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText("O que a autoria precisa ajustar?"), { target: { value: "Conferir a referência." } });
    fireEvent.click(confirm);
    await waitFor(() => expect(returnEditorialVersion).toHaveBeenCalledWith(expect.objectContaining({ note: "Conferir a referência.", versionId: detail.id })));
  });
});
