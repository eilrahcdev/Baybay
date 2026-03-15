import { useMemo } from "react";
import { resolveImageUrl } from "../lib/imageUrl";
import { getProductOwnerLabel } from "../lib/artisanAlias";

function ProductCard({ item, onQuickView }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200";

  const image = resolveImageUrl(
    item.image_url || item.product_image || item.image || item.img || item.photo_url,
    fallbackImage
  );

  const name = item.name || item.title || "Product";
  const description = item.description || "No description.";
  const price = item.price ?? 0;
  const ownerLabel = getProductOwnerLabel(item);

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-[0_12px_30px_rgba(20,16,12,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(20,16,12,0.16)]"
      onClick={() => onQuickView?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onQuickView?.(item)}
    >
      <div className="relative w-full aspect-[5/4] bg-black/5 sm:aspect-[4/3]">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            console.error("Failed product image:", item, image);
            if (e.currentTarget.src !== fallbackImage) {
              e.currentTarget.src = fallbackImage;
            }
          }}
        />
      </div>

      <div className="p-3 sm:p-4">
        {ownerLabel && (
          <p className="text-[11px] font-semibold tracking-[0.02em] text-[#7C3A2E] sm:text-xs">
            {ownerLabel}
          </p>
        )}
        <h4 className="mt-1 text-sm font-semibold leading-snug line-clamp-1 sm:text-base">{name}</h4>

        <p className="mt-1 text-xs text-black/65 line-clamp-2 sm:text-sm">{description}</p>

        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
          <p className="text-sm font-semibold text-[#7C3A2E] sm:text-base">
            ₱{Number(price || 0).toLocaleString()}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(item);
            }}
            className="rounded-full bg-baybay-cocoa px-3 py-1.5 text-xs text-white shadow-soft transition whitespace-nowrap hover:translate-y-[-1px] active:translate-y-0 sm:px-4 sm:py-2 sm:text-sm"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products = [],
  loading = false,
  onQuickView,
  gridClassName = "grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5",
}) {
  const content = useMemo(() => {
    if (loading) return Array.from({ length: 10 }).map((_, i) => ({ id: i, skeleton: true }));
    return Array.isArray(products) ? products : [];
  }, [products, loading]);

  return (
    <div className={`mt-6 grid ${gridClassName}`}>
      {content.map((p) =>
        p.skeleton ? (
          <div
            key={p.id}
            className="rounded-2xl bg-white border border-baybay-sand shadow-soft overflow-hidden"
          >
            <div className="aspect-[5/4] bg-baybay-sand animate-pulse sm:aspect-[4/3]" />
            <div className="p-3 space-y-2.5 sm:p-4 sm:space-y-3">
              <div className="h-4 w-2/3 bg-baybay-sand animate-pulse rounded" />
              <div className="h-3 w-full bg-baybay-sand animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-baybay-sand animate-pulse rounded" />
              <div className="h-9 w-full bg-baybay-sand animate-pulse rounded-full" />
            </div>
          </div>
        ) : (
          <ProductCard key={p.id} item={p} onQuickView={onQuickView} />
        )
      )}
    </div>
  );
}
