import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Disclaimer, EmptyState } from "../components/Feedback.jsx";
import ImagePicker from "../components/ImagePicker.jsx";
import ReportCard from "../components/ReportCard.jsx";

const TABS = [
  { id: "text", label: "بحث نصي" },
  { id: "image", label: "بحث بالصور" },
];

export default function SearchPage() {
  // Active tab lives in the URL (?tab=image) so it can be linked and survives refresh.
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "image" ? "image" : "text";

  return (
    <section className="mx-auto max-w-6xl space-y-8 py-4">
      <Disclaimer />

      <div role="tablist" className="flex gap-1 border-b border-slate-300 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === "text" ? {} : { tab: t.id }, { replace: true })}
            className={`px-6 py-3 font-semibold transition-all ${
              tab === t.id ? "bg-ink text-amber-200 shadow-md" : "border border-slate-300 bg-sand text-slate-600 hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Both stay mounted so switching tabs keeps each one's results. */}
      <div hidden={tab !== "text"}>
        <TextSearch />
      </div>
      <div hidden={tab !== "image"}>
        <ImageSearch />
      </div>
    </section>
  );
}

function ResultsGrid({ results, empty }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {results.length > 0 ? results.map((r) => <ReportCard key={r.id} item={r} />) : <EmptyState {...empty} />}
    </div>
  );
}

function TextSearch() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(null); // last submitted query
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.searchText(q);
      setResults(data.results);
      setSearched(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم، الوصف، المكان أو اللون…"
          aria-label="نص البحث"
          className="flex-1 border border-slate-300 bg-field px-5 py-4 transition-all focus:border-ink focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button type="submit" disabled={loading || !query.trim()} className="bg-ink px-8 py-4 font-semibold text-amber-200 transition-all hover:bg-ink-soft active:scale-95 disabled:opacity-60">
          {loading ? "جارٍ البحث…" : "بحث"}
        </button>
      </form>

      {error && <Alert kind="error">{error}</Alert>}
      {searched !== null && (
        <p className="tnum text-sm text-slate-500">
          {results.length} نتيجة لـ "{searched}"
        </p>
      )}
      <ResultsGrid
        results={results}
        empty={
          searched === null
            ? { icon: "search", title: "ابدأ بالبحث", desc: "أدخل كلمة مفتاحية للبحث عن المفقودات." }
            : { icon: "search", title: "لا توجد نتائج", desc: "جرب كلمة مفتاحية مختلفة أو ابحث بالصورة." }
        }
      />
    </div>
  );
}

function ImageSearch() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null); // { query_phash, results }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSearch() {
    setError("");
    setLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      setResult(await api.searchImage(fd));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onPick(next) {
    setFile(next);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex max-w-2xl flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <ImagePicker file={file} onChange={onPick} onError={setError} label="ارفع صورة العنصر" aspect="aspect-square" />
        </div>
        <div className="flex-1 space-y-3">
          <button onClick={onSearch} disabled={loading || !file} className="w-full bg-ink py-4 font-semibold text-amber-200 transition-all hover:bg-ink-soft active:scale-95 disabled:opacity-60">
            {loading ? "جارٍ حساب البصمة والمقارنة…" : "مقارنة الصور"}
          </button>
          {result && (
            <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
              بصمة الصورة (pHash):
              <code dir="ltr" className="font-mono">{result.query_phash}</code>
            </div>
          )}
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {result && (
        <ResultsGrid
          results={result.results}
          empty={{ icon: "image", title: "لا توجد صور للمقارنة", desc: "لا توجد بلاغات تحتوي على صور بعد. جرب البحث النصي." }}
        />
      )}
    </div>
  );
}
