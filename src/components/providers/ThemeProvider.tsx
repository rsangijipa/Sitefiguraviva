"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export const THEME_STORAGE_KEY = "theme";
interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
  mounted: boolean;
}
const ThemeContext = createContext<ThemeContextValue>({
  preference: "light", theme: "light", setPreference: () => {}, toggle: () => {}, mounted: false,
});

// Each page load starts light; manual changes last only while the site stays open.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#FDFAF4" : "#12160F");
  }, [theme]);
  const setPreference = useCallback((next: ThemePreference) => setTheme(next === "dark" ? "dark" : "light"), []);
  const toggle = useCallback(() => setTheme(current => current === "light" ? "dark" : "light"), []);
  const value = useMemo(() => ({ preference: theme, theme, setPreference, toggle, mounted }), [theme, setPreference, toggle, mounted]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export const themeInitScript = `(function(){var r=document.documentElement;r.classList.remove("dark");r.style.colorScheme="light";r.dataset.theme="light";})();`;
