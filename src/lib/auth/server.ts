import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
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
    const supabase = createSupabaseServiceClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(sessionCookie);

    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const role = normalizeRole(profile?.role);
    const isActive = profile?.is_active !== false;

    return {
      uid: user.id,
      email: user.email,
      role,
      isAdmin: isActive && isAdminRole(role),
      isStaff: isActive && isStaffRole(role),
      isActive,
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
