import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

const mockUseAuth = jest.fn();
const mockUpdateProfileAction = jest.fn();
const mockUploadAvatar = jest.fn();
const mockGetDoc = jest.fn();
const mockUpdatePassword = jest.fn();
const mockReauthenticateWithCredential = jest.fn();
const mockSupabaseUpdateUser = jest.fn();
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

jest.mock("@/actions/profile", () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfileAction(...args),
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
}));

jest.mock("@/lib/firebase/client", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  updatePassword: (...args: unknown[]) => mockUpdatePassword(...args),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  reauthenticateWithCredential: (...args: unknown[]) =>
    mockReauthenticateWithCredential(...args),
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        uid: "user-1",
        id: "user-1",
        email: "user@example.com",
        displayName: "Usuário do contexto",
        photoURL: null,
      },
      updateProfile: jest.fn(),
    });

    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      })),
      auth: {
        updateUser: mockSupabaseUpdateUser,
      },
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        bio: "Bio do Firestore",
        phoneNumber: "11900000000",
        profession: "Terapeuta",
        city: "Campinas",
        state: "RJ",
        dateOfBirth: "1980-01-01",
        instagram: "@firestore",
      }),
    });

    mockUpdatePassword.mockResolvedValue(undefined);
    mockReauthenticateWithCredential.mockResolvedValue(undefined);
    mockUpdateProfileAction.mockResolvedValue({ success: true });
    mockUploadAvatar.mockResolvedValue({ success: true, url: null });
  });

  it("updates the password through Supabase Auth instead of Firebase", async () => {
    render(<ProfileForm />);

    fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

    fireEvent.change(screen.getByLabelText("Nova Senha"), {
      target: { value: "NovaSenha123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar Nova Senha"), {
      target: { value: "NovaSenha123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Atualizar Senha" }));

    await waitFor(() => {
      expect(mockSupabaseUpdateUser).toHaveBeenCalledWith({
        password: "NovaSenha123",
      });
    });

    expect(mockUpdatePassword).not.toHaveBeenCalled();
    expect(mockReauthenticateWithCredential).not.toHaveBeenCalled();
  });
});
