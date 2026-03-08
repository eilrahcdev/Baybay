import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ProductGrid from "../components/ProductGrid";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { useAuth } from "../auth/AuthProvider";

export default function ProductsPage({ categories = {}, loading = false }) {
  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // If user is not logged in, redirect to Home and open the auth modal there.
  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      navigate("/", {
        replace: true,
        state: { authGate: { from: location.pathname + location.search } },
      });
    }
  }, [user, loadingAuth, navigate, location.pathname, location.search]);

  const orderedCategories = useMemo(() => {
    const keys = Object.keys(categories || {});
    const preferred = ["Food Delicacies", "Furniture", "Clay Pottery", "Bamboo Crafts"];
    return [
      ...preferred.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !preferred.includes(k)),
    ];
  }, [categories]);

  // Render nothing while checking auth or redirecting.
  if (loadingAuth || !user) return null;

  return (
    <>
      <section className="page-shell py-10 sm:py-14">
        <div className="container">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/25 bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#7C3A2E] shadow-sm transition hover:bg-white"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-[#7C3A2E] font-display text-3xl sm:text-4xl font-bold">
              All Products
            </h1>
            <p className="mt-2 text-sm text-black/60">Browse everything by category.</p>
          </div>

          <div className="space-y-12">
            {orderedCategories.map((cat) => (
              <div key={cat} className="surface-card p-5 sm:p-7">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#7C3A2E]">{cat}</h2>
                  <span className="text-sm text-black/50">
                    {categories[cat]?.length || 0} items
                  </span>
                </div>

                <ProductGrid
                  products={categories[cat]}
                  loading={loading}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
