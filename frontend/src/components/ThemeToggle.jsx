import { Icon } from "./Icons.jsx";
import { t } from "../i18n.jsx";
import { useTheme } from "../theme.jsx";

/**
 * Button in the nav that switches between light and dark mode.
 * Shows a moon icon in light mode and a sun icon in dark mode.
 * The choice persists in localStorage.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("nav.theme")}
      aria-pressed={isDark}
      title={t("nav.theme")}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-slate-600 hover:bg-sand hover:text-ink"
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}