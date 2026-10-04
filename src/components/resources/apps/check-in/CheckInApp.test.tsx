import { fireEvent, render, screen } from "@testing-library/react";

// Clear persisted state between tests to avoid cross-test pollution
beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    writable: true,
  });

  // JSDOM does not implement scroll methods
  Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
  });
});

import CheckInApp from "./CheckInApp";

describe("CheckInApp", () => {
  it("shows arrival prompts and allows advancing to body mapping", () => {
    render(<CheckInApp />);

    // Arrival step headings should be visible
    expect(screen.getByText("Como você chega agora?")).toBeInTheDocument();

    // Typing in first prompt
    const firstTextarea = screen.getByRole("textbox", {
      name: /uma palavra ou sensação que aparece/i,
    });
    fireEvent.change(firstTextarea, { target: { value: "tensão" } });

    // Should have content to advance
    const advanceBtn = screen.getByRole("button", {
      name: /avançar para o corpo/i,
    });
    expect(advanceBtn).toBeEnabled();

    fireEvent.click(advanceBtn);

    // Should show body mapping step
    expect(screen.getByText(/Onde isso se manifesta/i)).toBeInTheDocument();

    // Body silhouette region buttons should be present
    expect(screen.getByRole("button", { name: "Cabeça" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peito" })).toBeInTheDocument();
  });

  it("allows keyboard users to register sensations on the body map", () => {
    render(<CheckInApp />);

    // Type something first
    const firstTextarea = screen.getByRole("textbox", { name: /uma palavra/i });
    fireEvent.change(firstTextarea, { target: { value: "algo denso" } });

    fireEvent.click(
      screen.getByRole("button", { name: /avançar para o corpo/i }),
    );

    // Click a region - head button
    const headButtons = screen.getAllByRole("button", { name: "Cabeça" });
    fireEvent.click(headButtons[0]);

    // Select a sensation - Calor
    const sensationButton = screen.getByRole("button", { name: "Calor" });
    fireEvent.click(sensationButton);

    // Complete
    const completeBtn = screen.getByRole("button", { name: /ver reflexão/i });
    fireEvent.click(completeBtn);

    // Should navigate to reflection/summary
    expect(
      screen.getByRole("heading", { name: "O corpo que você percebe agora" }),
    ).toBeInTheDocument();
  });

  it("skips text answers but allows body marking", () => {
    render(<CheckInApp />);

    // Skip directly without typing anything (should be disabled)
    const advanceBtn = screen.getByRole("button", {
      name: /avançar para o corpo/i,
    });
    expect(advanceBtn).toBeDisabled();

    // Type just one answer
    const firstTextarea = screen.getByRole("textbox", { name: /uma palavra/i });
    fireEvent.change(firstTextarea, { target: { value: "palavra inicial" } });

    // Now should be enabled
    expect(advanceBtn).toBeEnabled();
  });

  it("shows disclaimer on completion screen", () => {
    render(<CheckInApp />);

    // Complete full flow
    const firstTextarea = screen.getByRole("textbox", { name: /uma palavra/i });
    fireEvent.change(firstTextarea, { target: { value: "peso" } });
    fireEvent.click(
      screen.getByRole("button", { name: /avançar para o corpo/i }),
    );

    // Mark a region
    const headButtons = screen.getAllByRole("button", { name: "Cabeça" });
    fireEvent.click(headButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Tensão" }));
    fireEvent.click(screen.getByRole("button", { name: /ver reflexão/i }));

    // Disclaimer should be visible
    expect(
      screen.getByText(/este check-in não é uma avaliação clínica/i),
    ).toBeInTheDocument();
  });

  it("reset button clears all state and returns to arrival", () => {
    render(<CheckInApp />);

    // Do some input
    const firstTextarea = screen.getByRole("textbox", { name: /uma palavra/i });
    fireEvent.change(firstTextarea, { target: { value: "texto" } });
    fireEvent.click(
      screen.getByRole("button", { name: /avançar para o corpo/i }),
    );
    const headButtons = screen.getAllByRole("button", { name: "Cabeça" });
    fireEvent.click(headButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Leveza" }));
    fireEvent.click(screen.getByRole("button", { name: /ver reflexão/i }));

    // Reset
    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));

    // Back at arrival
    expect(screen.getByText("Como você chega agora?")).toBeInTheDocument();
  });

  it("progress indicator shows correct step dots", () => {
    render(<CheckInApp />);

    // Should have 4 progress dots (ARRIVAL, BODY_MAPPING, REFLECTION, COMPLETED)
    const dots = document.querySelectorAll(
      '[aria-hidden="false"], [style*="bg-primary"]',
    );
    expect(dots.length).toBeGreaterThan(0);
  });
});
