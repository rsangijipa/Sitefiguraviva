import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MediatorDialog from "../MediatorDialog";
const mediator = {
  name: "Ana",
  role: "Psicóloga",
  image: "/ana.jpg",
  bio: "Formação clínica.\n\nAtuação docente.",
};
it("presents the portrait, role and curriculum in a native scroll region", async () => {
  render(<MediatorDialog mediator={mediator} onClose={jest.fn()} />);
  expect(
    await screen.findByRole("dialog", { name: "Currículo de Ana" }),
  ).toBeInTheDocument();
  expect(screen.getByAltText("Retrato de Ana")).toHaveAttribute(
    "src",
    "/ana.jpg",
  );
  expect(screen.getByText("Formação clínica.")).toBeInTheDocument();
  expect(screen.getByText("Atuação docente.")).toBeInTheDocument();
  expect(screen.getByLabelText("Currículo e trajetória")).toHaveAttribute(
    "data-lenis-prevent",
  );
  expect(screen.getByLabelText("Currículo e trajetória")).toHaveClass(
    "min-h-0",
    "overflow-y-auto",
    "overscroll-contain",
  );
  expect(
    screen.getByRole("button", { name: "Fechar detalhes da mediadora" }),
  ).toHaveClass("border");
});
it("supports Escape, restores focus and locks background scrolling", async () => {
  const opener = document.createElement("button");
  document.body.appendChild(opener);
  opener.focus();
  const close = jest.fn();
  const { unmount } = render(
    <MediatorDialog mediator={mediator} onClose={close} />,
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Fechar detalhes da mediadora" }),
    ).toHaveFocus(),
  );
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(close).toHaveBeenCalled();
  unmount();
  expect(document.body.style.overflow).toBe("");
  expect(opener).toHaveFocus();
  opener.remove();
});
it("shows initials if the portrait cannot load", async () => {
  render(<MediatorDialog mediator={mediator} onClose={jest.fn()} />);
  fireEvent.error(await screen.findByAltText("Retrato de Ana"));
  expect(screen.queryByAltText("Retrato de Ana")).not.toBeInTheDocument();
  expect(screen.getByText("A")).toBeInTheDocument();
});
