import { render, screen } from "@testing-library/react";
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

    expect(container.firstElementChild).toHaveClass("h-full", "min-h-0", "w-full");
  });

  it.each(apps)("does not render a duplicate resource-window exit in %s", (_name, App) => {
    render(<App />);

    expect(screen.queryByRole("button", { name: /^(voltar|fechar|fechar aplicativo)$/i })).not.toBeInTheDocument();
  });
});
