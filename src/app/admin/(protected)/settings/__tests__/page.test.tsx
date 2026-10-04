jest.mock("@/lib/siteSettings", () => ({
  ...jest.requireActual("@/lib/siteSettings"),
  getSiteSettings: jest.fn(),
}));
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: jest.fn() }),
}));
jest.mock("@/app/actions/siteSettings", () => ({
  updateSiteSettings: jest.fn(),
}));
jest.mock("@/services/uploadService", () => ({ uploadFiles: jest.fn() }));
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SettingsPage from "../page";
import {
  DEFAULT_HOME,
  getSiteSettings,
  DEFAULT_FOUNDER,
} from "@/lib/siteSettings";
import { updateSiteSettings } from "@/app/actions/siteSettings";
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(updateSiteSettings)
    .mockResolvedValue({ success: true, updatedAt: "now" });
});
it("loads saved content even when another component populated the cache with defaults", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(["siteSettings", "home"], DEFAULT_HOME);
  jest
    .mocked(getSiteSettings)
    .mockResolvedValue({ ...DEFAULT_HOME, heroTitle: "Título salvo no banco" });
  render(
    <QueryClientProvider client={client}>
      <SettingsPage />
    </QueryClientProvider>,
  );
  await waitFor(() =>
    expect(screen.getByLabelText("Título de abertura")).toHaveValue(
      "Título salvo no banco",
    ),
  );
  fireEvent.change(screen.getByLabelText("Título de abertura"), {
    target: { value: "Título editado" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar e publicar" }));
  await waitFor(() =>
    expect(updateSiteSettings).toHaveBeenCalledWith(
      "home",
      expect.objectContaining({ heroTitle: "Título editado" }),
    ),
  );
  expect(
    screen.queryByRole("button", { name: "Equipe" }),
  ).not.toBeInTheDocument();
});
it("keeps unsaved homepage edits when switching to the founder tab", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  jest
    .mocked(getSiteSettings)
    .mockImplementation(
      async (key) =>
        (key === "founder" ? DEFAULT_FOUNDER : DEFAULT_HOME) as any,
    );
  render(
    <QueryClientProvider client={client}>
      <SettingsPage />
    </QueryClientProvider>,
  );
  await screen.findByLabelText("Título de abertura");
  fireEvent.change(screen.getByLabelText("Título de abertura"), {
    target: { value: "Meu rascunho" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fundadora" }));
  await screen.findByLabelText("Nome");
  fireEvent.click(screen.getByRole("button", { name: "Homepage" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Título de abertura")).toHaveValue(
      "Meu rascunho",
    ),
  );
});
