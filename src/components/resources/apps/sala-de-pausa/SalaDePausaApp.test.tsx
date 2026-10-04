import { fireEvent, render, screen } from "@testing-library/react";
import SalaDePausaApp from "./SalaDePausaApp";

describe("SalaDePausaApp", () => {
  it("offers a complete pause flow with practice selection and back action", () => {
    render(<SalaDePausaApp />);

    // 1. Initial choosing view exposes practice cards
    const observeBtn = screen.getByRole("button", { name: /observar/i });
    expect(observeBtn).toBeInTheDocument();
    fireEvent.click(observeBtn);

    // 2. Start practice
    const startBtn = screen.getByRole("button", { name: /começar pausa/i });
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);

    // 3. Active pause has a switch action back to choosing
    const switchBtn = screen.getByRole("button", {
      name: /escolher outra prática/i,
    });
    expect(switchBtn).toBeInTheDocument();
    fireEvent.click(switchBtn);

    // 4. Returns to practice choice
    expect(
      screen.getByRole("button", { name: /respirar/i }),
    ).toBeInTheDocument();
  });
});
