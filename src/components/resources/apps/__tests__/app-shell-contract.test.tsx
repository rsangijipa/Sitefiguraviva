import { fireEvent, render, screen } from "@testing-library/react";
import BreathingApp from "../breathing/BreathingApp";
import MentalHealthQuiz from "../mental-health-quiz/MentalHealthQuiz";
import SomaScan from "../soma-scan/App";

const apps = [
  ["BreathingApp", BreathingApp],
  ["MentalHealthQuiz", MentalHealthQuiz],
  ["SomaScan", SomaScan],
] as const;

describe("resource app shell contract", () => {
  it.each(apps)("renders %s within the ResourceWindow height", (_name, App) => {
    const { container } = render(<App />);

    expect(container.firstElementChild).toHaveClass(
      "h-full",
      "min-h-0",
      "w-full",
    );
  });

  it.each([
    ["BreathingApp", BreathingApp],
    ["MentalHealthQuiz", MentalHealthQuiz],
  ] as const)(
    "does not render the global exit in %s's initial view",
    (_name, App) => {
      render(<App onClose={jest.fn()} />);

      expect(
        screen.queryByRole("button", { name: "Voltar" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Fechar Aplicativo" }),
      ).not.toBeInTheDocument();
    },
  );

  it("keeps the quiz's internal Back action", () => {
    render(<MentalHealthQuiz />);

    fireEvent.click(
      screen.getByRole("button", { name: /iniciar auto-avaliação/i }),
    );
    expect(screen.getByText("Questão 1 de 16")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(
      screen.getByRole("heading", { name: /como está a sua saúde mental/i }),
    ).toBeInTheDocument();
  });
});
