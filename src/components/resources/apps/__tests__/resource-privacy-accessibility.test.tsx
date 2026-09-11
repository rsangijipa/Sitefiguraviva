import { fireEvent, render, screen } from "@testing-library/react";
import BodyMap from "../soma-scan/components/BodyMap";
import { resourceCatalog } from "../../resourceCatalog";
import {
  deleteDiaryEntry,
  getDiaryEntries,
  saveDiaryEntry,
} from "../fronteiras-de-contato/services/api";
import {
  fetchTelemetryHistory,
  logResourceCompleted,
  logResourceStarted,
} from "../grounding-54321/utils/telemetry";

describe("resource privacy and accessibility contracts", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it("keeps grounding session helpers in memory only", async () => {
    await logResourceStarted("session-1");
    await logResourceCompleted("session-1", 30);

    expect(await fetchTelemetryHistory()).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it("stores diary entries locally without network requests", async () => {
    const saved = await saveDiaryEntry({
      vignetteId: "vignette-1",
      vignetteTitle: "Limites",
      vignetteContext: "Uma situação de contato",
      selectedResponseId: "response-1",
      reflectiveQuestion: "O que você percebe?",
      reflectionText: "Minha reflexão",
      bodyAwareness: "Tensão nos ombros",
    });

    expect(await getDiaryEntries()).toEqual([saved]);
    await deleteDiaryEntry(saved.id);
    expect(await getDiaryEntries()).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("makes every SomaScan body region keyboard operable", () => {
    const onSelectPart = jest.fn();
    render(
      <BodyMap data={{}} selectedPart={null} onSelectPart={onSelectPart} />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(9);
    const head = screen.getByRole("button", { name: "Cabeça" });
    fireEvent.keyDown(head, { key: "Enter" });
    fireEvent.keyDown(head, { key: " " });
    expect(onSelectPart).toHaveBeenNthCalledWith(1, "head");
    expect(onSelectPart).toHaveBeenNthCalledWith(2, "head");
  });

  it("presents the read-only body map as an image", () => {
    render(
      <BodyMap
        data={{}}
        selectedPart={null}
        onSelectPart={jest.fn()}
        readOnly
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Mapa corporal com sensações registradas",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not expose resource administration by default", () => {
    const publicSections = resourceCatalog.flatMap(
      (resource) => resource.sections ?? [],
    );

    expect(publicSections.every((section) => section.id !== "admin")).toBe(
      true,
    );
  });
});
