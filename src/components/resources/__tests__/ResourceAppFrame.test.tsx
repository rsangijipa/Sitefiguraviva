import { render, screen } from "@testing-library/react";
import ResourceAppFrame from "../ResourceAppFrame";

describe("ResourceAppFrame", () => {
  it("renders a shared loading state before the resource is ready", () => {
    render(
      <ResourceAppFrame title="SomaScan" status="loading">
        <p>Conteúdo interno</p>
      </ResourceAppFrame>,
    );

    expect(
      screen.getByRole("status", { name: "Carregando SomaScan" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo interno")).not.toBeInTheDocument();
  });

  it("renders a retryable error state", () => {
    render(
      <ResourceAppFrame
        title="Banco de Quizzes"
        status="error"
        errorMessage="Não foi possível abrir o recurso."
        onRetry={() => undefined}
      >
        <p>Conteúdo interno</p>
      </ResourceAppFrame>,
    );

    expect(
      screen.getByText("Não foi possível abrir o recurso."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo interno")).not.toBeInTheDocument();
  });
});
