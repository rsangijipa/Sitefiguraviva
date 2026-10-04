import { render, screen, waitFor } from "@testing-library/react";
import ConfirmationPage from "../page";
const getSession = jest.fn(),
  ensure = jest.fn(),
  replace = jest.fn(),
  refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams("courseId=curso-gestalt"),
}));
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ auth: { getSession } }),
}));
jest.mock("@/app/actions/auth", () => ({
  ensureUserProfileAction: (token: string) => ensure(token),
}));
jest.mock("@/components/ui/PageShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
describe("email confirmation completion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSession.mockResolvedValue({
      data: { session: { access_token: "confirmed-token" } },
      error: null,
    });
    ensure.mockResolvedValue({ success: true, user: { role: "student" } });
  });
  it("resumes the course enrollment only after server verification", async () => {
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/inscricao/curso-gestalt"),
    );
    expect(ensure).toHaveBeenCalledWith("confirmed-token");
    expect(refresh).toHaveBeenCalled();
  });
  it("rejects expired links without calling the profile action", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<ConfirmationPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("expirado");
    expect(ensure).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
  it("does not navigate when profile verification fails", async () => {
    ensure.mockResolvedValue({ success: false });
    render(<ConfirmationPage />);
    await screen.findByRole("alert");
    expect(replace).not.toHaveBeenCalled();
  });
});
