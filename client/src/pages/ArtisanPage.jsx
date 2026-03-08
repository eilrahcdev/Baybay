import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, PlayCircle } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

import ProductGrid from "../components/ProductGrid";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/imageUrl";

function inferCategoryFromArtisan(artisan) {
  const text = `${artisan?.name || ""} ${artisan?.title || ""}`.toLowerCase();

  if (text.includes("puto")) return "Food Delicacies";
  if (text.includes("furniture") || text.includes("wood")) return "Furniture";
  if (text.includes("clay") || text.includes("pottery")) return "Clay Pottery";
  if (text.includes("bamboo")) return "Bamboo Crafts";

  return null;
}

const STOP_WORDS = new Set([
  "and",
  "the",
  "of",
  "with",
  "from",
  "local",
  "artisan",
  "artisans",
  "craft",
  "crafts",
]);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTokens(value) {
  return normalizeText(value)
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function findBestTiktokForArtisan(artisan, videos = []) {
  const list = Array.isArray(videos) ? videos : [];
  if (!artisan || list.length === 0) return null;

  const artisanTitleText = normalizeText(artisan?.title || "");
  const artisanContext = `${artisan?.title || ""} ${artisan?.name || ""}`;
  const artisanTokens = new Set(toTokens(artisanContext));
  let best = null;
  let bestScore = -1;

  for (const video of list) {
    const videoTitle = normalizeText(video?.title || "");
    const titleTokens = toTokens(videoTitle);
    if (!videoTitle || !video?.video_url) continue;

    let score = 0;
    if (artisanTitleText && (artisanTitleText.includes(videoTitle) || videoTitle.includes(artisanTitleText))) {
      score += 8;
    }
    for (const token of titleTokens) {
      if (artisanTokens.has(token)) score += 1;
    }

    if (video?.is_featured) score += 0.25;

    if (score > bestScore) {
      best = video;
      bestScore = score;
    }
  }

  if (bestScore > 0) return best;
  return list.find((v) => v?.is_featured && v?.is_active !== false) || list[0] || null;
}

function decodeRouteValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw;
  }
}

function findArtisanByRouteId(list, routeId) {
  const target = decodeRouteValue(routeId);
  if (!target) return null;

  const asNumber = Number(target);
  const numeric = Number.isFinite(asNumber) ? String(asNumber) : null;
  const lower = target.toLowerCase();

  return (
    list.find((a) => String(a?.id ?? "").trim() === target) ||
    list.find((a) => String(a?.artisan_id ?? "").trim() === target) ||
    (numeric
      ? list.find((a) => String(a?.id ?? "").trim() === numeric) ||
        list.find((a) => String(a?.artisan_id ?? "").trim() === numeric)
      : null) ||
    list.find((a) => String(a?.name || "").trim().toLowerCase() === lower) ||
    null
  );
}

export default function ArtisanPage() {
  const { artisanId } = useParams();

  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      navigate("/", {
        replace: true,
        state: { authGate: { from: location.pathname + location.search } },
      });
    }
  }, [user, loadingAuth, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (loadingAuth || !user) return;

    let alive = true;

    async function load() {
      setLoading(true);

      const [artisanResult, productsResult, tiktokResult] = await Promise.allSettled([
        api.artisansAll(),
        api.products({ limit: 200 }),
        api.tiktokVideos({ featured: false, active: true, limit: 100 }),
      ]);

      if (!alive) return;

      const artisanList =
        artisanResult.status === "fulfilled" && Array.isArray(artisanResult.value)
          ? artisanResult.value
          : [];
      if (artisanResult.status === "rejected") {
        console.error("Failed to load artisans:", artisanResult.reason);
      }

      const productList =
        productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
          ? productsResult.value
          : [];
      if (productsResult.status === "rejected") {
        console.error("Failed to load products:", productsResult.reason);
      }

      const tiktokList =
        tiktokResult.status === "fulfilled" && Array.isArray(tiktokResult.value)
          ? tiktokResult.value
          : [];
      if (tiktokResult.status === "rejected") {
        console.error("Failed to load TikTok videos:", tiktokResult.reason);
      }

      setArtisan(findArtisanByRouteId(artisanList, artisanId));
      setProducts(productList);
      setTiktokVideos(tiktokList);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [artisanId, user, loadingAuth]);

  if (loadingAuth || !user) return null;

  const relatedProducts = useMemo(() => {
    if (!artisan) return [];
    const inferred = inferCategoryFromArtisan(artisan);
    if (!inferred) return [];

    return (products || []).filter(
      (p) => String(p?.category || "").trim() === inferred
    );
  }, [artisan, products]);

  const relatedTiktok = useMemo(() => {
    return findBestTiktokForArtisan(artisan, tiktokVideos);
  }, [artisan, tiktokVideos]);

  const facebookUrl =
    artisan?.facebook_url ||
    artisan?.facebook_link ||
    artisan?.facebook ||
    null;

  const image =
    resolveImageUrl(
      artisan?.image_url ||
        artisan?.artisan_image ||
        artisan?.photo_url ||
        artisan?.avatar_url ||
        artisan?.image,
      "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600"
    );

  return (
    <>
      {/* Navbar is hidden on this page. */}

      <section className="page-shell py-10 sm:py-14">
        <div className="container">

          {/* Back button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/25 bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#7C3A2E] shadow-sm transition hover:bg-white"
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
            <div className="surface-card p-10 text-center">
              <h1 className="text-2xl font-bold text-[#7C3A2E]">
                Artisan not found
              </h1>
              <p className="mt-2 text-black/60">
                Please go back and open an artisan again.
              </p>
            </div>
          ) : (
            <>
              {/* Artisan card */}
              <div className="surface-card overflow-hidden">
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

                    {/* Facebook link */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
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
                        <p className="text-sm text-black/50 mr-1">
                          No Facebook link available.
                        </p>
                      )}

                      {relatedTiktok?.video_url ? (
                        <a
                          href={relatedTiktok.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#7C3A2E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5e2b22]"
                          title={relatedTiktok?.title || "Watch on TikTok"}
                        >
                          Watch TikTok <PlayCircle size={16} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related products */}
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
                  <div className="surface-card mt-4 p-8 text-black/60">
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

      {/* Footer is hidden on this page. */}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
