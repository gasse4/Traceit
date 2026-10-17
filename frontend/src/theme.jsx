import { createContext, useContext, useEffect, useState } from "react";

/* --------------------------------------------------------------------------
 * TraceIt — theme (light / dark) management.
 * Mirrors the i18n.jsx pattern: module-level state + React context.
 * The `dark` class lives on <html> so CSS variable overrides in index.css
 * and the pre-mount script in index.html both work.
 * ------------------------------------------------------------------------ */

const STORAGE_KEY = "traceit-theme";
const DEFAULT_THEME = "light";

/** Read the stored theme (or default). */
function readTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" ? "dark" : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Persist the theme and toggle the `dark` class on <html>. */
function applyTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/* Module-level state so helpers can read it outside React too. */
let currentTheme = readTheme();

/** Toggle between light and dark. Exported for use outside React if needed. */
export function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(currentTheme);
  return currentTheme;
}

/** Read the current theme string ("light" or "dark"). */
export function getTheme() {
  return currentTheme;
}

/* --------------------------------------------------------------------------
 * React context — components that call useTheme() re-render on toggle.
 * ------------------------------------------------------------------------ */

const ThemeContext = createContext(null);

/** Hook used by components to read and change the theme. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}

/** Provider that keeps <html> class in sync and stores the choice. */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(currentTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (next) => {
      currentTheme = next;
      applyTheme(next);
      setThemeState(next);
    },
    toggleTheme: () => {
      const next = currentTheme === "dark" ? "light" : "dark";
      currentTheme = next;
      applyTheme(next);
      setThemeState(next);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}