import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/imageUrl";

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
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-black/70 hover:text-black hover:bg-white"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-black/5">
              {img ? (
                <img
                  src={img}
                  alt={name}
                  className="h-72 md:h-full w-full object-cover"
                  onError={(e) => {
                    console.error("Failed modal image:", product, img);
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="h-72 md:h-full w-full flex items-center justify-center text-black/50">
                  No image
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <h3 className="text-2xl font-semibold text-[#7C3A2E]">{name}</h3>

              {displayPrice != null && (
                <p className="mt-2 text-lg font-semibold text-black/80">
                  ₱{Number(displayPrice).toLocaleString()}
                </p>
              )}

              <p className="mt-4 text-sm text-black/60 leading-relaxed">
                {product?.description || "No description available."}
              </p>

              <div className="mt-6">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm font-semibold text-black/70">Variants</p>
                  {!loadingVariants && variants.length > 0 && (
                    <p className="text-xs text-black/45">Prices</p>
                  )}
                </div>

                {loadingVariants ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-12 w-full rounded-xl bg-black/5 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-black/5 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-black/5 animate-pulse" />
                  </div>
                ) : variants.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {variants.map((v) => {
                      const active = String(v.id) === String(selectedVariantId);

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(String(v.id))}
                          className={[
                            "w-full rounded-xl border px-4 py-3 text-left transition",
                            active
                              ? "border-[#7C3A2E] bg-[#7C3A2E]/10"
                              : "border-black/10 bg-white hover:bg-black/5",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-black/80 truncate">
                                {v.variant_name}
                              </p>
                              {v.weight_kg != null && (
                                <p className="text-xs text-black/50 mt-0.5">
                                  {Number(v.weight_kg)} kg
                                </p>
                              )}
                            </div>

                            <p className="font-semibold text-[#7C3A2E] whitespace-nowrap">
                              ₱{Number(v.price || 0).toLocaleString()}
                            </p>
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
