"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { UserRole, UserStatus } from "@/types/user";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

export interface User {
  uid: string;
  id: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
  user_metadata?: Record<string, any>;
}

/**
 * Module scope so the value survives re-renders and route changes: the cookie
 * only needs rewriting when the access token itself changed, not on every
 * auth-state notification.
 */
let lastSyncedToken: string | null = null;

// `signIn()` and the `onAuthStateChange` listener both call this with the
// same freshly-minted token right after login. Without tracking the in-flight
// request, the second caller would see `lastSyncedToken` already set (by the
// first caller, synchronously, before its fetch even resolves) and return
// immediately as if the cookie were already written — then `handleSuccess`
// would call a server action that reads that cookie before it actually
// exists, failing with "Unauthenticated". Concurrent callers now await the
// same underlying request instead of racing past it.
let pendingSync: { token: string; promise: Promise<void> } | null = null;

async function syncServerSession(accessToken: string): Promise<void> {
  if (accessToken === lastSyncedToken) return;
  if (pendingSync?.token === accessToken) return pendingSync.promise;

  const promise = (async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (response.ok) {
        lastSyncedToken = accessToken;
      }
      // Leave lastSyncedToken untouched on failure so a later event retries.
    } catch {
      // Leave lastSyncedToken untouched so a later event retries.
    } finally {
      if (pendingSync?.token === accessToken) {
        pendingSync = null;
      }
    }
  })();

  pendingSync = { token: accessToken, promise };
  return promise;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  status: UserStatus | null;
  tenantId: string | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: (redirectPath?: string) => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: any }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: any }>;
  updateProfile: (profile: {
    displayName?: string;
    photoURL?: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  status: null,
  tenantId: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  signIn: async () => {
    throw new Error("Not implemented");
  },
  signUp: async () => {
    throw new Error("Not implemented");
  },
  updateProfile: async () => {
    throw new Error("Not implemented");
  },
  resetPassword: async () => {
    throw new Error("Not implemented");
  },
});

function mapSupabaseUser(
  sbUser: SupabaseUser | null,
  profile?: { display_name?: string | null; photo_url?: string | null } | null,
): User | null {
  if (!sbUser) return null;
  return {
    uid: sbUser.id,
    id: sbUser.id,
    email: sbUser.email,
    displayName:
      profile?.display_name ||
      sbUser.user_metadata?.display_name ||
      sbUser.user_metadata?.full_name ||
      sbUser.email?.split("@")[0] ||
      "Usuário",
    photoURL: profile?.photo_url || sbUser.user_metadata?.avatar_url || null,
    user_metadata: sbUser.user_metadata,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchProfileAndSetState = async (
      currentUser: SupabaseUser | null,
    ) => {
      if (currentUser) {
        try {
          logger.info("[AuthContext] User logged in:", currentUser.email);

          // Fetch profile from Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_active, display_name, photo_url")
            .eq("id", currentUser.id)
            .maybeSingle();

          const mappedUser = mapSupabaseUser(currentUser, profile);
          setUser(mappedUser);

          let userRole: UserRole = "student";
          let isActive = true;

          if (profile) {
            if (profile.role) {
              userRole = profile.role as UserRole;
            }
            isActive = profile.is_active !== false;
          }

          const userStatus: UserStatus = !isActive ? "disabled" : "active";

          // SECURITY GUARD: Force Logout if Disabled
          if (userStatus === "disabled") {
            logger.warn("Account disabled. Forcing logout.");
            await supabase.auth.signOut();
            setUser(null);
            setRole(null);
            setStatus(null);
            setIsAdmin(false);
            setLoading(false);
            router.push("/admin/login?error=disabled");
            return;
          }

          const resolvedTenant =
            (currentUser.user_metadata?.tenantId as string) || "viva";
          setTenantId(resolvedTenant);

          const normalizedRole = userRole.toLowerCase().trim();
          setRole(userRole);
          setStatus(userStatus);
          setIsAdmin(normalizedRole === "admin");

          logger.info("[AuthContext] Final state:", {
            role: userRole,
            status: userStatus,
            tenantId: resolvedTenant,
            isAdmin: normalizedRole === "admin",
          });
        } catch (error) {
          logger.error("Error fetching user data:", error);
          setUser(mapSupabaseUser(currentUser));
          setRole("student");
          setStatus("active");
          setTenantId("viva");
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setStatus(null);
        setTenantId(null);
        setIsAdmin(false);
      }

      setLoading(false);
    };

    // Initialize session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfileAndSetState(session?.user ?? null);
      if (session?.access_token) {
        void syncServerSession(session.access_token);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      fetchProfileAndSetState(session?.user ?? null);

      // Keep the httpOnly cookie in step with the client session. Supabase
      // refreshes the access token in the background; without this the cookie
      // kept the token minted at sign-in, so every server-side check started
      // failing about an hour later while the client still looked signed in.
      if (session?.access_token) {
        void syncServerSession(session.access_token);
      } else if (event === "SIGNED_OUT") {
        lastSyncedToken = null;
        void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = async (redirectPath: string = "/") => {
    try {
      await supabase.auth.signOut();
      lastSyncedToken = null;
      await fetch("/api/auth/logout", { method: "POST" });

      setRole(null);
      setStatus(null);
      setIsAdmin(false);
      setUser(null);

      router.refresh();
      router.push(redirectPath);
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      await syncServerSession(data.session.access_token);
    }

    return { user: mapSupabaseUser(data.user), error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user: mapSupabaseUser(data.user), error };
  };

  const updateProfile = async (profile: {
    displayName?: string;
    photoURL?: string;
  }) => {
    if (user) {
      await supabase.auth.updateUser({
        data: {
          display_name: profile.displayName,
          avatar_url: profile.photoURL,
        },
      });

      await supabase
        .from("profiles")
        .update({
          display_name: profile.displayName,
          photo_url: profile.photoURL,
        })
        .eq("id", user.id);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: profile.displayName ?? prev.displayName,
              photoURL: profile.photoURL ?? prev.photoURL,
            }
          : null,
      );
    }
  };

  const resetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        status,
        tenantId,
        isAdmin,
        loading,
        signOut,
        signIn,
        signUp,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
