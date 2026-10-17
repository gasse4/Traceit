import { Icon } from "./Icons.jsx";

/** Manual-verification notice (required wherever results are shown). */
export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 border border-amber-400 bg-paper p-5 shadow-offset">
      <Icon name="warning" strokeWidth={2} className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
      <div>
        <div className="font-bold text-amber-800">النتائج معروضة كـ "محتملة"</div>
        <div className="text-sm text-amber-700">
          يجب التحقق من الملكية يدويًا والتواصل مع صاحب البلاغ قبل تسليم أي عنصر.
        </div>
      </div>
    </div>
  );
}

const ALERT_STYLES = {
  success: { box: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: "check" },
  error: { box: "bg-red-50 border-red-200 text-red-800", icon: "close" },
};

export function Alert({ kind, children }) {
  const s = ALERT_STYLES[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${s.box}`}>
      <Icon name={s.icon} strokeWidth={2} className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center border border-slate-300 bg-sand text-slate-500">
        <Icon name={icon} className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-xs text-slate-500">{desc}</p>
    </div>
  );
}

export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-ink border-t-transparent" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
