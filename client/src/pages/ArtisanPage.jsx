import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

import ProductGrid from "../components/ProductGrid";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { api } from "../lib/api";

function inferCategoryFromArtisan(artisan) {
  const text = `${artisan?.name || ""} ${artisan?.title || ""}`.toLowerCase();

  if (text.includes("puto")) return "Food Delicacies";
  if (text.includes("furniture") || text.includes("wood")) return "Furniture";
  if (text.includes("clay") || text.includes("pottery")) return "Clay Pottery";
  if (text.includes("bamboo")) return "Bamboo Crafts";

  return null;
}

export default function ArtisanPage() {
  const { artisanId } = useParams();

  const { user, loading: loadingAuth } = useAuth();
const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
  if (loadingAuth) return;
  if (!user) {
    navigate("/", {
      replace: true,
      state: { authGate: { from: location.pathname + location.search } },
    });
  }
}, [user, loadingAuth, navigate, location.pathname, location.search]);

if (loadingAuth || !user) return null;

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);

        const [artisanList, productList] = await Promise.all([
          api.artisansAll(),
          api.products({ limit: 200 }),
        ]);

        if (!alive) return;

        const list = Array.isArray(artisanList) ? artisanList : [];

        const found =
          list.find((a) => String(a.id) === String(artisanId)) ||
          list.find((a) => String(a.artisan_id) === String(artisanId)) ||
          null;

        setArtisan(found);
        setProducts(Array.isArray(productList) ? productList : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [artisanId]);

  const relatedProducts = useMemo(() => {
    if (!artisan) return [];
    const inferred = inferCategoryFromArtisan(artisan);
    if (!inferred) return [];

    return (products || []).filter(
      (p) => String(p?.category || "").trim() === inferred
    );
  }, [artisan, products]);

  const facebookUrl =
    artisan?.facebook_url ||
    artisan?.facebook_link ||
    artisan?.facebook ||
    null;

  const image =
    artisan?.image_url ||
    "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600";

  return (
    <>
      {/* Removed Navbar */}

      <section className="py-10 sm:py-14 bg-[#FDF8F4] min-h-screen">
        <div className="container">

          {/* ✅ Rounded Rectangle Back Button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-black/10 px-5 py-3 text-sm font-semibold text-black/70 shadow-soft hover:bg-black/5 transition"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          {loading ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-[360px] bg-black/10 rounded-3xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 w-2/3 bg-black/10 rounded animate-pulse" />
                <div className="h-5 w-1/3 bg-black/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-black/10 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-black/10 rounded animate-pulse" />
              </div>
            </div>
          ) : !artisan ? (
            <div className="rounded-2xl bg-white border border-black/10 p-10 text-center">
              <h1 className="text-2xl font-bold text-[#7C3A2E]">
                Artisan not found
              </h1>
              <p className="mt-2 text-black/60">
                Please go back and open an artisan again.
              </p>
            </div>
          ) : (
            <>
              {/* Artisan Card */}
              <div className="rounded-3xl bg-white border border-black/10 shadow-soft overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <div className="bg-black/5">
                    <img
                      src={image}
                      alt={artisan?.name || "Artisan"}
                      className="w-full h-[320px] lg:h-[420px] object-cover"
                    />
                  </div>

                  <div className="p-8 sm:p-10">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#7C3A2E]">
                      {artisan?.name}
                    </h1>

                    <p className="mt-2 text-baybay-accent font-semibold">
                      {artisan?.title || "Local Artisan"}
                    </p>

                    <p className="mt-5 text-black/70 leading-relaxed">
                      {artisan?.bio ||
                        "This artisan preserves traditional craftsmanship, passing skills from one generation to the next."}
                    </p>

                    {/* Facebook Button */}
                    <div className="mt-6">
                      {facebookUrl ? (
                        <a
                          href={facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-5 py-2 text-sm font-semibold text-black/70 hover:bg-black/5 transition"
                        >
                          Visit Facebook <ExternalLink size={16} />
                        </a>
                      ) : (
                        <p className="text-sm text-black/50">
                          No Facebook link available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Products */}
              <div className="mt-10">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#7C3A2E]">
                    Products / Artwork
                  </h2>
                  <span className="text-sm text-black/50">
                    {relatedProducts.length} items
                  </span>
                </div>

                {relatedProducts.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-white border border-black/10 p-8 text-black/60">
                    No related products found for this artisan yet.
                  </div>
                ) : (
                  <ProductGrid
                    products={relatedProducts}
                    loading={false}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Removed Footer */}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
