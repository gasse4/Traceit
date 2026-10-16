import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export default function ReportForm({ type }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    color: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFound = type === "found";
  const title = isFound ? "إبلاغ عن موجود" : "إبلاغ عن مفقود";
  const badgeColor = isFound ? "emerald" : "blue";

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("الرجاء اختيار ملف صورة فقط.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("location", form.location);
    fd.append("color", form.color);
    if (image) fd.append("image", image);
    try {
      setSubmitting(true);
      if (isFound) await api.reportFound(fd);
      else await api.reportLost(fd);
      setMessage(isFound ? "تم إرسال بلاغ العثور بنجاح." : "تم إرسال بلاغ الفقدان بنجاح.");
      setForm({ name: "", description: "", location: "", color: "" });
      setImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto py-8">
      <div className="border-b border-[#10243b] pb-5 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          badgeColor === "emerald"
            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
            : "bg-amber-100 text-amber-800 border-amber-300"
        }`}>
          {isFound ? "موجود" : "مفقود"}
        </span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-slate-600">
        أدخل بيانات العنصر بوضوح وساعده في العودة لصاحبه أو العثور عليه.
      </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border border-slate-300 bg-[#f7f4ec] p-5 sm:p-8 shadow-[8px_8px_0_#d9b45c]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="اسم العنصر *" placeholder="مثال: سماعة لاسلكية" value={form.name} onChange={v=>setForm({...form,name:v})} />
          <Field label="اللون *" placeholder="أبيض، أسود، أحمر…" value={form.color} onChange={v=>setForm({...form,color:v})} />
        </div>
        <Field label="الوصف *" placeholder="تفاصيل مميزة تساعد في التعرف على العنصر" as="textarea" rows={3} value={form.description} onChange={v=>setForm({...form,description:v})} />
        <Field label="المكان *" placeholder="أين فقدت أو وجدت العنصر؟" value={form.location} onChange={v=>setForm({...form,location:v})} />

        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#10243b]">صورة العنصر (اختيارية)</label>
          <div className="relative group">
            <div className={`aspect-video rounded-2xl border-2 border-dashed ${
              preview
                ? "bg-blue-50 border-blue-200 group-hover:border-blue-400"
                : "bg-[#e9e4d8] border-slate-300 group-hover:border-[#10243b]"
            } overflow-hidden relative transition-all`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeImage} className="absolute left-2 top-2 bg-black/60 text-white text-xs rounded px-2 py-1 hover:bg-black/80">
                    إزالة
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                  <svg className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">ارفع صورة أو اسحبها هنا</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImage} />
          </div>
          {image && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
             ملف: {image.name} · {Math.round(image.size / 1024)} KB
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-70 ${
            submitting ? "bg-slate-400 text-white cursor-not-allowed" : "bg-[#10243b] text-amber-200 hover:bg-[#1d3b5b]"
          }`}
        >
          {submitting ? "جارٍ الإرسال…" : "إرسال البلاغ"}
        </button>
      </form>

      {message && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>{message}</div>
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>{error}</div>
        </div>
      )}
    </section>
  );
}

function Field({ label, placeholder, value, onChange, as = "input", rows }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <Element as={as} placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} rows={rows} />
    </div>
  );
}

function Element({ as, ...props }) {
  const Base = "w-full px-4 py-3 border border-slate-300 bg-[#fffdf8] text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-[#10243b] transition-all disabled:bg-slate-100";
  if (as === "textarea") {
    return <textarea {...props} rows={props.rows} className={`${Base} resize-none`} />;
  }
  return <input {...props} className={Base} />;
}
