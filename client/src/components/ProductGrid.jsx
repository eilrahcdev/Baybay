import { Heart } from "lucide-react";
import { useMemo, useState } from "react";

function ProductCard({ item }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="rounded-2xl bg-white border border-baybay-sand shadow-soft overflow-hidden group">
      <div className="relative">
        <div
          className="h-40 bg-cover bg-center"
          style={{
            backgroundImage: `url(${item.image_url || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200"})`,
          }}
        />
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 border border-baybay-sand shadow-soft grid place-items-center hover:scale-105 transition"
          aria-label="Save"
        >
          <Heart size={18} className={liked ? "fill-baybay-cocoa text-baybay-cocoa" : "text-black/55"} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-baybay-cocoa">{item.category || "Delicacy"}</p>
        <h4 className="mt-1 font-semibold leading-snug">{item.name}</h4>
        <p className="mt-1 text-sm text-black/65 line-clamp-2">{item.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-semibold">₱{Number(item.price || 0).toFixed(0)}</p>
          <button className="rounded-full bg-baybay-cocoa text-white px-4 py-2 text-sm shadow-soft hover:translate-y-[-1px] active:translate-y-0 transition">
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading }) {
  const content = useMemo(() => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, i) => ({ id: i, skeleton: true }));
    }
    return products || [];
  }, [products, loading]);

  return (
    <div id="shops" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {content.map((p) =>
        p.skeleton ? (
          <div key={p.id} className="rounded-2xl bg-white border border-baybay-sand shadow-soft overflow-hidden">
            <div className="h-40 bg-baybay-sand animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-baybay-sand animate-pulse rounded" />
              <div className="h-4 w-32 bg-baybay-sand animate-pulse rounded" />
              <div className="h-3 w-full bg-baybay-sand animate-pulse rounded" />
              <div className="h-3 w-2/3 bg-baybay-sand animate-pulse rounded" />
              <div className="h-9 w-full bg-baybay-sand animate-pulse rounded-full" />
            </div>
          </div>
        ) : (
          <ProductCard key={p.id} item={p} />
        )
      )}
    </div>
  );
}
    