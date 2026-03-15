import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/imageUrl";
import { getProductOwnerLabel } from "../lib/artisanAlias";

export default function ProductQuickViewModal({ product, onClose }) {
  if (!product) return null;

  const fallbackImage =
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200";

  const productId = product?.id;

  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadVariants() {
      if (!productId) return;

      try {
        setLoadingVariants(true);
        const data = await api.productVariants(productId);

        if (!alive) return;

        const list = Array.isArray(data) ? data : [];
        setVariants(list);

        if (list.length) setSelectedVariantId(String(list[0].id));
        else setSelectedVariantId("");
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setVariants([]);
        setSelectedVariantId("");
      } finally {
        if (!alive) return;
        setLoadingVariants(false);
      }
    }

    loadVariants();
    return () => {
      alive = false;
    };
  }, [productId]);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return variants.find((v) => String(v.id) === String(selectedVariantId)) || null;
  }, [variants, selectedVariantId]);

  const name = product?.name || product?.title || "Product";
  const ownerLabel = getProductOwnerLabel(product);
  const img = resolveImageUrl(
    product?.image_url ||
      product?.product_image ||
      product?.image ||
      product?.img ||
      product?.photo_url,
    fallbackImage
  );

  const displayPrice = selectedVariant?.price ?? product?.price ?? null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-black/70 hover:bg-white hover:text-black"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-black/5">
              {img ? (
                <img
                  src={img}
                  alt={name}
                  className="h-72 w-full object-cover md:h-full"
                  onError={(e) => {
                    console.error("Failed modal image:", product, img);
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center text-black/50 md:h-full">
                  No image
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {ownerLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7C3A2E]/85">
                  {ownerLabel}
                </p>
              )}
              <h3 className="mt-1 text-2xl font-semibold leading-tight text-[#7C3A2E]">{name}</h3>

              {displayPrice != null && (
                <p className="mt-2 text-lg font-semibold text-black/80">
                  {"\u20B1"}
                  {Number(displayPrice).toLocaleString()}
                </p>
              )}

              <p className="mt-4 text-sm leading-relaxed text-black/60">
                {product?.description || "No description available."}
              </p>

              <div className="mt-6">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm font-semibold text-black/70">Variants</p>
                </div>

                {loadingVariants ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-12 w-full animate-pulse rounded-xl bg-black/5" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-black/5" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-black/5" />
                  </div>
                ) : variants.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
                    {variants.map((v) => {
                      const active = String(v.id) === String(selectedVariantId);

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(String(v.id))}
                          className={[
                            "w-full rounded-xl border px-3 py-2.5 text-left transition",
                            active
                              ? "border-[#7C3A2E] bg-[#7C3A2E]/10"
                              : "border-black/10 bg-white hover:bg-black/5",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-black/80">
                              {v.variant_name}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#7C3A2E]">
                              {"\u20B1"}
                              {Number(v.price || 0).toLocaleString()}
                            </p>
                            {v.weight_kg != null && (
                              <p className="mt-0.5 text-[11px] text-black/50">{Number(v.weight_kg)} kg</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-black/10 bg-white p-4 text-sm text-black/55">
                    No variants available for this product.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
