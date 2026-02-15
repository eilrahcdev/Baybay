import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";

export default function Shows({ featured = [], loading = false, onQuickView }) {
  return (
    <section id="products" className="py-12 sm:py-16">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[#7C3A2E] font-display text-3xl sm:text-4xl font-bold">
              Products
            </h2>
            <p className="mt-2 text-sm sm:text-base text-black/60">
              Hand-picked highlights from our collection.
            </p>
          </div>

          <Link
            to="/products"
            className="text-gray-600 hover:text-[#7C3A2E] transition font-medium inline-flex items-center gap-2"
          >
            View All Products <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur p-5 sm:p-8 shadow-soft">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#7C3A2E]">
                Featured Products
              </h3>
              <p className="mt-1 text-sm text-black/60">
                {loading ? "Loading..." : "Top picks you shouldn’t miss."}
              </p>
            </div>
          </div>

          <ProductGrid products={featured} loading={loading} onQuickView={onQuickView} />

          {!loading && featured.length === 0 && (
            <p className="mt-4 text-sm text-black/55">
              No featured products found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
