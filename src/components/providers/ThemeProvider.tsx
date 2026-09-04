"use client";

/**
 * Tema claro/escuro do site.
 *
 * A classe `dark` é aplicada em <html> — e já foi aplicada antes da primeira
 * pintura pelo script inline de src/app/layout.tsx, então não existe flash de
 * tela branca. Este provider só assume o controle depois da hidratação: ele lê
 * o estado real do DOM em vez de supor "claro", que era o bug do controle
 * anterior (o botão nascia dessincronizado da página).
 *
 * Três estados, não dois: `system` acompanha o sistema operacional e continua
 * acompanhando; `light` e `dark` são escolhas explícitas e ficam gravadas.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** Cor da barra do navegador por tema — casa com --color-paper. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#FDFAF4",
  dark: "#12160F",
};

interface ThemeContextValue {
  /** O que a pessoa escolheu, incluindo "seguir o sistema". */
  preference: ThemePreference;
  /** O tema efetivamente pintado agora. */
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  /** Alterna claro ↔ escuro, fixando a escolha. */
  toggle: () => void;
  /** false durante o SSR e o primeiro render, para evitar mismatch. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  theme: "light",
  setPreference: () => {},
  toggle: () => {},
  mounted: false,
});

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // localStorage bloqueado (aba anônima, cookies desligados): segue o sistema.
  }
  return "system";
}

function paint(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [theme, setTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Sincroniza com o que o script inline já pintou, em vez de repintar.
  useEffect(() => {
    const pref = readPreference();
    setPreferenceState(pref);
    setTheme(pref === "system" ? systemTheme() : pref);
    setMounted(true);
  }, []);

  // Só quem está em "system" segue o sistema operacional.
  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  useEffect(() => {
    if (!mounted) return;
    paint(theme);
  }, [theme, mounted]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setTheme(next === "system" ? systemTheme() : next);
    try {
      if (next === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Sem persistência: a escolha vale para esta sessão.
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle, mounted }),
    [preference, theme, setPreference, toggle, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/**
 * Script inline que roda antes da primeira pintura. Mantido como string para
 * poder ser injetado no <head> — qualquer atraso aqui devolve o flash branco.
 */
export const themeInitScript = `(function(){try{
var k=localStorage.getItem("${THEME_STORAGE_KEY}");
var d=k==="dark"||(k!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var r=document.documentElement;
r.classList.toggle("dark",d);
r.style.colorScheme=d?"dark":"light";
r.dataset.theme=d?"dark":"light";
}catch(e){}})();`;
