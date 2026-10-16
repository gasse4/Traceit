import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ---------- SVG Icons ---------- */
const IconLocation = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconColor = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z" />
  </svg>
);

const IconTime = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconHamming = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconFound = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
  </svg>
);

const IconLost = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012 2m0 0l2 2m-2-2v10a2 2 0 01-2 2h-2a2 2 0 00-2-2v-2m2-2h-2a2 2 0 00-2 2m2-2V7a2 2 0 00-2-2H7a2 2 0 01-2 2v2" />
  </svg>
);

const IconSearch = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconImage = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconDocument = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/stats").then((r) => r.json()),
      fetch("http://localhost:5000/api/reports").then((r) => r.json()),
    ])
      .then(([statsRes, reportsRes]) => {
        setStats(statsRes);
        setReports((reportsRes?.results || []).slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-[#10243b] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm">جاري تحميل البيانات…</p>
      </div>
    );
  }

  const statsData = [
    { label: "إجمالي المبلغ عنها", value: stats?.total_reports ?? 0, accent: "blue", icon: IconDocument },
    { label: "تمت إعادتها لأصحابها", value: stats?.resolved_reports ?? 0, accent: "emerald", icon: IconFound },
    { label: "تحت المراجعة حالياً", value: stats?.active_reports ?? 0, accent: "amber", icon: IconTime },
    { label: "أعلى نسبة تطابق", value: `${stats?.match_percentage ?? 0}%`, accent: "purple", icon: IconHamming },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-[#10243b] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-y-0 left-0 hidden w-1/3 border-r border-white/10 lg:block"></div>
        <div className="absolute left-8 top-8 h-16 w-16 border-l border-t border-emerald-300/60"></div>
        <div className="absolute bottom-8 right-8 h-16 w-16 border-b border-r border-amber-300/60"></div>

        <div className="relative grid gap-12 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16">
          <div className="text-right">
            <div className="mb-6 inline-flex items-center gap-3 border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-xs font-bold tracking-wide text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
              TRACEIT / نظام التتبع الذكي
            </div>
            <h1 className="mb-5 max-w-2xl text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl">
              كل غرض له أثر.
              <span className="mt-2 block text-amber-200">ابدأ بتتبّعه.</span>
            </h1>
            <p className="mb-8 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              ابحث في بلاغات الحرم الجامعي بالنص أو الصورة، واترك المطابقة الذكية تقرّبك من صاحب الغرض الحقيقي.
            </p>
            <div className="flex flex-wrap justify-start gap-3">
              <button
                onClick={() => navigate("/search")}
                className="inline-flex items-center gap-3 bg-amber-300 px-6 py-3.5 font-bold text-slate-950 transition-colors hover:bg-amber-200 active:scale-95"
              >
                ابدأ البحث
                <span aria-hidden="true">←</span>
              </button>
              <button
                onClick={() => navigate("/report-found")}
                className="border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:border-emerald-200 hover:bg-white/10 active:scale-95"
              >
                أبلغ عن غرض موجود
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md" dir="ltr">
            <div className="absolute -left-3 -top-3 border border-amber-300/60 bg-[#10243b] px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-amber-200">
              MATCH / 01
            </div>
            <div className="border border-slate-300/40 bg-[#f7f4ec] p-4 text-slate-900 shadow-[12px_12px_0_#d9b45c]">
              <div className="flex items-center justify-between border-b border-slate-300 pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                <span>Trace record</span>
                <span className="text-emerald-700">● live index</span>
              </div>
              <div className="grid grid-cols-[88px_1fr] gap-4 py-5">
                <div className="relative flex h-24 items-center justify-center border border-dashed border-slate-400 bg-[#e9e4d8]">
                  <div className="h-12 w-12 rotate-45 border-2 border-slate-700 bg-[#c8c1b2]"></div>
                  <span className="absolute bottom-1 left-1 font-mono text-[8px] text-slate-500">IMG_HASH</span>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] text-slate-500">OBJECT / FOUND</p>
                  <h2 className="text-xl font-black">مفتاح أسود</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">مبنى الهندسة · البهو الرئيسي</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-300 pt-3 font-mono text-[10px]">
                <div className="border-l border-slate-300 pl-3">
                  <span className="block text-slate-500">PHASH / HAMMING</span>
                  <strong className="text-emerald-700">92% MATCH</strong>
                </div>
                <div className="pl-3">
                  <span className="block text-slate-500">LINEAR SEARCH</span>
                  <strong>REPORT #0042</strong>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">
              <span>Evidence first</span>
              <span>Verify before handover</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsData.map((s, i) => {
          const icons = [IconDocument, IconFound, IconTime, IconHamming];
          const IconComp = icons[i];

          return (
            <div
              key={i}
              className="relative p-6 bg-[#f7f4ec] border border-slate-300 shadow-[5px_5px_0_#d9b45c] hover:shadow-[7px_7px_0_#d9b45c] transition-all duration-300 group"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-3 bg-[#e9e4d8] border border-slate-300">
                <IconComp className="w-5 h-5 text-slate-600" />
              </div>

              <div className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">
                {s.label}
              </div>
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <QuickAction
          icon={<IconSearch className="w-6 h-6" />}
          title="البحث النصي"
          desc="ابحث بالاسم، الوصف، المكان أو اللون"
          color="blue"
          onClick={() => navigate("/search")}
          variant="a"
        />
        <QuickAction
          icon={<IconImage className="w-6 h-6" />}
          title="البحث بالصورة"
          desc="ارفع صورة وقارن بصمتها الرقمية"
          color="indigo"
          onClick={() => navigate("/search")}
          variant="b"
        />
        <QuickAction
          icon={<IconDocument className="w-6 h-6" />}
          title="إبلاغ جديد"
          desc="سجل عنصر مفقود أو موجود بسهولة"
          color="emerald"
          onClick={() => navigate("/report-lost")}
          variant="c"
        />
      </section>

      {/* Featured / recent */}
      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">آخر البلاغات</h2>
          <Link
            to="/search"
            className="text-sm font-medium text-[#10243b] hover:text-amber-700 hover:underline flex items-center gap-1"
          >
            عرض الكل
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reports.length > 0 ? (
            reports.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-16 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>لا توجد بلاغات بعد</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon, title, desc, color, onClick, variant }) {
  const theme = color === "blue" ? "bg-[#f7f4ec] border-slate-300 text-[#10243b]" :
    color === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
    "bg-[#f7f4ec] border-slate-300 text-[#10243b]";

  const layout = variant === "a"
    ? "flex flex-col items-start gap-3"
    : variant === "b"
    ? "flex items-center gap-4"
    : "flex flex-col items-center gap-3 text-center";

  return (
    <button
      onClick={onClick}
      className={`p-6 border ${theme} shadow-[6px_6px_0_#d9b45c] hover:shadow-[8px_8px_0_#d9b45c] hover:-translate-y-1 transition-all group cursor-pointer ${layout}`}
    >
      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform ${
        color === "blue" ? "bg-[#e9e4d8]" : color === "emerald" ? "bg-emerald-100" : "bg-[#e9e4d8]"
      }`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </button>
  );
}

function FeaturedCard({ item }) {
  const isFound = item.type === "found";
  const theme = isFound
    ? "bg-emerald-50 border-emerald-200 text-emerald-800 badge-bg-emerald-100 badge-text-emerald-700"
    : "bg-[#f7f4ec] border-slate-300 text-[#10243b] badge-bg-amber-100 badge-text-amber-800";

  return (
    <div className={`border bg-[#f7f4ec] p-6 shadow-[6px_6px_0_#d9b45c] hover:shadow-[8px_8px_0_#d9b45c] transition-all group relative overflow-hidden ${theme}`}>
      {/* Decorative corner */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#10243b] group-hover:bg-amber-400 transition-colors"></div>
      <div className="absolute top-0 right-0 w-1 h-full bg-emerald-400/60 group-hover:bg-emerald-300 transition-colors"></div>

      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-lg ${isFound ? "text-emerald-800" : "text-[#10243b]"}`}>
          {item.name}
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          isFound
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-100 text-amber-800 border-amber-300"
        }`}>
          {isFound ? "موجود" : "مفقود"}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-5 line-clamp-2">{item.description}</p>

      <div className="space-y-2.5 text-xs text-slate-500 mb-6">
        <div className="flex items-center gap-2">
          <IconLocation className="w-4 h-4" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconColor className="w-4 h-4" />
          <span>{item.color}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconTime className="w-4 h-4" />
          <span>{item.time}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-400">رقم البلاغ #{item.id}</span>
        <Link
          to="/search"
          className="text-xs font-semibold text-[#10243b] hover:text-amber-700 hover:underline flex items-center gap-1"
        >
          تعرف على المزيد
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}