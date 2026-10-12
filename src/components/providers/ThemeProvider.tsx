"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export const THEME_STORAGE_KEY = "theme";
interface ThemeContextValue {
  preference: ThemePreference; theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void; toggle: () => void; mounted: boolean;
}
const ThemeContext = createContext<ThemeContextValue>({ preference: "light", theme: "light", setPreference: () => {}, toggle: () => {}, mounted: false });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, updatePreference] = useState<ThemePreference>("light");
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* private browsing */ }
    if (saved === "light" || saved === "dark" || saved === "system") updatePreference(saved);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const changed = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener?.("change", changed);
    const synchronized = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        const value = event.newValue;
        updatePreference(value === "dark" || value === "system" ? value : "light");
      }
    };
    window.addEventListener("storage", synchronized);
    setMounted(true);
    return () => { media.removeEventListener?.("change", changed); window.removeEventListener("storage", synchronized); };
  }, []);
  const theme: ResolvedTheme = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#FDFAF4" : "#12160F");
  }, [theme, mounted]);
  const setPreference = useCallback((next: ThemePreference) => {
    updatePreference(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* available in this tab */ }
  }, []);
  const toggle = useCallback(() => setPreference(theme === "light" ? "dark" : "light"), [theme, setPreference]);
  const value = useMemo(() => ({ preference, theme, setPreference, toggle, mounted }), [preference, theme, setPreference, toggle, mounted]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
