import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";

export default function Shows({
  featured = [],
  loading = false,
  onQuickView,
  onViewAll,
}) {
  return (
    <section
      id="products"
      className="relative -mt-1 bg-[linear-gradient(180deg,#fef7f1_0%,#fcf3ec_100%)] pt-0 pb-14 sm:pb-18"
    >
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

          {typeof onViewAll === "function" ? (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#7C3A2E] transition hover:bg-white"
            >
              View All Products <span className="material-icons text-sm">arrow_forward</span>
            </button>
          ) : (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#7C3A2E] transition hover:bg-white"
            >
              View All Products <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          )}
        </div>

        <div className="surface-card p-5 sm:p-8">
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

          <ProductGrid
            products={featured}
            loading={loading}
            onQuickView={onQuickView}
            gridClassName="grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-3"
          />

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
