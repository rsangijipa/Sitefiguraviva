import {
  ADMIN_NAVIGATION_GROUPS,
  isAdminRouteActive,
} from "../admin-navigation";

describe("admin navigation", () => {
  it("lists applications in the Pessoas category", () => {
    const people = ADMIN_NAVIGATION_GROUPS.find(
      (group) => group.label === "Pessoas",
    );

    expect(
      people?.items.some((item) => item.path === "/admin/applications"),
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
});
