import {
  getPublicSiteOrigin,
  OFFICIAL_SITE_ORIGIN,
  publicContentPath,
} from "../public-site-url";
const original = process.env.NEXT_PUBLIC_BASE_URL;
afterAll(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
  else process.env.NEXT_PUBLIC_BASE_URL = original;
});
it("uses the confirmed official domain when configuration is absent", () => {
  delete process.env.NEXT_PUBLIC_BASE_URL;
  expect(getPublicSiteOrigin()).toBe(OFFICIAL_SITE_ORIGIN);
});
it.each(["https://preview.example/", "http://localhost:3100/"])(
  "supports configured environments: %s",
  (origin) => {
    process.env.NEXT_PUBLIC_BASE_URL = origin;
    expect(getPublicSiteOrigin()).toBe(new URL(origin).origin);
  },
);
it.each([
  "http://example.com",
  "https://user:pass@example.com",
  "https://example.com/path",
  "https://example.com?token=x",
  "https://example.com#x",
])("rejects ambiguous or unsafe origin: %s", (origin) => {
  process.env.NEXT_PUBLIC_BASE_URL = origin;
  expect(() => getPublicSiteOrigin()).toThrow();
});
it("encodes a slug as a single path segment and falls back to id", () => {
  expect(publicContentPath("curso", { id: "123", slug: " a/b?x " })).toBe(
    "/curso/a%2Fb%3Fx",
  );
  expect(publicContentPath("blog", { id: "123", slug: " " })).toBe("/blog/123");
});
