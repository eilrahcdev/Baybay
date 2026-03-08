const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

export function resolveImageUrl(imageUrl, fallback = "") {
  const raw = String(imageUrl || "").trim();
  const safeFallback = String(fallback || "").trim();

  if (!raw) return safeFallback;

  // Already absolute URL or data URI
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  // Relative upload path from backend
  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${trimTrailingSlash(API_BASE_URL)}${normalizedPath}`;
}