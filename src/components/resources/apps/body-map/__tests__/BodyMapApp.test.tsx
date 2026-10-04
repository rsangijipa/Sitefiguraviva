import { fireEvent, render, screen, within } from "@testing-library/react";
import BodyMapApp from "../BodyMapApp";

it("retains the intensity for each region and summarizes the actual choices", () => {
  render(<BodyMapApp />);
  fireEvent.click(screen.getByRole("button", { name: "tensão", exact: true }));
  fireEvent.change(screen.getByRole("slider"), { target: { value: "4" } });
  fireEvent.click(screen.getByRole("button", { name: "Cabeça", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "calor", exact: true }));
  fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Peito tensão", exact: true }));
  expect(screen.getByRole("slider")).toHaveValue("4");
  fireEvent.click(screen.getByRole("button", { name: "Concluir mapa" }));
  const list = screen.getByRole("list");
  expect(within(list).getByText("tensão · intensidade 4/5")).toBeInTheDocument();
  expect(within(list).getByText("calor · intensidade 1/5")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "O corpo que você percebe agora" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));
  expect(screen.getByRole("slider")).toHaveValue("2");
});
