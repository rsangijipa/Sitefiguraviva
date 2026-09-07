import { getAuthIntent, getSafeNextPath } from "../auth-intent";

describe("authentication intent", () => {
  it("derives admin context from the destination", () => {
    expect(getAuthIntent(new URLSearchParams("next=%2Fadmin"))).toBe("admin");
  });

  it("rejects external redirects", () => {
    expect(getSafeNextPath("//evil.example", "student")).toBe("/portal");
  });

  it("keeps students outside administrative routes", () => {
    expect(getSafeNextPath("/admin", "student")).toBe("/portal");
  });

  it("allows administrators to continue to the panel", () => {
    expect(getSafeNextPath("/admin", "admin")).toBe("/admin");
  });
});
