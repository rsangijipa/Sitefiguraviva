import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MediatorsEditor from "../MediatorsEditor";
import { listMediatorsAction } from "@/app/actions/admin/mediators";

jest.mock("@/app/actions/admin/mediators", () => ({
  listMediatorsAction: jest.fn(),
}));
const ana = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Ána",
  role: "",
  image: "",
  bio: "",
};
const zelia = {
  ...ana,
  id: "00000000-0000-4000-8000-000000000002",
  name: "Zélia",
};
beforeEach(() => jest.clearAllMocks());

it("orders registered profiles alphabetically and returns selected references", async () => {
  jest.mocked(listMediatorsAction).mockResolvedValue([zelia, ana]);
  const change = jest.fn();
  render(<MediatorsEditor value={[zelia]} onChange={change} />);
  const select = (await screen.findByLabelText(
    "Selecionar mediadores",
  )) as HTMLSelectElement;
  expect(Array.from(select.options, (option) => option.text)).toEqual([
    "Ána",
    "Zélia",
  ]);
  expect(select.options[1].selected).toBe(true);
  select.options[0].selected = true;
  fireEvent.change(select);
  expect(change).toHaveBeenCalledWith([ana, zelia]);
  select.options[0].selected = false;
  select.options[1].selected = false;
  fireEvent.change(select);
  expect(change).toHaveBeenLastCalledWith([]);
});

it("preserves the course selection after a failed load and allows retry", async () => {
  jest
    .mocked(listMediatorsAction)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce([ana]);
  const change = jest.fn();
  render(<MediatorsEditor value={[ana]} onChange={change} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("preservada");
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Selecionar mediadores")).toBeInTheDocument(),
  );
  expect(change).not.toHaveBeenCalled();
});
