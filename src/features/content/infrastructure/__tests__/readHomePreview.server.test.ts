const from = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAnonServerClient: () => ({ from }),
}));
import { readHomePreview } from "../readHomePreview.server";

function query(result: unknown, reject = false) {
  const q = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  };
  if (reject) q.limit.mockRejectedValue(result);
  else q.limit.mockResolvedValue(result);
  return q;
}
it("keeps a failed course preview uncached while preserving successful posts", async () => {
  const courses = query({ data: null, error: { code: "offline" } });
  const posts = query({ data: [], error: null });
  from.mockImplementation((kind) => (kind === "courses" ? courses : posts));
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  expect(await readHomePreview()).toEqual({
    courses: undefined,
    posts: [],
    gallery: [],
  });
  expect(courses.limit).toHaveBeenCalledWith(3);
  expect(courses.order).toHaveBeenLastCalledWith("id");
  log.mockRestore();
});
it("distinguishes an empty successful preview from a rejected network request", async () => {
  from.mockImplementation((kind) =>
    kind === "courses"
      ? query({ data: [], error: null })
      : query(new Error("offline"), true),
  );
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  expect(await readHomePreview()).toEqual({
    courses: [],
    posts: undefined,
    gallery: [],
  });
  log.mockRestore();
});
