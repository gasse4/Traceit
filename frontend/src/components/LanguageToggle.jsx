import { Icon } from "./Icons.jsx";
import { t, useLanguage } from "../i18n.jsx";

/**
 * Button in the nav that switches the UI language.
 * Clicking it flips <html lang> / dir (RTL <-> LTR) and re-renders all
 * translated strings. The choice persists in localStorage.
 */
export default function LanguageToggle() {
  const { lang, setLang, languages } = useLanguage();
  const other = lang === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => setLang(other)}
      aria-label={t("nav.language")}
      aria-pressed={lang === "en"}
      title={t("nav.language")}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-slate-600 hover:bg-sand hover:text-ink"
    >
      <Icon name="globe" className="h-4 w-4" aria-hidden="true" />
      <span>{languages[other]}</span>
    </button>
  );
}


