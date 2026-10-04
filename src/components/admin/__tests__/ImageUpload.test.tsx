jest.mock("@/infrastructure/supabase/storage.client", () => ({
  uploadAdminAsset: jest.fn(),
}));
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import ImageUpload from "../ImageUpload";
import { uploadAdminAsset } from "@/infrastructure/supabase/storage.client";
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});
it("keeps each mediator upload associated with its own file input", async () => {
  jest.mocked(uploadAdminAsset).mockResolvedValue({
    url: "/ana.jpg",
    path: "mediators/ana",
    name: "ana.jpg",
    size: "1 KB",
  });
  const first = jest.fn(),
    second = jest.fn();
  const { container } = render(
    <>
      <ImageUpload onUpload={first} />
      <ImageUpload onUpload={second} />
    </>,
  );
  const inputs =
    container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  expect(inputs[0].id).not.toBe(inputs[1].id);
  const labels = container.querySelectorAll("label");
  expect(labels[1].htmlFor).toBe(inputs[1].id);
  fireEvent.change(inputs[1], {
    target: { files: [new File(["photo"], "ana.jpg", { type: "image/jpeg" })] },
  });
  await waitFor(() =>
    expect(second).toHaveBeenCalledWith("/ana.jpg", "mediators/ana"),
  );
  expect(first).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
});
it("restores the saved portrait when an upload fails", async () => {
  jest
    .mocked(uploadAdminAsset)
    .mockRejectedValue(new Error("Imagem inválida."));
  const onUpload = jest.fn(),
    busy = jest.fn();
  const { container } = render(
    <ImageUpload onUpload={onUpload} onUploadingChange={busy} />,
  );
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [new File(["photo"], "ana.jpg", { type: "image/jpeg" })] },
  });
  expect(await screen.findByText("Imagem inválida.")).toBeInTheDocument();
  expect(onUpload).not.toHaveBeenCalled();
  expect(busy).toHaveBeenLastCalledWith(false);
});

it("does not request inaccessible legacy Firebase portraits", () => {
  const { container } = render(
    <ImageUpload
      onUpload={jest.fn()}
      defaultImage="https://storage.googleapis.com/lithe-transport-479116-m2.firebasestorage.app/mediator.jpg"
    />,
  );
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
});

it("keeps the photo replaceable when a remote image cannot load", async () => {
  const { container } = render(
    <ImageUpload
      onUpload={jest.fn()}
      defaultImage="https://example.supabase.co/storage/v1/object/public/public-avatars/portrait.webp"
    />,
  );
  fireEvent.error(container.querySelector("img")!);
  expect(
    await screen.findByText(
      "Não foi possível carregar a foto. Envie uma nova imagem.",
    ),
  ).toBeInTheDocument();
  expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
});
