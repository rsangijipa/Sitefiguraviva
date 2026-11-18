import { render, screen, fireEvent } from "@testing-library/react";
import { WorldsExperience } from "../universe/WorldsExperience";
import { UNIVERSES } from "../universe/universe-scenes";

jest.mock("../universe/universe-engine", () => ({ webglAvailable: () => false, createUniverse: jest.fn() }));
const props = (mode: string) => ({ mode, version: null, concepts: [], emotions: [], needs: [], cases: [], onDraft: jest.fn(), onComplete: jest.fn() });

describe("Ambientes Imersivos", () => {
  it("troca de ambiente pelo seletor do topo", () => {
    render(<WorldsExperience {...props("casa")} />);
    expect(screen.getAllByRole("tab")).toHaveLength(Object.keys(UNIVERSES).length + 3);
    expect(screen.getByRole("tab", { name: "Casa 3D" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Observatório 3D" }));
    expect(screen.getByRole("tab", { name: "Observatório 3D" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByText(/Observatório das Necessidades/).length).toBeGreaterThan(0);
  });
  it("abre no ambiente do modo e oferece convites sem WebGL", () => {
    render(<WorldsExperience {...props("jardim")} />);
    expect(screen.getByRole("tab", { name: "Jardim 3D" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "O que escuto?" }));
    expect(screen.getByText(/ficar em silêncio/)).toBeTruthy();
  });
  it("alterna configurações e psicoeducação", () => {
    render(<WorldsExperience {...props("ponte")} />);
    const calm = screen.getByRole("button", { name: /Menos estímulos/ });
    fireEvent.click(calm);
    expect(calm.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /Entender/ }));
    expect(screen.getByRole("note").textContent).toMatch(/Escolher envolve/);
  });
});
