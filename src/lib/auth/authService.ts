export type UserRole = "admin" | "tutor" | "student";

export const DEFAULT_ADMIN_EMAILS: readonly string[] = [
  "liliangusmao@figuraviva.com",
];

/**
 * Verifica se um e-mail pertence à lista de administradores da plataforma.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (DEFAULT_ADMIN_EMAILS.includes(normalized)) return true;

  const envEmails =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS;
  if (envEmails) {
    const list = envEmails.split(",").map((e) => e.trim().toLowerCase());
    if (list.includes(normalized)) return true;
  }

  return false;
}

/**
 * Determines the redirect path based on the user's role and email.
 * Centralizes the routing logic for the unified auth flow.
 */
export function getRedirectPathForRole(
  role?: string,
  email?: string | null,
): string {
  if (isAdminEmail(email)) {
    return "/admin";
  }

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
