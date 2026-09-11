import { fireEvent, render, screen } from "@testing-library/react";
import BodyMapApp from "./BodyMapApp";

describe("BodyMapApp", () => {
  it("allows keyboard users to register and review a sensation", () => {
    render(<BodyMapApp />);

    fireEvent.click(screen.getAllByRole("button", { name: "Cabeça" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "calor" }));
    fireEvent.click(screen.getByRole("button", { name: "Concluir mapa" }));

    expect(
      screen.getByRole("heading", { name: "O corpo que você percebe agora" }),
    ).toHaveFocus();
    expect(screen.getByText("Cabeça")).toBeInTheDocument();
    expect(screen.getByText("calor")).toBeInTheDocument();
  });
});
