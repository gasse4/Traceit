import { useEffect, useState } from "react";
import { Icon } from "./Icons.jsx";
import { t } from "../i18n.jsx";

// Must match backend ALLOWED_FORMATS / MAX_IMAGE_BYTES.
const ACCEPT = "image/jpeg,image/png";
const MAX_BYTES = 10 * 1024 * 1024;

/** Click-or-drop image field with a live preview. Controlled: `file` + `onChange(file|null)`. */
export default function ImagePicker({ file, onChange, onError, label, aspect = "aspect-video" }) {
  const [loaded, setLoaded] = useState({ file: null, url: null });
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLoaded({ file, url: reader.result });
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  // Only show a preview that belongs to the current file.
  const preview = file && loaded.file === file ? loaded.url : null;

  function pick(e) {
    const next = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!next) return;
    if (!ACCEPT.split(",").includes(next.type)) return onError(t("picker.error.format"));
    if (next.size > MAX_BYTES) return onError(t("picker.error.size"));
    onError("");
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="group relative">
        <div
          className={`${aspect} relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
            preview ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-sand group-hover:border-ink"
          }`}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 transition-colors group-hover:text-slate-600">
              <Icon name="image" className="mb-2 h-9 w-9 opacity-60" />
              <span className="text-sm font-medium">{label}</span>
              <span className="mt-1 text-xs">{t("picker.hint")}</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept={ACCEPT}
          onChange={pick}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute end-2 top-2 z-10 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            {t("picker.remove")}
          </button>
        )}
      </div>
      {file && (
        <p className="tnum text-xs text-slate-500">
          {file.name} · {Math.round(file.size / 1024)} KB
        </p>
      )}
    </div>
  );
}
