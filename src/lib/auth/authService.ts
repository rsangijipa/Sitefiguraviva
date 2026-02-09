export type UserRole = "admin" | "tutor" | "student";

/**
 * Determines the redirect path based on the user's role.
 * Centralizes the routing logic for the unified auth flow.
 */
export function getRedirectPathForRole(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "tutor":
      return "/admin"; // Operators/Tutors also use the admin panel (usually with restricted views)
    case "student":
    default:
      return "/portal";
  }
}
