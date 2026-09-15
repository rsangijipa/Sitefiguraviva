import { isAdminEmail, getRedirectPathForRole } from "../authService";

describe("admin email verification and routing", () => {
  it("identifies liliangusmao@figuraviva.com as admin", () => {
    expect(isAdminEmail("liliangusmao@figuraviva.com")).toBe(true);
  });

  it("handles case insensitivity and whitespace for admin email", () => {
    expect(isAdminEmail("  LilianGusmao@figuraViva.com ")).toBe(true);
    expect(isAdminEmail("LILIANGUSMAO@FIGURAVIVA.COM")).toBe(true);
  });

  it("identifies non-admin emails correctly", () => {
    expect(isAdminEmail("aluno@exemplo.com")).toBe(false);
    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("redirects admin email directly to /admin regardless of assigned role", () => {
    expect(
      getRedirectPathForRole("student", "liliangusmao@figuraviva.com"),
    ).toBe("/admin");
    expect(
      getRedirectPathForRole(undefined, "liliangusmao@figuraviva.com"),
    ).toBe("/admin");
  });

  it("redirects standard roles appropriately", () => {
    expect(getRedirectPathForRole("admin")).toBe("/admin");
    expect(getRedirectPathForRole("tutor")).toBe("/admin");
    expect(getRedirectPathForRole("student")).toBe("/portal");
    expect(getRedirectPathForRole(undefined, "aluno@exemplo.com")).toBe(
      "/portal",
    );
  });
});
