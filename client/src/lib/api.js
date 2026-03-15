import { getAuthToken } from "./authToken";

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function resolveApiUrl() {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
  const isDev = import.meta.env.MODE === "development";
  const fallbackUrl = isDev ? "http://localhost:5000" : "https://baybay.onrender.com";
  const preferredUrl = isDev
    ? baseUrl || configuredApiUrl || fallbackUrl
    : configuredApiUrl || baseUrl || fallbackUrl;

  const resolved = trimTrailingSlash(preferredUrl);
  return /\/api$/i.test(resolved) ? resolved : `${resolved}/api`;
}

const API_URL = resolveApiUrl();

async function http(path, options = {}) {
  try {
    const authToken = getAuthToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");

    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const api = {
  login: ({ email, password }) =>
    http(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: ({ full_name, email, password }) =>
    http(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    }),

  me: () => http(`/auth/me`),

  products: ({ limit = 100 } = {}) =>
    http(`/products?limit=${limit}`),

  artisansFeatured: () =>
    http(`/artisans?featured=true`),

  artisansAll: () =>
    http(`/artisans`),

  team: () =>
    http(`/team`),

  tiktokVideos: ({ featured, active = true, limit = 12 } = {}) => {
    const params = new URLSearchParams();
    if (typeof featured === "boolean") {
      params.set("featured", featured ? "true" : "false");
    }
    if (typeof active === "boolean") {
      params.set("active", active ? "true" : "false");
    }
    params.set("limit", String(limit));
    return http(`/tiktok-videos?${params.toString()}`);
  },

  productVariants: (productId) =>
    http(`/product-variants?product_id=${productId}`),

  search: (q) =>
    http(`/search?q=${encodeURIComponent(q ?? "")}`),

  subscribeNewsletter: ({ email }) =>
    http(`/newsletter/subscribe`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  requestOtp: ({ email, purpose }) =>
    http(`/auth/request-otp`, {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    }),

  verifyOtp: ({ email, purpose, otp }) =>
    http(`/auth/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ email, purpose, otp }),
    }),

  resetPasswordWithOtp: ({ email, otp, newPassword }) =>
    http(`/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    }),
};
