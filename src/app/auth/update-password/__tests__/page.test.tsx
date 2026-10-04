import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePasswordPage from "../page";
const getSession = jest.fn(),
  getUser = jest.fn(),
  updateUser = jest.fn(),
  signOut = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { getSession, getUser, updateUser, signOut },
  }),
}));
jest.mock("@/components/ui/PageShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
describe("password recovery completion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSession.mockResolvedValue({
      data: { session: { access_token: "recovery" } },
      error: null,
    });
    getUser.mockResolvedValue({
      data: { user: { id: "verified-user" } },
      error: null,
    });
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });
  async function fill(
    password = "nova-senha-123",
    confirmation = "nova-senha-123",
  ) {
    await screen.findByLabelText("Nova senha");
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: password },
    });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: confirmation },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
  }
  it("does not expose the password form for an invalid recovery session", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { code: "expired" },
    });
    render(<UpdatePasswordPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "inválido ou expirou",
    );
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });
  it("requires matching passwords", async () => {
    render(<UpdatePasswordPage />);
    await fill("nova-senha-123", "outra-senha-123");
    expect(await screen.findByRole("alert")).toHaveTextContent("não coincidem");
    expect(updateUser).not.toHaveBeenCalled();
  });
  it("reports an SDK failure without displaying success", async () => {
    updateUser.mockResolvedValue({ error: { code: "weak_password" } });
    render(<UpdatePasswordPage />);
    await fill();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível",
    );
    expect(
      screen.queryByText("Senha alterada. Entre com sua nova senha."),
    ).not.toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });
  it("changes the password and clears client and server sessions", async () => {
    render(<UpdatePasswordPage />);
    await fill();
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      }),
    );
    expect(updateUser).toHaveBeenCalledWith({ password: "nova-senha-123" });
    expect(signOut).toHaveBeenCalledWith({ scope: "global" });
    expect(
      screen.getByText("Senha alterada. Entre com sua nova senha."),
    ).toBeInTheDocument();
  });
  it("reports incomplete logout after a successful password update", async () => {
    signOut.mockResolvedValue({ error: { code: "network" } });
    render(<UpdatePasswordPage />);
    await fill();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "não foi possível encerrar",
    );
  });
});
