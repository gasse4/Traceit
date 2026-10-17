import { useState } from "react";
import { api } from "../api.js";
import { Alert } from "../components/Feedback.jsx";
import ImagePicker from "../components/ImagePicker.jsx";
import { useLanguage } from "../i18n.jsx";

const EMPTY = { name: "", description: "", location: "", color: "" };

/** Lost / found report form. `type` is "lost" or "found". */
export default function ReportForm({ type }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFound = type === "found";
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (Object.values(form).some((v) => !v.trim())) {
      setError(t("form.error.required"));
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()));
    if (image) fd.append("image", image);
    setSubmitting(true);
    try {
      const { id } = await api.report(type, fd);
      setMessage(t("form.success", { id }));
      setForm(EMPTY);
      setImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-4">
      <header className="mb-8 border-b border-ink pb-5">
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
              isFound ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-amber-300 bg-amber-100 text-amber-800"
            }`}
          >
            {isFound ? t("form.badge.found") : t("form.badge.lost")}
          </span>
          <h1 className="text-2xl font-bold">{isFound ? t("form.title.found") : t("form.title.lost")}</h1>
        </div>
        <p className="text-slate-600">
          {isFound
            ? t("form.desc.found")
            : t("form.desc.lost")}
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6 border border-slate-300 bg-paper p-5 shadow-[8px_8px_0_var(--color-gold)] sm:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.field.name")} placeholder={t("form.placeholder.name")} value={form.name} onChange={set("name")} />
          <Field label={t("form.field.color")} placeholder={t("form.placeholder.color")} value={form.color} onChange={set("color")} />
        </div>
        <Field label={t("form.field.description")} placeholder={t("form.placeholder.description")} value={form.description} onChange={set("description")} multiline />
        <Field
          label={t("form.field.location")}
          placeholder={isFound ? t("form.placeholder.location.found") : t("form.placeholder.location.lost")}
          value={form.location}
          onChange={set("location")}
        />

        <div className="space-y-2">
          <span className="block text-sm font-semibold">{t("form.photo.label")}</span>
          <ImagePicker file={image} onChange={setImage} onError={setError} label={t("form.photo.pickerLabel")} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-ink py-4 text-lg font-bold text-amber-200 shadow-lg transition-all hover:bg-ink-soft active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white"
        >
          {submitting ? t("form.submitting") : t("form.submit")}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
      </div>
    </section>
  );
}

const INPUT =
  "w-full border border-slate-300 bg-field px-4 py-3 transition-all focus:border-ink focus:outline-none focus:ring-2 focus:ring-amber-300";

function Field({ label, multiline, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label} <span className="text-red-600">*</span>
      </span>
      {multiline ? <textarea rows={3} required {...props} className={`${INPUT} resize-none`} /> : <input required {...props} className={INPUT} />}
    </label>
  );
}
