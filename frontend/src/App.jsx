import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ReportForm from "./pages/ReportForm.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import { t, useLanguage } from "./i18n.jsx";

// Add a page: add it here and in <Routes> below.
const NAV = [
  { to: "/report-lost", key: "nav.reportLost" },
  { to: "/report-found", key: "nav.reportFound" },
  { to: "/search", key: "nav.search" },
];

export default function App() {
  const { lang } = useLanguage();
  return (
    <BrowserRouter>
      <div className={`flex min-h-screen flex-col antialiased selection:bg-amber-200 ${lang === "ar" ? "rtl" : "ltr"}`}>
        <nav className="sticky top-0 z-40 border-b border-ink bg-paper">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="bg-ink px-2.5 py-1 font-mono text-sm text-amber-200">TraceIt</span>
              <span className="hidden font-mono text-xs tracking-widest text-slate-500 md:inline">/ FIND WHAT MATTERS</span>
            </Link>
            <div className="ms-auto flex flex-wrap items-center gap-1 sm:gap-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-ink text-amber-200" : "text-slate-600 hover:bg-sand hover:text-ink"
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              ))}
              <LanguageToggle />
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Distinct keys give each form its own fresh state. */}
            <Route path="/report-lost" element={<ReportForm key="lost" type="lost" />} />
            <Route path="/report-found" element={<ReportForm key="found" type="found" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-300 bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-600 sm:px-6">
            <span className="font-semibold text-amber-700">{t("footer.note")}</span>
            {t("footer.disclaimer")}
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
