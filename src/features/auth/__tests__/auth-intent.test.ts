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

  it("redirects administrators directly to /admin even if next points to /portal", () => {
    expect(getSafeNextPath("/portal", "admin")).toBe("/admin");
  });

  it("redirects administrators to /admin subroutes if next is an admin path", () => {
    expect(getSafeNextPath("/admin/courses", "admin")).toBe("/admin/courses");
  });

  it("redirects administrators to /admin when next is empty or missing", () => {
    expect(getSafeNextPath("", "admin")).toBe("/admin");
    expect(getSafeNextPath(null, "admin")).toBe("/admin");
  });
});
