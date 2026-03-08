const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://baybay.onrender.com/api");

async function http(path, options = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
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
  products: ({ limit = 100 } = {}) =>
    http(`/products?limit=${limit}`),

  artisansFeatured: () =>
    http(`/artisans?featured=true`),

  artisansAll: () =>
    http(`/artisans`),

  team: () =>
    http(`/team`),

  productVariants: (productId) =>
    http(`/product-variants?product_id=${productId}`),

  search: (q) =>
    http(`/search?q=${encodeURIComponent(q ?? "")}`),
};