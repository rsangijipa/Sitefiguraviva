import { render, screen, fireEvent, waitFor } from "@testing-library/react";
jest.mock("@/app/actions/siteSettings", () => ({
  getGoogleSettings: jest.fn(),
  updateGoogleSettings: jest.fn(),
}));
import {
  getGoogleSettings,
  updateGoogleSettings,
} from "@/app/actions/siteSettings";
import GoogleIntegrations from "../page";
const values = {
  calendarId: "saved-calendar",
  driveFolderId: "",
  formsUrl: "",
  youtubeId: "",
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getGoogleSettings).mockResolvedValue(values);
  jest
    .mocked(updateGoogleSettings)
    .mockResolvedValue({ success: true, updatedAt: "now" });
});
it("discards edits back to the loaded settings without persisting blank fields", async () => {
  render(<GoogleIntegrations />);
  const input = await screen.findByDisplayValue("saved-calendar");
  fireEvent.change(input, { target: { value: "edit" } });
  fireEvent.click(screen.getByText("Descartar"));
  expect(input).toHaveValue("saved-calendar");
  expect(updateGoogleSettings).not.toHaveBeenCalled();
});
it("saves only integration fields and updates the discard baseline", async () => {
  render(<GoogleIntegrations />);
  const input = await screen.findByDisplayValue("saved-calendar");
  fireEvent.change(input, { target: { value: "new-calendar" } });
  fireEvent.click(screen.getByText("Salvar Alterações"));
  await screen.findByText("Configurações salvas com sucesso!");
  expect(updateGoogleSettings).toHaveBeenCalledWith({
    ...values,
    calendarId: "new-calendar",
  });
  fireEvent.change(input, { target: { value: "unsaved" } });
  fireEvent.click(screen.getByText("Descartar"));
  expect(input).toHaveValue("new-calendar");
  expect(screen.queryByTitle("Testar Link")).not.toBeInTheDocument();
});
it("blocks saving defaults after a loading failure", async () => {
  jest.mocked(getGoogleSettings).mockRejectedValue(new Error("denied"));
  render(<GoogleIntegrations />);
  await screen.findByText(/Recarregue a página/);
  expect(screen.getByText("Salvar Alterações")).toBeDisabled();
  expect(updateGoogleSettings).not.toHaveBeenCalled();
});
it("reports rejected saves without replacing the saved baseline", async () => {
  jest
    .mocked(updateGoogleSettings)
    .mockResolvedValue({ success: false, error: "Conflict" });
  render(<GoogleIntegrations />);
  const input = await screen.findByDisplayValue("saved-calendar");
  fireEvent.change(input, { target: { value: "edit" } });
  fireEvent.click(screen.getByText("Salvar Alterações"));
  await screen.findByText("Conflict");
  await waitFor(() => expect(screen.getByText("Descartar")).not.toBeDisabled());
  fireEvent.click(screen.getByText("Descartar"));
  expect(input).toHaveValue("saved-calendar");
});
