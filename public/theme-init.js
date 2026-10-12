try {
  const saved = localStorage.getItem("theme");
  const dark = saved === "dark" || (saved === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = root.dataset.theme;
} catch { /* Server default when storage is unavailable. */ }
