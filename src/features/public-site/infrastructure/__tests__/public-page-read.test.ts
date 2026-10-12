jest.mock("server-only", () => ({}));
const query = { select: jest.fn(), eq: jest.fn(), maybeSingle: jest.fn() };
const service = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAnonServerClient: () => ({ from: () => query }),
  createSupabaseServiceClient: () => service(),
}));
import { getPublicPage } from "../supabasePublicPagesRepository.server";
beforeEach(() => {
  jest.clearAllMocks();
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
});
it("reads only published content through the unprivileged client", async () => {
  query.maybeSingle.mockResolvedValue({
    data: { content: { title: "Published" }, is_published: true },
    error: null,
  });
  expect(await getPublicPage("home", { title: "Fallback" })).toEqual({
    title: "Published",
  });
  expect(query.eq).toHaveBeenCalledWith("is_published", true);
  expect(service).not.toHaveBeenCalled();
});
it("does not expose unpublished content even if returned by a mock", async () => {
  query.maybeSingle.mockResolvedValue({
    data: { content: { title: "Draft" }, is_published: false },
    error: null,
  });
  expect(await getPublicPage("home", { title: "Fallback" })).toEqual({
    title: "Fallback",
  });
});
