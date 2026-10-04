import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, themeInitScript, useTheme } from "../ThemeProvider";

function Control() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme}</button>;
}

it("starts light even when the previous preference and OS are dark", () => {
  localStorage.setItem("theme", "dark");
  document.documentElement.classList.add("dark");
  Object.defineProperty(window, "matchMedia", { configurable: true, value: jest.fn(() => ({ matches: true })) });
  new Function(themeInitScript)();
  expect(document.documentElement.classList.contains("dark")).toBe(false);
  expect(document.documentElement.dataset.theme).toBe("light");
  const { unmount } = render(<ThemeProvider><Control /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "light" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  unmount();
  render(<ThemeProvider><Control /></ThemeProvider>);
  expect(document.documentElement.dataset.theme).toBe("light");
});
