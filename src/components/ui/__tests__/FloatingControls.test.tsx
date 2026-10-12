import { act, fireEvent, render, screen } from "@testing-library/react";
import FloatingControls from "../FloatingControls";

let pathname = "/";
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", preference: "light", setPreference: jest.fn(), mounted: true }),
}));

const backToTop = () => screen.getByRole("button", { name: "Voltar ao topo da página", hidden: true });

beforeEach(() => {
  pathname = "/";
  window.scrollTo = jest.fn();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

it("groups back-to-top, contact and options in a single floating stack", () => {
  render(<FloatingControls />);
  const stack = document.querySelector("[data-global-options]");
  expect(stack).toContainElement(backToTop());
  expect(stack).toContainElement(screen.getByRole("link", { name: "Falar com o Instituto no WhatsApp" }));
  expect(stack).toContainElement(screen.getByRole("button", { name: "Mais opções: som e tema" }));
});

it("shows back-to-top after scrolling and returns the window to the top", () => {
  render(<FloatingControls />);
  expect(backToTop()).toHaveAttribute("data-visible", "false");
  Object.defineProperty(window, "scrollY", { configurable: true, value: 900 });
  act(() => { document.dispatchEvent(new Event("scroll")); });
  expect(backToTop()).toHaveAttribute("data-visible", "true");
  fireEvent.click(backToTop());
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});

it("stays available inside resource experiences and scrolls their own container", () => {
  pathname = "/recursos/igarape";
  const scroller = document.createElement("div");
  scroller.setAttribute("data-scroll-root", "");
  scroller.scrollTo = jest.fn();
  Object.defineProperty(scroller, "scrollTop", { configurable: true, value: 600 });
  document.body.appendChild(scroller);
  render(<FloatingControls />);
  expect(screen.getByRole("button", { name: "Mais opções: tema" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Falar com o Instituto no WhatsApp" })).not.toBeInTheDocument();
  expect(backToTop()).toHaveAttribute("data-visible", "true");
  fireEvent.click(backToTop());
  expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  expect(window.scrollTo).not.toHaveBeenCalled();
  scroller.remove();
});
