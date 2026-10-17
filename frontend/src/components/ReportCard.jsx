import { api } from "../api.js";
import { Icon } from "./Icons.jsx";

// Similarity thresholds from PLAN.md § 7.2.
function matchLevel(similarity) {
  if (similarity >= 85) return { badge: "bg-emerald-100 text-emerald-800 border-emerald-300", bar: "bg-emerald-600" };
  if (similarity >= 50) return { badge: "bg-amber-100 text-amber-800 border-amber-300", bar: "bg-amber-500" };
  return { badge: "bg-slate-100 text-slate-700 border-slate-300", bar: "bg-slate-400" };
}

// SQLite stores CURRENT_TIMESTAMP in UTC as "YYYY-MM-DD HH:MM:SS".
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T") + "Z");
  return date.toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" });
}

/** One lost/found report. Pass `item.similarity` (image search) to show the match score. */
export default function ReportCard({ item }) {
  const isFound = item.type === "found";
  const scored = item.similarity != null;
  const score = item.match_score ?? item.visual_similarity ?? item.similarity;
  const level = scored ? matchLevel(score) : null;

  return (
    <article
      className={`relative flex flex-col border border-s-4 border-slate-300 bg-paper p-5 shadow-offset transition-shadow hover:shadow-offset-lg ${
        isFound ? "border-s-emerald-600" : "border-s-amber-500"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
            isFound ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-amber-300 bg-amber-100 text-amber-800"
          }`}
        >
          <Icon name={isFound ? "check" : "question"} className="h-3.5 w-3.5" strokeWidth={2} />
          {isFound ? "موجود" : "مفقود"}
        </span>
        {scored && (
          <span className={`tnum rounded-full border px-2.5 py-1 text-xs font-bold ${level.badge}`}>
            تطابق {score}%
          </span>
        )}
      </div>

      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden border border-slate-300 bg-sand">
        {item.image_path ? (
          <img
            src={api.imageUrl(item.thumb_path)}
            // Fall back to the original if the thumbnail is missing.
            onError={(e) => {
              const original = api.imageUrl(item.image_path);
              if (e.currentTarget.src !== original) e.currentTarget.src = original;
            }}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Icon name="document" className="h-10 w-10" />
          </div>
        )}
        <span className="tnum absolute bottom-2 start-2 bg-ink px-2 py-1 font-mono text-[10px] text-amber-200">
          #{item.id}
        </span>
      </div>

      <h3 className="mb-1 truncate text-lg font-bold">{item.name}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-600">{item.description}</p>

      <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-500">
        <Meta icon="location" label="المكان" value={item.location} />
        <Meta icon="color" label="اللون" value={item.color} />
        <Meta icon="time" label="التاريخ" value={formatDate(item.created_at)} className="col-span-2" />
      </dl>

      {scored && (
        <div className="mt-4 border-t border-slate-300 pt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>مسافة هامينج</span>
            <span className="tnum font-mono">{item.hamming_distance} / 64</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-slate-200">
            <div className={`h-full ${level.bar}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      )}
    </article>
  );
}

function Meta({ icon, label, value, className = "" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <Icon name={icon} className="h-4 w-4 shrink-0" />
      <dt className="sr-only">{label}</dt>
      <dd className="truncate">{value || "—"}</dd>
    </div>
  );
}
