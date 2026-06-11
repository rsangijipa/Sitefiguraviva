import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase/admin";
import { logger } from "@/lib/logger";
import { getUserByUid } from "@/lib/repositories/userRepository.server";

export type ServerAuthContext = DecodedIdToken & {
  role?: string;
  isAdmin: boolean;
  isStaff: boolean;
  isActive: boolean;
};

function normalizeRole(role: unknown): string {
  return String(role || "").trim().toLowerCase();
}

function isAdminRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "administrador";
}

function isStaffRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return isAdminRole(normalized) || normalized === "tutor";
}

function normalizeClaims(
  claims: DecodedIdToken,
  userData?: { role?: unknown; isActive?: unknown } | null,
): ServerAuthContext {
  const role = normalizeRole(userData?.role || claims.role);
  const isActive = userData?.isActive !== false && claims.isActive !== false;

  return {
    ...claims,
    role: role || (claims.role as string | undefined),
    isAdmin: isActive && (claims.admin === true || isAdminRole(role)),
    isStaff:
      isActive &&
      (claims.admin === true || isAdminRole(role) || isStaffRole(role)),
    isActive,
  };
}

export async function verifySession(): Promise<ServerAuthContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    return normalizeClaims(decodedClaims);
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

async function hydrateAuthorizationContext(
  claims: ServerAuthContext,
): Promise<ServerAuthContext> {
  if (!claims.uid) return claims;

  const user = await getUserByUid(claims.uid);
  return normalizeClaims(claims, user);
}

export async function requireAdmin(): Promise<ServerAuthContext> {
  const claims = await requireSession("/auth?next=/admin");
  const context = await hydrateAuthorizationContext(claims);

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
  const claims = await requireSession("/auth?next=/admin");
  const context = await hydrateAuthorizationContext(claims);

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
