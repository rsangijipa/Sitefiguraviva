import { requireStaff } from "@/lib/auth-server";

/**
 * Strict Guard for Content Authoring Actions.
 * Allows only 'admin' or 'tutor' roles.
 */
export async function assertIsTutorOrAdmin() {
  return await requireStaff();
}
