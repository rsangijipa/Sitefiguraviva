import { render, screen } from "@testing-library/react";
import PublicPageHero from "../components/PublicPageHero";

describe("PublicPageHero", () => {
  it("renders title, description and actions with an accessible heading", () => {
    render(
      <PublicPageHero
        title="Instituto Figura Viva"
        description="Presença e encontro."
        actions={<a href="/formacoes">Conheça as formações</a>}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Instituto Figura Viva",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Presença e encontro.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Conheça as formações" }),
    ).toHaveAttribute("href", "/formacoes");
  });
});
