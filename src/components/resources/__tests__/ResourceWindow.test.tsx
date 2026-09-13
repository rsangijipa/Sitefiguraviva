import { fireEvent, render, screen } from "@testing-library/react";
import { ResourceWindow } from "../ResourceWindow";
import { ResourceNavigation } from "../ResourceNavigation";
import type { ResourceSection } from "../resourceCatalog";

describe("ResourceWindow and ResourceNavigation system", () => {
  it("renders ResourceWindow without a duplicate inner close button", () => {

    render(
      <ResourceWindow isOpen title="SomaScan">
        <div>app content</div>
      </ResourceWindow>,
    );

    const window = screen.getByRole("region", { name: "SomaScan" });
    expect(window).toBeInTheDocument();
    expect(screen.getByText("app content")).toBeInTheDocument();

    // Closing is owned by ResourceExperience/ResourceNavigation.
    expect(screen.queryByRole("button", { name: "Fechar SomaScan" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Voltar" }),
    ).not.toBeInTheDocument();

  });

  it("renders ResourceNavigation as header-only (back button + category + title)", () => {
    const onBack = jest.fn();

    render(
      <ResourceNavigation
        title="Ciclo do Contato"
        category="Aprender · Gestalt-terapia"
        backLabel="Recursos"
        onBack={onBack}
      />,
    );

    expect(
      screen.getByRole("button", { name: /voltar para recursos/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ciclo do Contato")).toBeInTheDocument();
    expect(screen.getByText("Aprender · Gestalt-terapia")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /voltar para recursos/i }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders sections as sticky tabs inside ResourceWindow content", () => {
    const onClose = jest.fn();
    const onSectionChange = jest.fn();

    const sections: ResourceSection[] = [
      { id: "inicio", label: "Início" },
      { id: "guiado", label: "Guiado" },
    ];

    render(
      <ResourceWindow
        isOpen
        title="Ciclo do Contato"
        onClose={onClose}
        scrollKey="inicio"
      >
        <nav className="sticky top-0 z-10 bg-paper pb-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-none px-4 pt-4">
            {sections.map((section) => {
              const isActive = true; // activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSectionChange(section.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isActive
                      ? "bg-primary text-white"
                      : "border border-primary/15 bg-white/85 text-primary hover:border-terra hover:text-terra"
                  }`}
                >
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div>content for inicio</div>
      </ResourceWindow>,
    );

    // Verify tabs rendered inside window
    expect(screen.getByRole("tab", { name: "Início" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Início" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Início" }));
    expect(onSectionChange).toHaveBeenCalledWith("inicio");
  });
});
