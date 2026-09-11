import { fireEvent, render, screen } from "@testing-library/react";
import SalaDePausaApp from "./SalaDePausaApp";

describe("SalaDePausaApp", () => {
  it("offers a complete pause flow with a distinct back action", () => {
    render(<SalaDePausaApp />);

    fireEvent.click(screen.getByRole("button", { name: /Sentir apoio/ }));
    expect(
      screen.getByRole("button", { name: "Voltar às opções" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Concluir esta pausa" }),
    );
    expect(
      screen.getByRole("heading", { name: "A pausa pode terminar aqui." }),
    ).toHaveFocus();

    expect(
      screen.queryByRole("button", { name: "Encerrar recurso" }),
    ).not.toBeInTheDocument();
  });
});
