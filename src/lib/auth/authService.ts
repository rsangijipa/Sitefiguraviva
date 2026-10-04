export type UserRole = "admin" | "tutor" | "student";

/** Authorization comes exclusively from the persisted profile role. */
export function normalizeUserRole(role: unknown): UserRole | null {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (normalized === "administrador") return "admin";
  return normalized === "admin" ||
    normalized === "tutor" ||
    normalized === "student"
    ? normalized
    : null;
}

/**
 * Determines the redirect path from the persisted profile role.
 * Centralizes the routing logic for the unified auth flow.
 */
export function getRedirectPathForRole(role?: string): string {
  switch (normalizeUserRole(role)) {
    case "admin":
      return "/admin";
    case "tutor":
      return "/admin"; // Operators/Tutors also use the admin panel (usually with restricted views)
    case "student":
    default:
      return "/portal";
  }
}
