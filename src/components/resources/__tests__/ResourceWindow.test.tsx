import { fireEvent, render, screen } from "@testing-library/react";
import { ResourceWindow } from "../ResourceWindow";

it("renders one named resource dialog and closes from either global control", () => {
  const onClose = jest.fn();

  render(
    <ResourceWindow isOpen title="SomaScan" onClose={onClose}>
      <div>app</div>
    </ResourceWindow>,
  );

  expect(screen.getByRole("dialog", { name: "SomaScan" })).toBeInTheDocument();
  expect(
    screen.getByRole("dialog").querySelector('[class*="max-h-"]'),
  ).toHaveClass("max-h-[90vh]");
  expect(
    screen.getAllByRole("button", { name: /voltar|fechar/i }),
  ).toHaveLength(2);

  fireEvent.click(screen.getByRole("button", { name: "Fechar SomaScan" }));

  expect(onClose).toHaveBeenCalledTimes(1);
});
