jest.mock(
  "@/features/content/infrastructure/supabaseContentRepository",
  () => ({
    listPublishedCourses: jest
      .fn()
      .mockRejectedValue(new Error("Supabase unavailable")),
    listPublishedContent: jest
      .fn()
      .mockRejectedValue(new Error("Supabase unavailable")),
  }),
);

import sitemap from "../sitemap";

describe("sitemap", () => {
  it("keeps public static routes available when the catalog is offline", async () => {
    const routes = await sitemap();

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://figuraviva.com.br" }),
        expect.objectContaining({
          url: "https://figuraviva.com.br/public-gallery",
        }),
        expect.objectContaining({
          url: "https://figuraviva.com.br/privacidade",
        }),
      ]),
    );
  });
});
