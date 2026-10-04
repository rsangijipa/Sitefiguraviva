import { getRedirectPathForRole, normalizeUserRole } from "../authService";
describe("profile-based role routing", () => {
  it("normalizes provisioned roles", () => {
    expect(normalizeUserRole(" Administrador ")).toBe("admin");
    expect(getRedirectPathForRole("admin")).toBe("/admin");
    expect(getRedirectPathForRole("tutor")).toBe("/admin");
  });
  it("does not elevate users through admin-address configuration", () => {
    const previous = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "admin@example.com";
    try {
      expect(getRedirectPathForRole("student")).toBe("/portal");
      expect(getRedirectPathForRole(undefined)).toBe("/portal");
      expect(normalizeUserRole("owner")).toBeNull();
    } finally {
      if (previous === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = previous;
    }
  });
});
