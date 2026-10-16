import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./Home.jsx";
import ReportForm from "./ReportForm.jsx";
import SearchPage from "./SearchPage.jsx";

const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        location.pathname === to || location.pathname.startsWith(to + "/")
          ? "bg-[#10243b] text-amber-200 border border-[#10243b] shadow-[0_0_12px_rgba(16,36,59,0.12)]"
          : "text-slate-500 hover:text-[#10243b] hover:bg-[#e9e4d8]"
      }`}
    >
      {children}
    </Link>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f1eee6] text-[#10243b] antialiased selection:bg-amber-200" dir="rtl">
        {/* Top navigation */}
        <nav className="sticky top-0 z-40 border-b border-[#10243b] bg-[#f7f4ec]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-[#10243b]"
            >
              <span className="bg-[#10243b] text-amber-200 px-2.5 py-1 font-mono text-sm">
                TraceIt
              </span>
              <span className="hidden md:inline font-mono text-xs tracking-widest text-slate-500">/ FIND WHAT MATTERS</span>
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <NavLink to="/report-lost">إبلاغ عن مفقود</NavLink>
              <NavLink to="/report-found">إبلاغ عن موجود</NavLink>
              <NavLink to="/search">البحث عن مفقودات</NavLink>
            <Link to="/search" className="px-5 py-2 bg-[#10243b] text-amber-200 text-sm font-semibold shadow-md hover:bg-[#1d3b5b] transition-all active:scale-95 block text-center">
              بدء البحث
            </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report-lost" element={<ReportForm type="lost" />} />
            <Route path="/report-found" element={<ReportForm type="found" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global manual-verification reminder */}
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#f7f4ec] border border-amber-400 text-[#10243b] px-5 py-3 shadow-lg text-sm flex items-start gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold text-amber-700">ملاحظة مهمة</div>
            <div className="opacity-90">النتائج معروضة كـ "محتملة"، ويجب التحقق من الملكية يدويًا قبل التسليم.</div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
