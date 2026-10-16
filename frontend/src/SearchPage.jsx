import { useState } from "react";
import { api } from "./api";

/* ---------- SVG Icons ---------- */
const IconLocation = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconColor = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z" />
  </svg>
);

const IconHamming = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconImage = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconDocument = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconFound = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
  </svg>
);

const IconLost = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012 2m0 0l2 2m-2-2v10a2 2 0 01-2 2h-2a2 2 0 00-2-2v-2m2-2h-2a2 2 0 00-2 2m2-2V7a2 2 0 00-2-2H7a2 2 0 01-2 2v2" />
  </svg>
);

/* ---------- Result Card ---------- */
function ResultCard({ item, showSim, index }) {
  const isFound = item.type === "found";
  const variant = index % 4;

  const base = "border border-slate-300 bg-[#f7f4ec] p-6 shadow-[6px_6px_0_#d9b45c] hover:shadow-[8px_8px_0_#d9b45c] transition-all group relative overflow-hidden";
  const accentLeft =
    variant === 0 ? "border-l-4 border-[#10243b]" :
    variant === 1 ? "border-l-4 border-emerald-600" :
    variant === 2 ? "border-l-4 border-amber-500" :
    "border-l-4 border-slate-500";

  const typeBadge = isFound
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : "bg-amber-100 text-amber-800 border-amber-300";
  const typeIcon = isFound ? <IconFound className="w-3 h-3 mr-1.5" /> : <IconLost className="w-3 h-3 mr-1.5" />;

  return (
    <div className={`${base} ${accentLeft}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {typeIcon}
          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${typeBadge}`}>
            {isFound ? "موجود" : "مفقود"}
          </span>
        </div>
        {showSim && item.similarity != null && (
          <span className="border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            تطابق {item.similarity}%
          </span>
        )}
      </div>

      <div className="mb-4 relative border-b border-slate-300 pb-4">
        {item.image_path ? (
          <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 border border-slate-300 group-hover:scale-105 transition-transform duration-300">
            <img src={api.imageUrl(item.image_path)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full bg-[#e9e4d8] border border-dashed border-slate-400 flex items-center justify-center">
            <IconDocument className="w-10 h-10 text-slate-400" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-[#10243b] text-amber-200 text-[10px] px-2 py-1 font-mono font-medium">
          #{item.id}
        </div>
      </div>

      <h3 className="font-bold text-lg text-on-surface mb-2 leading-tight">{item.name}</h3>
      <p className="text-sm text-slate-600 mb-5 line-clamp-2">{item.description}</p>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-6">
        <div className="flex items-center gap-2">
          <IconLocation />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconColor />
          <span>{item.color}</span>
        </div>
      </div>

      {showSim && item.hamming_distance != null && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>مسافة هامينج</span>
            <span>{item.hamming_distance}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ width: Math.max(0, 100 - item.hamming_distance) + "%" }} />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">رقم البلاغ</span>
        <a href="#" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          تفاصيل أكثر
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 border border-slate-300 bg-[#e9e4d8] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-slate-500 max-w-xs">{desc}</p>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function SearchPage() {
  const [tab, setTab] = useState("text");
  const [query, setQuery] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [textResults, setTextResults] = useState([]);
  const [imageResults, setImageResults] = useState([]);
  const [imagePHash, setImagePHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function doText(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.searchText(query);
      setTextResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function doImage(e) {
    e?.preventDefault();
    if (!imageFile) return;
    setError("");
    setLoading(true);
    const fd = new FormData();
    fd.append("image", imageFile);
    try {
      const data = await api.searchImage(fd);
      setImageResults(data.results || []);
      setImagePHash(data.query_phash || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function badgeColor(sim) {
    if (sim == null) return "bg-slate-100 text-slate-700 border-slate-200";
    if (sim >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (sim >= 50) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("الرجاء اختيار صورة فقط.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  return (
    <section className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Disclaimer */}
      <div className="bg-[#f7f4ec] border border-amber-400 p-5 flex items-start gap-3 shadow-[5px_5px_0_#d9b45c]">
        <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <div className="font-bold text-amber-800">النتائج معروضة كـ "محتملة"</div>
          <div className="text-sm text-amber-700 opacity-90">يجب التحقق من الملكية يدويًا والتواصل مع صاحب البلاغ قبل تسليم أي عنصر.</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-300 pb-3">
        <button
          onClick={() => setTab("text")}
          className={`px-6 py-3 font-semibold transition-all ${tab === "text" ? "bg-[#10243b] text-amber-200 shadow-md" : "bg-[#e9e4d8] text-slate-600 border border-slate-300 hover:bg-white"}`}
        >
          بحث نصي
        </button>
        <button
          onClick={() => setTab("image")}
          className={`px-6 py-3 font-semibold transition-all ${tab === "image" ? "bg-[#10243b] text-amber-200 shadow-md" : "bg-[#e9e4d8] text-slate-600 border border-slate-300 hover:bg-white"}`}
        >
          بحث بالصور
        </button>
      </div>

      {/* Text search */}
      {tab === "text" && (
        <div className="space-y-5">
          <form onSubmit={doText} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input className="flex-1 px-5 py-4 border border-slate-300 bg-[#fffdf8] text-on-surface focus:ring-2 focus:ring-amber-300 focus:border-[#10243b] transition-all" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم، الوصف، المكان أو اللون…" />
            <button type="submit" disabled={loading} className="px-8 py-4 bg-[#10243b] text-amber-200 font-semibold hover:bg-[#1d3b5b] transition-all disabled:opacity-70 active:scale-95">
              بحث
            </button>
          </form>
          {loading && <p className="text-sm text-slate-500">جاري البحث في البلاغات…</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {textResults.length > 0 ? (
              textResults.map((r, i) => <ResultCard key={r.id} item={r} showSim={false} index={i} />)
            ) : (
              <EmptyState icon={<IconSearch className="w-8 h-8" />} title={query ? "لا توجد نتائج" : "ابدأ بالبحث"} desc={query ? "جرب كلمة مفتاحية مختلفة أو ابحث بالصورة." : "أدخل كلمة مفتاحية للبحث عن المفقودات."} />
            )}
          </div>
        </div>
      )}

      {/* Image search */}
      {tab === "image" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-xl">
            <div className="relative group w-full sm:w-80">
              <div className={`aspect-square border-2 border-dashed ${preview ? "bg-emerald-50 border-emerald-300 group-hover:border-emerald-500" : "bg-[#e9e4d8] border-slate-300 group-hover:border-[#10243b]"} overflow-hidden relative`}>
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                    <svg className="w-10 h-10 mb-3 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">ارفع صورة العنصر</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImage} />
              {imagePHash && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  بصمة البحث: {imagePHash}
                </div>
              )}
            </div>
            <div className="flex-1">
              <button onClick={doImage} disabled={loading || !imageFile} className="w-full py-4 bg-[#10243b] text-amber-200 font-semibold hover:bg-[#1d3b5b] transition-all disabled:opacity-70 active:scale-95">
                مقارنة الصور
              </button>
              {loading && <p className="mt-3 text-sm text-slate-500">جاري حساب البصمة الرقمية والمقاربة…</p>}
            </div>
          </div>

          {imagePHash && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {imageResults.length > 0 ? (
                imageResults.map((r, i) => <ResultCard key={r.id} item={r} showSim={true} index={i} />)
              ) : (
                <EmptyState icon={<IconImage className="w-8 h-8" />} title="لا توجد صور متطابقة" desc="جرب صورة أوضح أو ابحث نصيًا باسم العنصر." />
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
      )}
    </section>
  );
}
