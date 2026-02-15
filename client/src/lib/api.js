const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function http(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export const api = {
  products: ({ limit = 100 } = {}) => http(`/products?limit=${limit}`),

  artisansFeatured: () => http(`/artisans?featured=true`),
  artisansAll: () => http(`/artisans`),

  team: () => http(`/team`),

  productVariants: (productId) =>
    http(`/product-variants?product_id=${productId}`),

  search: (q) =>
    http(`/search?q=${encodeURIComponent(q || "")}`),
};
