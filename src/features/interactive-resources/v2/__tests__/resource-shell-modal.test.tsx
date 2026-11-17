import { fireEvent, render, screen } from "@testing-library/react";
import { ResourceShell } from "../ResourceShell";
import { resourceCatalog } from "@/components/resources/resourceCatalog";

jest.mock("@/components/providers/ThemeProvider", () => ({ useTheme: () => ({ theme: "light", toggle: jest.fn() }) }));
jest.mock("../audio-manager", () => ({ resourceAudioManager: { stop: jest.fn() } }));

it("opens in the browser top layer and routes Escape through the draft-discard guard", () => {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }) });
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  const showModal = jest.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
  const close = jest.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (this: HTMLDialogElement) { this.removeAttribute("open"); });
  const navigate = jest.fn();
  const { unmount } = render(<div style={{ transform: "translateY(0)", overflow: "hidden" }}><ResourceShell resource={resourceCatalog[0]} version={null} concepts={[]} returnTo="/portal/recursos" onNavigateAway={navigate}><p>Experiência</p></ResourceShell></div>);
  const dialog = screen.getByRole("dialog", { name: "Cartas Gestálticas" });
  expect(dialog.tagName).toBe("DIALOG");
  expect(showModal).toHaveBeenCalledTimes(1);
  expect(document.body.style.overflow).toBe("hidden");
  const cancel = new Event("cancel", { cancelable: true });
  fireEvent(dialog, cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(navigate).toHaveBeenCalledWith("/portal/recursos");
  expect(dialog).toHaveAttribute("open");
  unmount();
  expect(document.body.style.overflow).toBe("");
  expect(close).toHaveBeenCalled();
  showModal.mockRestore(); close.mockRestore();
});
