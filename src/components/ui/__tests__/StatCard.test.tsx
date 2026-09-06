import { render, screen } from "@testing-library/react";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  it("renders metric content and accessible link", () => {
    render(<StatCard label="Cursos ativos" value="3" trend="Em andamento" href="/portal/courses" />);
    expect(screen.getByText("Cursos ativos")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/portal/courses");
  });
});
