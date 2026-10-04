jest.mock(
  "@/features/content/infrastructure/supabaseContentRepository",
  () => ({ getPublishedCourseByField: jest.fn() }),
);
import { getPublishedCourseByField } from "@/features/content/infrastructure/supabaseContentRepository";
import { getCourseById, getCourseBySlug } from "../courses";
const lookup = jest.mocked(getPublishedCourseByField);
beforeEach(() => jest.resetAllMocks());
it("resolves a canonical ID without falling back or querying a list", async () => {
  const course = { id: "id", title: "Oferta", isPublished: true };
  lookup.mockResolvedValueOnce(course);
  expect(await getCourseById("id")).toBe(course);
  expect(lookup).toHaveBeenCalledTimes(1);
  expect(lookup).toHaveBeenCalledWith("id", "id");
});
it("resolves a slug only after the ID was not found", async () => {
  const course = { id: "id", title: "Oferta", isPublished: true };
  lookup.mockResolvedValueOnce(null).mockResolvedValueOnce(course);
  expect(await getCourseById("slug")).toBe(course);
  expect(lookup).toHaveBeenNthCalledWith(2, "slug", "slug");
});
it("keeps slug lookups exact and propagates service failures", async () => {
  lookup.mockResolvedValueOnce(null);
  expect(await getCourseBySlug("absent")).toBeNull();
  expect(lookup).toHaveBeenCalledWith("slug", "absent");
  lookup.mockRejectedValueOnce(new Error("database unavailable"));
  await expect(getCourseById("id")).rejects.toThrow("database unavailable");
  expect(lookup).toHaveBeenCalledTimes(2);
});
