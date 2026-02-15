import { useMemo } from "react";

function ProductCard({ item, onQuickView }) {
  const image =
    item.image_url ||
    item.image ||
    item.img ||
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200";

  const name = item.name || item.title || "Product";
  const description = item.description || "No description.";
  const price = item.price ?? 0;

  return (
    <div
      className="rounded-2xl bg-white border border-baybay-sand shadow-soft overflow-hidden hover:shadow-md transition cursor-pointer"
      onClick={() => onQuickView?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onQuickView?.(item)}
    >
      {/* ✅ Responsive image */}
      <div className="relative w-full aspect-[4/3] bg-black/5">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h4 className="font-semibold leading-snug line-clamp-1">{name}</h4>

        <p className="mt-1 text-sm text-black/65 line-clamp-2">{description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-semibold text-[#7C3A2E]">
            ₱{Number(price || 0).toLocaleString()}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(item);
            }}
            className="rounded-full bg-baybay-cocoa text-white px-4 py-2 text-sm shadow-soft hover:translate-y-[-1px] active:translate-y-0 transition whitespace-nowrap"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products = [], loading = false, onQuickView }) {
  const content = useMemo(() => {
    if (loading) return Array.from({ length: 10 }).map((_, i) => ({ id: i, skeleton: true }));
    return Array.isArray(products) ? products : [];
  }, [products, loading]);

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {content.map((p) =>
        p.skeleton ? (
          <div
            key={p.id}
            className="rounded-2xl bg-white border border-baybay-sand shadow-soft overflow-hidden"
          >
            <div className="aspect-[4/3] bg-baybay-sand animate-pulse" />
            <div className="p-4 space-y-3">
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
