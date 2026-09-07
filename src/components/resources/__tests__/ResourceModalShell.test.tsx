import { fireEvent, render, screen } from "@testing-library/react";
import ResourceModalShell from "../ResourceModalShell";

describe("ResourceModalShell", () => {
  it("renders a compact dialog with a touch close button", async () => {
    const onClose = jest.fn();

    render(
      <ResourceModalShell open title="Recurso de teste" onClose={onClose}>
        <p>Conteúdo do recurso</p>
      </ResourceModalShell>,
    );

    const dialog = screen.getByRole("dialog", { name: "Recurso de teste" });
    expect(dialog.querySelector(".rounded-\\[2rem\\]")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do recurso")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fechar recurso" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
