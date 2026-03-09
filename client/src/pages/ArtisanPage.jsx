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
  if (
    text.includes("sword") ||
    text.includes("knife") ||
    text.includes("katana") ||
    text.includes("kris")
  ) {
    return "Crafts";
  }

  return null;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  return normalizeKey(value);
}

const ARTISAN_PRODUCT_RULES = [
  {
    artisanMatches: ["robert fernandez", "malasiqui furniture", "id:7"],
    includeNames: ["high chair", "sofa bed", "wooden table", "bed"],
  },
  {
    artisanMatches: ["marvin diso", "pozorrubio sword", "id:2"],
    includeNames: ["knife", "katana", "kris double blade", "kris double sword", "sword"],
  },
];

function getArtisanLookupKeys(artisan) {
  const keys = new Set();

  const nameKey = normalizeKey(artisan?.name);
  const titleKey = normalizeKey(artisan?.title);
  if (nameKey) keys.add(nameKey);
  if (titleKey) keys.add(titleKey);

  const idKey = String(artisan?.id ?? "").trim();
  if (idKey) keys.add(`id:${idKey}`);

  const artisanIdKey = String(artisan?.artisan_id ?? "").trim();
  if (artisanIdKey) keys.add(`artisan_id:${artisanIdKey}`);

  return keys;
}

function findRuleForArtisan(artisan) {
  const keys = getArtisanLookupKeys(artisan);
  if (keys.size === 0) return null;

  return (
    ARTISAN_PRODUCT_RULES.find((rule) =>
      (rule.artisanMatches || []).some((v) => keys.has(normalizeKey(v)))
    ) || null
  );
}

function getClaimedProductNamesByOtherRules(currentRule) {
  const claimed = new Set();

  for (const rule of ARTISAN_PRODUCT_RULES) {
    if (rule === currentRule) continue;
    for (const name of rule.includeNames || []) {
      const normalized = normalizeName(name);
      if (normalized) claimed.add(normalized);
    }
  }

  return claimed;
}

function productMatchesArtisanDirectly(product, artisan) {
  const artisanKeys = getArtisanLookupKeys(artisan);
  if (artisanKeys.size === 0) return false;

  const productKeys = new Set();
  const productArtisanId = String(product?.artisan_id ?? "").trim();
  if (productArtisanId) productKeys.add(`artisan_id:${productArtisanId}`);

  const productOwner = normalizeKey(product?.owner);
  const productArtisanName = normalizeKey(product?.artisan_name);
  const productArtisanTitle = normalizeKey(product?.artisan_title);

  if (productOwner) productKeys.add(productOwner);
  if (productArtisanName) productKeys.add(productArtisanName);
  if (productArtisanTitle) productKeys.add(productArtisanTitle);

  if (productKeys.size === 0) return false;

  for (const key of artisanKeys) {
    if (productKeys.has(key)) return true;
  }
  return false;
}

function selectRelatedProducts(artisan, products) {
  const list = Array.isArray(products) ? products : [];
  if (!artisan || list.length === 0) return [];

  const directlyLinked = list.filter((product) => productMatchesArtisanDirectly(product, artisan));
  if (directlyLinked.length > 0) return directlyLinked;

  const rule = findRuleForArtisan(artisan);

  if (rule?.includeNames?.length) {
    const includeSet = new Set(rule.includeNames.map((name) => normalizeName(name)));
    const explicitMatches = list.filter((product) =>
      includeSet.has(normalizeName(product?.name))
    );
    if (explicitMatches.length > 0) return explicitMatches;
  }

  const inferredCategory = normalizeKey(inferCategoryFromArtisan(artisan));
  if (!inferredCategory) return [];

  const claimedByOtherRules = getClaimedProductNamesByOtherRules(rule);

  return list.filter((product) => {
    const productCategory = normalizeKey(product?.category);
    if (productCategory !== inferredCategory) return false;

    const productName = normalizeName(product?.name);
    if (claimedByOtherRules.has(productName)) return false;

    return true;
  });
}

