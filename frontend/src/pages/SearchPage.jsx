import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Disclaimer, EmptyState } from "../components/Feedback.jsx";
import ImagePicker from "../components/ImagePicker.jsx";
import ReportCard from "../components/ReportCard.jsx";
import { useLanguage } from "../i18n.jsx";

const TABS = [
  { id: "text", key: "search.tab.text" },
  { id: "image", key: "search.tab.image" },
];

export default function SearchPage() {
  const { t } = useLanguage();
  // Active tab lives in the URL (?tab=image) so it can be linked and survives refresh.
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "image" ? "image" : "text";

  return (
    <section className="mx-auto max-w-6xl space-y-8 py-4">
      <Disclaimer />

      <div role="tablist" className="flex gap-1 border-b border-slate-300 pb-3">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setParams(tb.id === "text" ? {} : { tab: tb.id }, { replace: true })}
            className={`px-6 py-3 font-semibold transition-all ${
              tab === tb.id ? "bg-ink text-amber-200 shadow-md" : "border border-slate-300 bg-sand text-slate-600 hover:bg-white"
            }`}
          >
            {t(tb.key)}
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
  const { t } = useLanguage();
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
          placeholder={t("search.placeholder")}
          aria-label={t("search.ariaLabel")}
          className="flex-1 border border-slate-300 bg-field px-5 py-4 transition-all focus:border-ink focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button type="submit" disabled={loading || !query.trim()} className="bg-ink px-8 py-4 font-semibold text-amber-200 transition-all hover:bg-ink-soft active:scale-95 disabled:opacity-60">
          {loading ? t("search.searching") : t("search.search")}
        </button>
      </form>

      {error && <Alert kind="error">{error}</Alert>}
      {searched !== null && (
        <p className="tnum text-sm text-slate-500">
          {t("search.resultsCount", { count: results.length, query: searched })}
        </p>
      )}
      <ResultsGrid
        results={results}
        empty={
          searched === null
            ? { icon: "search", title: t("search.empty.start.title"), desc: t("search.empty.start.desc") }
            : { icon: "search", title: t("search.empty.none.title"), desc: t("search.empty.none.desc") }
        }
      />
    </div>
  );
}

function ImageSearch() {
  const { t } = useLanguage();
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
          <ImagePicker file={file} onChange={onPick} onError={setError} label={t("search.image.pickerLabel")} aspect="aspect-square" />
        </div>
        <div className="flex-1 space-y-3">
          <button onClick={onSearch} disabled={loading || !file} className="w-full bg-ink py-4 font-semibold text-amber-200 transition-all hover:bg-ink-soft active:scale-95 disabled:opacity-60">
            {loading ? t("search.image.computing") : t("search.image.compare")}
          </button>
          {result && (
            <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
              {t("search.image.fingerprint")}
              <code dir="ltr" className="font-mono">{result.query_phash}</code>
            </div>
          )}
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {result && (
        <ResultsGrid
          results={result.results}
          empty={{ icon: "image", title: t("search.image.empty.title"), desc: t("search.image.empty.desc") }}
        />
      )}
    </div>
  );
}
