import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { logger } from "@/lib/logger";

export type ServerAuthContext = {
  uid: string;
  email?: string;
  role?: string;
  isAdmin: boolean;
  isStaff: boolean;
  isActive: boolean;
  [key: string]: any;
};

function normalizeRole(role: unknown): string {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function isAdminRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "administrador";
}

function isStaffRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return isAdminRole(normalized) || normalized === "tutor";
}

export async function verifySession(): Promise<ServerAuthContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const claims = await getSupabaseSessionClaims(sessionCookie);
    if (!claims) return null;

    return {
      uid: claims.uid,
      email: claims.email,
      role: claims.role,
      isAdmin: claims.admin,
      isStaff: claims.admin || claims.tutor,
      isActive: claims.isActive,
    };
  } catch (error) {
    logger.warn("Session verification failed:", error);
    return null;
  }
}

export async function requireSession(
  redirectTo = "/auth",
): Promise<ServerAuthContext> {
  const claims = await verifySession();

  if (!claims) {
    redirect(redirectTo);
  }

  return claims;
}

export async function requireAdmin(): Promise<ServerAuthContext> {
  const context = await requireSession("/auth?next=/admin");

  if (context.isAdmin) {
    return context;
  }

  logger.warn("[SECURITY] Access denied: missing admin role.", {
    uid: context.uid,
    email: context.email,
    role: context.role,
    isActive: context.isActive,
  });

  redirect("/portal?error=forbidden");
}

export async function requireStaff(): Promise<ServerAuthContext> {
  const context = await requireSession("/auth?next=/admin");

  if (context.isStaff) {
    return context;
  }

  logger.warn("[SECURITY] Access denied: missing staff role.", {
    uid: context.uid,
    email: context.email,
    role: context.role,
    isActive: context.isActive,
  });

  redirect("/portal?error=forbidden");
}