const ARTISAN_TIKTOK_URL_FALLBACK = {
  "san carlos bamboo basket": "https://vt.tiktok.com/ZSuYAtxRs/",
  "pozorrubio sword": "https://vt.tiktok.com/ZSuYAc8tt/",
  "calasaio puto": "https://vt.tiktok.com/ZSu2MUS1C/",
  "binmaley clay pottery": "https://vt.tiktok.com/ZSuYDDNSD/",
  "binmaley furniture": "https://vt.tiktok.com/ZSuYDqFj6/",
  "malasiqui furniture": "https://vt.tiktok.com/ZSuYDNnGo/",
  "josephine datuin": "https://vt.tiktok.com/ZSuYAtxRs/",
  "marvin diso": "https://vt.tiktok.com/ZSuYAc8tt/",
  "rufo dela cruz": "https://vt.tiktok.com/ZSu2MUS1C/",
  "juan lomibao": "https://vt.tiktok.com/ZSuYDDNSD/",
  "mike salinas": "https://vt.tiktok.com/ZSuYDqFj6/",
  "robert fernandez": "https://vt.tiktok.com/ZSuYDNnGo/",
};

function pickVideoUrl(video) {
  const url =
    video?.video_url ||
    video?.tiktok_url ||
    video?.url ||
    video?.link ||
    video?.tiktok_link ||
    null;
  const trimmed = String(url || "").trim();
  return trimmed || null;
}

function findTiktokUrlFromVideos(artisan, videos) {
  const list = Array.isArray(videos) ? videos : [];
  if (!artisan || list.length === 0) return null;

  const artisanId = String(artisan?.artisan_id ?? artisan?.id ?? "").trim();
  const artisanTitle = normalizeKey(artisan?.title);
  const artisanName = normalizeKey(artisan?.name);

  if (artisanId) {
    const byArtisanId = list.find(
      (video) => String(video?.artisan_id ?? "").trim() === artisanId && pickVideoUrl(video)
    );
    if (byArtisanId) return pickVideoUrl(byArtisanId);
  }

  if (artisanTitle) {
    const byTitle = list.find(
      (video) => normalizeKey(video?.title) === artisanTitle && pickVideoUrl(video)
    );
    if (byTitle) return pickVideoUrl(byTitle);
  }

  if (artisanName) {
    const byName = list.find((video) => {
      const videoTitle = normalizeKey(video?.title);
      return Boolean(videoTitle && pickVideoUrl(video) && videoTitle.includes(artisanName));
    });
    if (byName) return pickVideoUrl(byName);
  }

  return null;
}

function resolveArtisanTiktokUrl(artisan, videos = []) {
  const direct =
    artisan?.tiktok_url ||
    artisan?.tiktok_link ||
    artisan?.tiktok_video_url ||
    artisan?.video_url ||
    null;
  const directUrl = String(direct || "").trim();
  if (directUrl) return directUrl;

  const fromVideos = findTiktokUrlFromVideos(artisan, videos);
  if (fromVideos) return fromVideos;

  const titleKey = normalizeKey(artisan?.title);
  const nameKey = normalizeKey(artisan?.name);

  return ARTISAN_TIKTOK_URL_FALLBACK[titleKey] || ARTISAN_TIKTOK_URL_FALLBACK[nameKey] || null;
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
        api.tiktokVideos({ active: true, limit: 200 }),
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
    return selectRelatedProducts(artisan, products);
  }, [artisan, products]);

  const facebookUrl =
    artisan?.facebook_url ||
    artisan?.facebook_link ||
    artisan?.facebook ||
    null;

  const tiktokUrl = resolveArtisanTiktokUrl(artisan, tiktokVideos);

  const image = resolveImageUrl(
    artisan?.image_url ||
      artisan?.artisan_image ||
      artisan?.photo_url ||
      artisan?.avatar_url ||
      artisan?.image,
    "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600"
  );

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
              <div className="surface-card overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <div className="bg-black/5">
                    <img
                      src={image}
                      alt={artisan?.name || "Artisan"}
                      className="h-64 w-full object-cover sm:h-[320px] lg:h-[420px]"
                    />
                  </div>

                  <div className="p-6 sm:p-8 lg:p-10">
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

                      {tiktokUrl ? (
                        <a
                          href={tiktokUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#7C3A2E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5e2b22]"
                          title={`Watch ${artisan?.name || "this artisan"} on TikTok`}
                        >
                          Watch TikTok <PlayCircle size={16} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
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

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
