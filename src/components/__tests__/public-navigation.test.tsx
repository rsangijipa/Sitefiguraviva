import { PUBLIC_NAV_ITEMS } from "@/features/public-site/content/navigation";

describe("public navigation", () => {
  it("contains all public destinations", () => {
    expect(PUBLIC_NAV_ITEMS.map((item) => item.href)).toEqual(
      expect.arrayContaining([
        "/instituto",
        "/instituto/fundadora",
        "/formacoes",
        "/recursos",
        "/public-library",
        "/public-gallery",
        "/blog",
      ]),
    );
  });
});
