import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import {
  signInWithCustomToken,
  signOut as signOutFirebase,
} from "firebase/auth";

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
});
