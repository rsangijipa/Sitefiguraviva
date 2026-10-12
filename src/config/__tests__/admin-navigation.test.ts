import {
  ADMIN_NAVIGATION_GROUPS,
  isAdminRouteActive,
} from "../admin-navigation";

describe("admin navigation", () => {
  it("lists Pessoas in the Pessoas category", () => {
    const people = ADMIN_NAVIGATION_GROUPS.find(
      (group) => group.label === "Pessoas",
    );

    expect(
      people?.items.some((item) => item.path === "/admin/users"),
    ).toBe(true);
  });

  it("keeps a course navigation item active for its nested routes", () => {
    expect(
      isAdminRouteActive("/admin/courses/course-123", "/admin/courses"),
    ).toBe(true);
  });

  it("does not keep the dashboard active on another admin route", () => {
    expect(isAdminRouteActive("/admin/courses", "/admin")).toBe(false);
  });

  it("highlights corrections without also highlighting assessments", () => {
    expect(
      isAdminRouteActive(
        "/admin/assessments/submissions",
        "/admin/assessments/submissions",
      ),
    ).toBe(true);
    expect(
      isAdminRouteActive(
        "/admin/assessments/submissions",
        "/admin/assessments",
      ),
    ).toBe(false);
  });
});
