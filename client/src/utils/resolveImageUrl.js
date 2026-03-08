const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export function resolveImageUrl(imageUrl) {
  const raw = String(imageUrl || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE_URL.replace(/\/+$/, "")}${normalizedPath}`;
}