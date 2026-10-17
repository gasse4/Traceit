// Single place that talks to the backend. Point it elsewhere with VITE_API_BASE.
import { t } from "./i18n.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(t("api.error.connection"));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  /** type: "lost" | "found"; formData: name, description, location, color, image? */
  report: (type, formData) => request(`/api/report/${type}`, { method: "POST", body: formData }),
  listReports: () => request("/api/reports"),
  stats: () => request("/api/stats"),
  searchText: (q) => request(`/api/search/text?q=${encodeURIComponent(q)}`),
  searchImage: (formData) => request("/api/search/image", { method: "POST", body: formData }),
  imageUrl: (path) => `${API_BASE}/${path}`,
};
