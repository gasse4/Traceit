const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  reportLost: (formData) =>
    request("/api/report/lost", { method: "POST", body: formData }),
  reportFound: (formData) =>
    request("/api/report/found", { method: "POST", body: formData }),
  listReports: () => request("/api/reports"),
  searchText: (q) => request(`/api/search/text?q=${encodeURIComponent(q)}`),
  searchImage: (formData) =>
    request("/api/search/image", { method: "POST", body: formData }),
  imageUrl: (path) => `${API_BASE}/${path}`,
};
