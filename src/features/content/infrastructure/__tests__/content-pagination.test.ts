const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));
import {
  listPublishedContent,
  listPublishedContentPage,
} from "../supabaseContentRepository";

function fixture(rows: any[], error: unknown = null) {
  const range = jest.fn((start: number, end: number) =>
    Promise.resolve({ data: rows.slice(start, end + 1), error }),
  );
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range,
  };
  from.mockReturnValue(query);
  return query;
}
it("bounds the preview and orders identical dates by a unique id", async () => {
  const query = fixture(
    Array.from({ length: 20 }, (_, id) => ({
      id: String(id),
      title: "Item",
      is_published: true,
    })),
  );
  expect(await listPublishedContent("posts", { limit: 3 })).toHaveLength(3);
  expect(query.range).toHaveBeenCalledWith(0, 2);
  expect(query.order).toHaveBeenNthCalledWith(1, "created_at", {
    ascending: false,
  });
  expect(query.order).toHaveBeenNthCalledWith(2, "id");
});
it("reaches the last page without truncating or repeating catalog records", async () => {
  fixture(
    Array.from({ length: 27 }, (_, id) => ({
      id: String(id),
      title: "Course",
      is_published: true,
    })),
  );
  const a = await listPublishedContentPage("courses", 0);
  const b = await listPublishedContentPage("courses", 1);
  const c = await listPublishedContentPage("courses", 2);
  expect(a.hasMore).toBe(true);
  expect(b.hasMore).toBe(true);
  expect(c.hasMore).toBe(false);
  expect(
    new Set([...a.items, ...b.items, ...c.items].map((item) => item.id)).size,
  ).toBe(27);
});
it("propagates page failures and rejects invalid ranges before querying", async () => {
  fixture([], new Error("offline"));
  await expect(listPublishedContentPage("courses")).rejects.toThrow("offline");
  from.mockClear();
  await expect(listPublishedContentPage("courses", -1)).rejects.toThrow(
    "Invalid",
  );
  await expect(listPublishedContentPage("courses", 0, 0)).rejects.toThrow(
    "Invalid",
  );
  expect(from).not.toHaveBeenCalled();
});
