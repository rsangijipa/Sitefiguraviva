"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { UserRole, UserStatus } from "@/types/user";
import { useRouter } from "next/navigation";
import { createSessionSynchronizer } from "@/lib/auth/session-sync";
import { logger } from "@/lib/logger";
import { requestPasswordResetAction } from "@/app/actions/password-reset";
import { normalizeUserRole } from "@/lib/auth/authService";

export interface User {
  uid: string;
  id: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
  user_metadata?: Record<string, any>;
}

const syncServerSession = createSessionSynchronizer();

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

  const profileGeneration = useRef(0);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const generationState = profileGeneration;
    let disposed = false;
    let authEventReceived = false;
    let lastIdentity: string | null | undefined;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const clearIdentity = () => {
      setUser(null);
      setRole(null);
      setStatus(null);
      setTenantId(null);
      setIsAdmin(false);
    };
    const applySession = async (
      session: Session | null,
      generation: number,
      cookieSync: Promise<void>,
    ) => {
      const current = () => !disposed && generationState.current === generation;
      const currentUser = session?.user ?? null;
      if (!current()) return;
      if (!currentUser) {
        clearIdentity();
        setLoading(false);
        return;
      }
      try {
        await cookieSync;
        if (!current()) return;
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, is_active, display_name, photo_url")
          .eq("id", currentUser.id)
          .maybeSingle();
        if (!current()) return;
        if (error) throw error;
        if (profile && profile.is_active !== true) {
          clearIdentity();
          setLoading(false);
          await syncServerSession(null);
          if (!current()) return;
          const { error: logoutError } = await supabase.auth.signOut();
          if (logoutError) throw logoutError;
          router.push("/auth?error=disabled");
          return;
        }
        setUser(mapSupabaseUser(currentUser, profile));
        const resolvedRole = profile ? normalizeUserRole(profile.role) : null;
        setRole(resolvedRole);
        setStatus(profile ? "active" : null);
        setTenantId(profile ? "viva" : null);
        setIsAdmin(resolvedRole === "admin");
      } catch (error) {
        if (!current()) return;
        logger.error("Error fetching user data:", error);
        clearIdentity();
      } finally {
        if (current()) setLoading(false);
      }
    };
    const acceptSession = (session: Session | null) => {
      const generation = ++generationState.current;
      // Cookie writes enter the queue synchronously; SDK calls wait for the callback to finish.
      const cookieSync = syncServerSession(session?.access_token ?? null);
      void cookieSync.catch((error) =>
        logger.warn("Session sync failed", error),
      );
      const identity = session?.user.id ?? null;
      if (lastIdentity !== identity) {
        clearIdentity();
        setLoading(true);
        lastIdentity = identity;
      }
      const timer = setTimeout(() => {
        timers.delete(timer);
        void applySession(session, generation, cookieSync);
      }, 0);
      timers.add(timer);
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      acceptSession(session);
    });
    void supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (disposed || authEventReceived) return;
        if (error) {
          clearIdentity();
          setLoading(false);
          logger.warn("Session initialization failed", error);
          return;
        }
        acceptSession(session);
      })
      .catch((error) => {
        if (!disposed && !authEventReceived) {
          clearIdentity();
          setLoading(false);
          logger.warn("Session initialization failed", error);
        }
      });
    return () => {
      disposed = true;
      ++generationState.current;
      timers.forEach(clearTimeout);
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = async (redirectPath: string = "/") => {
    ++profileGeneration.current;
    setUser(null);
    setRole(null);
    setStatus(null);
    setTenantId(null);
    setIsAdmin(false);
    // Clear the server cookie even when the Auth SDK cannot reach the provider.
    const [cookieResult, authResult] = await Promise.allSettled([
      syncServerSession(null),
      supabase.auth.signOut(),
    ]);
    setLoading(false);
    if (cookieResult.status === "rejected") throw cookieResult.reason;
    if (authResult.status === "rejected" || authResult.value.error)
      throw new Error(
        "A sessão local foi encerrada, mas a autenticação não confirmou a saída. Tente novamente.",
      );
    router.refresh();
    router.push(redirectPath);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      try {
        await syncServerSession(data.session.access_token);
      } catch (syncError) {
        return { user: null, error: syncError };
      }
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
    if (!user) throw new Error("Entre na sua conta antes de alterar o perfil.");
    const uid = user.id;
    const generation = profileGeneration.current;
    const updates = {
      ...(profile.displayName !== undefined
        ? { display_name: profile.displayName }
        : {}),
      ...(profile.photoURL !== undefined
        ? { photo_url: profile.photoURL }
        : {}),
    };
    const { data: saved, error: profileError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", uid)
      .select("id")
      .maybeSingle();
    if (profileError || !saved)
      throw new Error("Não foi possível salvar seu perfil. Tente novamente.");
    if (generation !== profileGeneration.current)
      throw new Error(
        "Sua conta mudou durante a atualização. Confira o perfil novamente.",
      );
    setUser((prev) =>
      prev?.id === uid
        ? {
            ...prev,
            displayName: profile.displayName ?? prev.displayName,
            photoURL: profile.photoURL ?? prev.photoURL,
          }
        : prev,
    );
  };

  const resetPassword = async (email: string) => {
    const result = await requestPasswordResetAction(email);
    if (!result.success)
      throw new Error(result.error || "Não foi possível solicitar o link.");
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
