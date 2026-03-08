const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://baybay.onrender.com/api");

function getApiOrigin() {
  return String(API_URL).replace(/\/api\/?$/, "");
}

export function resolveImageUrl(value, fallback = "") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  const origin = getApiOrigin().replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${encodeURI(path)}`;
}
