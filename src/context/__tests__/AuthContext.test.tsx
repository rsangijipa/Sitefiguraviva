import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import {
  signInWithCustomToken,
  signOut as signOutFirebase,
} from "firebase/auth";

const resetAction = jest.fn();
jest.mock("@/app/actions/password-reset", () => ({
  requestPasswordResetAction: (...args: unknown[]) => resetAction(...args),
}));

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    updateUser: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

jest.mock("@/lib/firebase/client", () => ({
  auth: { currentUser: null },
}));

jest.mock("firebase/auth", () => ({
  signInWithCustomToken: jest.fn(),
  signOut: jest.fn(),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          user_metadata: {},
        },
        session: { access_token: "supabase-access-token" },
      },
      error: null,
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      })),
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ firebaseToken: "firebase-token" }),
    }) as jest.Mock;
  });

  it("does not bridge Supabase sign-in into Firebase Auth", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(signInWithCustomToken).not.toHaveBeenCalled();
  });

  it("does not sign out Firebase when signing out of Supabase", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut("/portal");
    });

    expect(signOutFirebase).not.toHaveBeenCalled();
  });
  it("sends recovery to the password form and propagates SDK errors", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    resetAction.mockResolvedValue({ success: true });
    await act(async () => {
      await result.current.resetPassword(" user@example.com ");
    });
    expect(resetAction).toHaveBeenCalledWith(" user@example.com ");
    expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    resetAction.mockResolvedValue({
      success: false,
      error: "Envio indisponível",
    });
    await expect(
      result.current.resetPassword("user@example.com"),
    ).rejects.toThrow("Envio indisponível");
  });
});

describe("auth concurrency and failures", () => {
  function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  }
  let callback: (event: string, session: any) => void;
  const session = (id: string) => ({
    access_token: "race-token-" + id,
    user: { id, email: id + "@example.com", user_metadata: {} },
  });
  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockImplementation((fn) => {
      callback = fn;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;
  });
  it("does not let delayed initialization replace a newer account", async () => {
    const initial = deferred<any>();
    mockSupabase.auth.getSession.mockReturnValue(initial.promise);
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              role: "student",
              is_active: true,
              display_name: "New account",
            },
            error: null,
          }),
        }),
      }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    act(() => callback("SIGNED_IN", session("new")));
    await waitFor(() => expect(result.current.user?.id).toBe("new"));
    await act(async () => {
      initial.resolve({ data: { session: session("old") }, error: null });
    });
    expect(result.current.user?.id).toBe("new");
  });
  it("discards an old admin profile after an account switch", async () => {
    const oldProfile = deferred<any>(),
      newProfile = deferred<any>();
    const reads: string[] = [];
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: (_field: string, uid: string) => ({
          maybeSingle: () => {
            reads.push(uid);
            return uid === "old-admin"
              ? oldProfile.promise
              : newProfile.promise;
          },
        }),
      }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => callback("SIGNED_IN", session("old-admin")));
    await waitFor(() => expect(reads).toContain("old-admin"));
    act(() => callback("SIGNED_IN", session("student-next")));
    await waitFor(() => expect(reads).toContain("student-next"));
    await act(async () => {
      newProfile.resolve({
        data: { role: "student", is_active: true },
        error: null,
      });
    });
    await act(async () => {
      oldProfile.resolve({
        data: { role: "admin", is_active: true },
        error: null,
      });
    });
    expect(result.current.user?.id).toBe("student-next");
    expect(result.current.isAdmin).toBe(false);
  });
  it("finishes loading if the initial SDK request rejects", async () => {
    mockSupabase.auth.getSession.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
  it("does not report a profile save when no database row was updated", async () => {
    const save = jest.fn().mockResolvedValue({ data: null, error: null });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: session("profile-save") },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              role: "student",
              is_active: true,
              display_name: "Original",
            },
            error: null,
          }),
        }),
      }),
      update: () => ({ eq: () => ({ select: () => ({ maybeSingle: save }) }) }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() =>
      expect(result.current.user?.displayName).toBe("Original"),
    );
    await expect(
      result.current.updateProfile({ displayName: "New" }),
    ).rejects.toThrow("salvar");
    expect(result.current.user?.displayName).toBe("Original");
    expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
  });
  it("clears the server cookie and reports an Auth logout failure", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: session("logout-failure") },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { role: "student", is_active: true },
            error: null,
          }),
        }),
      }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user?.id).toBe("logout-failure"));
    mockSupabase.auth.signOut.mockResolvedValue({
      error: new Error("offline"),
    });
    await act(async () => {
      await expect(result.current.signOut()).rejects.toThrow("não confirmou");
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.anything(),
    );
    expect(result.current.user).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
