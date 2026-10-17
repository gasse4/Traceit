import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Icon } from "../components/Icons.jsx";
import { Alert, EmptyState, Spinner } from "../components/Feedback.jsx";
import ReportCard from "../components/ReportCard.jsx";

const STATS = [
  { key: "total_reports", label: "إجمالي البلاغات", icon: "document" },
  { key: "lost_reports", label: "بلاغات مفقودات", icon: "question" },
  { key: "found_reports", label: "بلاغات موجودات", icon: "check" },
  { key: "with_image", label: "بلاغات بصورة", icon: "image" },
];

const ACTIONS = [
  { to: "/search", icon: "search", title: "البحث النصي", desc: "ابحث بالاسم، الوصف، المكان أو اللون" },
  { to: "/search?tab=image", icon: "image", title: "البحث بالصورة", desc: "ارفع صورة وقارن بصمتها الرقمية" },
  { to: "/report-lost", icon: "document", title: "إبلاغ جديد", desc: "سجل عنصرًا مفقودًا أو موجودًا بسهولة" },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats(), api.listReports()])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r.results.slice(0, 3));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="جاري تحميل البيانات…" />;

  return (
    <div className="space-y-10">
      <Hero />

      {error && <Alert kind="error">{error}</Alert>}

      {stats && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.key} className="border border-slate-300 bg-paper p-5 shadow-offset">
              <div className="mb-3 flex h-10 w-10 items-center justify-center border border-slate-300 bg-sand text-slate-600">
                <Icon name={s.icon} />
              </div>
              <div className="mb-1 text-xs font-semibold text-slate-500">{s.label}</div>
              <div className="tnum text-3xl font-black">{stats[s.key]}</div>
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="group border border-slate-300 bg-paper p-6 shadow-offset transition-all hover:-translate-y-1 hover:shadow-offset-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand transition-transform group-hover:scale-110">
              <Icon name={a.icon} className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold">{a.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{a.desc}</p>
          </Link>
        ))}
      </section>

      <section className="border-t border-slate-300 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">آخر البلاغات</h2>
          <Link to="/search" className="text-sm font-medium hover:text-amber-700 hover:underline">
            ابحث في الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {recent.length > 0 ? (
            recent.map((item) => <ReportCard key={item.id} item={item} />)
          ) : (
            !error && <EmptyState icon="document" title="لا توجد بلاغات بعد" desc="كن أول من يسجل بلاغًا." />
          )}
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-ink text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div className="absolute start-8 top-8 h-16 w-16 border-s border-t border-emerald-300/60" />
      <div className="absolute bottom-8 end-8 h-16 w-16 border-e border-b border-amber-300/60" />

      <div className="relative grid gap-12 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-3 border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            TRACEIT / نظام التتبع الذكي
          </div>
          <h1 className="mb-5 max-w-2xl text-4xl font-black leading-[1.2] sm:text-6xl">
            كل غرض له أثر.
            <span className="mt-2 block text-amber-200">ابدأ بتتبّعه.</span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            ابحث في بلاغات الحرم الجامعي بالنص أو الصورة، واترك المطابقة الذكية تقرّبك من صاحب الغرض الحقيقي.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/search" className="inline-flex items-center gap-3 bg-amber-300 px-6 py-3.5 font-bold text-slate-950 transition-colors hover:bg-amber-200 active:scale-95">
              ابدأ البحث <span aria-hidden="true">←</span>
            </Link>
            <Link to="/report-found" className="border border-white/30 px-6 py-3.5 font-semibold transition-colors hover:border-emerald-200 hover:bg-white/10 active:scale-95">
              أبلغ عن غرض موجود
            </Link>
          </div>
        </div>

        {/* Illustration of how a match record looks (static sample, not real data). */}
        <div className="relative mx-auto w-full max-w-md" dir="ltr" aria-hidden="true">
          <div className="absolute -left-3 -top-3 border border-amber-300/60 bg-ink px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-amber-200">
            SAMPLE / 01
          </div>
          <div className="border border-slate-300/40 bg-paper p-4 text-slate-900 shadow-[12px_12px_0_var(--color-gold)]">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              <span>Trace record</span>
              <span className="text-emerald-700">● probable match</span>
            </div>
            <div className="grid grid-cols-[88px_1fr] gap-4 py-5">
              <div className="relative flex h-24 items-center justify-center border border-dashed border-slate-400 bg-sand">
                <div className="h-12 w-12 rotate-45 border-2 border-slate-700 bg-[#c8c1b2]" />
                <span className="absolute bottom-1 left-1 font-mono text-[8px] text-slate-500">IMG_HASH</span>
              </div>
              <div dir="rtl" className="text-right">
                <p className="mb-1 font-mono text-[10px] text-slate-500">OBJECT / FOUND</p>
                <h2 className="text-xl font-black">مفتاح أسود</h2>
                <p className="mt-2 text-xs leading-5 text-slate-600">مبنى الهندسة · البهو الرئيسي</p>
              </div>
            </div>
            <div className="tnum grid grid-cols-2 gap-2 border-t border-slate-300 pt-3 font-mono text-[10px]">
              <div className="border-r border-slate-300 pr-3">
                <span className="block text-slate-500">PHASH / HAMMING</span>
                <strong className="text-emerald-700">92% SIMILAR</strong>
              </div>
              <div>
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
  );
}
