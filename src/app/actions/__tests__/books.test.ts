const admin = jest.fn();
const write = jest.fn();
jest.mock("@/lib/auth/server", () => ({ requireAdmin: () => admin() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      update: (payload: unknown) => ({ eq: () => write(payload) }),
      insert: (payload: unknown) => write(payload),
      select: () => Promise.resolve({ count: 2, error: null }),
    }),
  }),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import { saveBookAction } from "../books";
import { revalidatePath } from "next/cache";
const input = {
  title: "Gestalt-terapia",
  author: "Perls, Hefferline e Goodman",
  coverImageUrl: "https://example.com/authorized-test-cover.jpg",
  coverStoragePath: "covers/test.jpg",
  purchaseUrl: "https://example.com/catalog-test",
  publicationYear: null,
};
beforeEach(() => {
  jest.clearAllMocks();
  admin.mockResolvedValue({ uid: "admin" });
  write.mockResolvedValue({ error: null });
});
it("preserves the category when an existing caller omits it", async () => {
  expect((await saveBookAction("book", input)).success).toBe(true);
  expect(write.mock.calls[0][0]).not.toHaveProperty("category");
  expect(revalidatePath).toHaveBeenCalledWith("/estante");
});
it("stores only the category entered by the curator", async () => {
  expect(
    (await saveBookAction("book", { ...input, category: "  Gestalt  " }))
      .success,
  ).toBe(true);
  expect(write.mock.calls[0][0]).toHaveProperty("category", "Gestalt");
});
it("supports removing the category without changing publication or sort order", async () => {
  await saveBookAction("book", { ...input, category: "" });
  expect(write.mock.calls[0][0]).toHaveProperty("category", null);
  expect(write.mock.calls[0][0]).not.toHaveProperty("is_published");
  expect(write.mock.calls[0][0]).not.toHaveProperty("sort_order");
});
it("keeps new books as drafts and preserves the order contract", async () => {
  await saveBookAction(null, { ...input, category: "Gestalt" });
  expect(write.mock.calls[0][0]).toMatchObject({
    is_published: false,
    sort_order: 3,
    category: "Gestalt",
  });
});
it("rejects writes without administrator authorization", async () => {
  admin.mockRejectedValueOnce(new Error("Forbidden"));
  const output = jest.spyOn(console, "error").mockImplementation(() => {});
  expect((await saveBookAction("book", input)).success).toBe(false);
  expect(write).not.toHaveBeenCalled();
  output.mockRestore();
});
