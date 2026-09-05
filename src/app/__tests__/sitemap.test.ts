jest.mock("@/lib/firebase/admin", () => ({
  db: {
    collection: jest.fn(() => {
      throw new Error("Firebase unavailable");
    }),
  },
}));

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
