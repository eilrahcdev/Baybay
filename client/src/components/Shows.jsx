import { useMemo, useState } from "react";

export default function Shows({ products = [], onQuickView }) {
  const [favorites, setFavorites] = useState(() => new Set());

  const items = useMemo(() => products, [products]);

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="shows" className="py-12 px-6 bg-white reveal-section">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <span className="text-[#7C3A2E] font-bold tracking-wider uppercase text-sm">
              Our Delicacies
            </span>
            <h2 className="font-display text-4xl font-bold text-gray-900 mt-2">
              Native Puto Varieties
            </h2>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-gray-600 hover:text-[#7C3A2E] transition font-medium"
          >
            View All Products <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              No products yet
            </h3>
            <p className="mt-2 text-gray-600">
              Add products in Supabase (table: <b>products</b>) and refresh.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="material-icons text-base">info</span>
              Tip: make sure your API returns <code className="px-2 py-1 bg-white border rounded">id</code>, <code className="px-2 py-1 bg-white border rounded">name</code>, <code className="px-2 py-1 bg-white border rounded">price</code>, <code className="px-2 py-1 bg-white border rounded">image_url</code>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((p, idx) => {
              const isFav = favorites.has(p.id);

              const badge =
                p.is_featured ? { text: "Bestseller", cls: "badge-primary" } :
                idx === 3 ? { text: "New", cls: "badge-new" } :
                idx === 6 ? { text: "Savory", cls: "badge-savory" } :
                null;

              return (
                <div
                  key={p.id}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col border border-gray-100"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      alt={p.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={p.image_url}
                      loading="lazy"
                    />
                    <div className="card-overlay">
                      <button
                        type="button"
                        className="quick-view-btn"
                        onClick={() => onQuickView?.(p)}
                      >
                        Quick View
                      </button>
                    </div>
                    {badge ? <span className={badge.cls}>{badge.text}</span> : null}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <h3 className="font-display text-xl font-bold text-gray-900 group-hover:text-[#7C3A2E] transition-colors">
                        {p.name}
                      </h3>

                      <button
                        type="button"
                        onClick={() => toggleFav(p.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <span className="material-icons">
                          {isFav ? "favorite" : "favorite_border"}
                        </span>
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {p.description || "Handcrafted with love and tradition."}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xl font-bold text-[#7C3A2E]">
                        Php {Number(p.price || 0).toFixed(0)}
                      </span>

                      <button
                        type="button"
                        className="bg-[#7C3A2E]/10 hover:bg-[#7C3A2E] text-[#7C3A2E] hover:text-white p-2 rounded-full transition-colors"
                        aria-label="Add to cart"
                      >
                        <span className="material-icons text-sm">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-12 space-x-2">
          <button type="button" className="page-btn active">1</button>
          <button type="button" className="page-btn">2</button>
          <button type="button" className="page-btn">3</button>
          <button type="button" className="page-btn" aria-label="Next page">
            <span className="material-icons text-sm">arrow_forward_ios</span>
          </button>
        </div>
      </div>
    </section>
  );
}
