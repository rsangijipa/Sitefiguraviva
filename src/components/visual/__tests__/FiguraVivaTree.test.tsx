import { render, screen } from "@testing-library/react";
import FiguraVivaTree from "../FiguraVivaTree";

describe("FiguraVivaTree", () => {
  it("is decorative by default and exposes a title when provided", () => {
    const { rerender } = render(<FiguraVivaTree />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    rerender(<FiguraVivaTree title="Árvore Figura Viva" />);

    expect(
      screen.getByRole("img", { name: "Árvore Figura Viva" }),
    ).toBeInTheDocument();
  });
});
