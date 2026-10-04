const read = jest.fn(),
  write = jest.fn(),
  update = jest.fn(),
  insert = jest.fn(),
  filter = jest.fn();
jest.mock("server-only", () => ({}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: read }) }),
      update: (values: unknown) => {
        update(values);
        const q: any = {
          eq: (...args: unknown[]) => {
            filter(...args);
            return q;
          },
          select: () => ({ maybeSingle: write }),
        };
        return q;
      },
      insert: (values: unknown) => {
        insert(values);
        return { select: () => ({ maybeSingle: write }) };
      },
    }),
  }),
}));
import { patchPublicConfig } from "../supabasePublicPagesRepository.server";
beforeEach(() => {
  jest.clearAllMocks();
  write.mockResolvedValue({ data: { updated_at: "new" }, error: null });
});
it("preserves contact while editing integrations", async () => {
  read.mockResolvedValue({
    data: {
      content: { whatsappNumber: "5569999999999", calendarId: "old" },
      updated_at: "v1",
    },
    error: null,
  });
  await patchPublicConfig({ calendarId: "new" });
  expect(update).toHaveBeenCalledWith(
    expect.objectContaining({
      content: { whatsappNumber: "5569999999999", calendarId: "new" },
    }),
  );
  expect(filter).toHaveBeenCalledWith("updated_at", "v1");
});
it("reloads after concurrent edits and preserves the newly saved contact", async () => {
  read
    .mockResolvedValueOnce({
      data: { content: { whatsappNumber: "old" }, updated_at: "v1" },
      error: null,
    })
    .mockResolvedValueOnce({
      data: { content: { whatsappNumber: "new" }, updated_at: "v2" },
      error: null,
    });
  write.mockResolvedValueOnce({ data: null, error: null });
  await patchPublicConfig({ calendarId: "calendar" });
  expect(update.mock.calls[1][0].content).toEqual({
    whatsappNumber: "new",
    calendarId: "calendar",
  });
});
it("retries concurrent creation without replacing the inserted contact", async () => {
  read
    .mockResolvedValueOnce({ data: null, error: null })
    .mockResolvedValueOnce({
      data: { content: { whatsappNumber: "contact" }, updated_at: "v1" },
      error: null,
    });
  write.mockResolvedValueOnce({ data: null, error: { code: "23505" } });
  await patchPublicConfig({ calendarId: "calendar" });
  expect(update.mock.calls[0][0].content).toEqual({
    whatsappNumber: "contact",
    calendarId: "calendar",
  });
});
it("reports exhausted conflicts without a blind upsert", async () => {
  read.mockResolvedValue({
    data: { content: {}, updated_at: "v1" },
    error: null,
  });
  write.mockResolvedValue({ data: null, error: null });
  await expect(patchPublicConfig({ calendarId: "new" })).rejects.toThrow(
    "alteradas",
  );
  expect(update).toHaveBeenCalledTimes(3);
  expect(insert).not.toHaveBeenCalled();
});
it("does not replace malformed or unreadable content", async () => {
  read.mockResolvedValueOnce({
    data: { content: [], updated_at: "v1" },
    error: null,
  });
  await expect(patchPublicConfig({})).rejects.toThrow("inválida");
  read.mockResolvedValueOnce({ data: null, error: new Error("read failed") });
  await expect(patchPublicConfig({})).rejects.toThrow("read failed");
  expect(update).not.toHaveBeenCalled();
});
