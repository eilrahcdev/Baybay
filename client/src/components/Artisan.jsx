import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Artisan({ artisans = [], loading = false }) {
  const items = useMemo(() => {
    const list = Array.isArray(artisans) ? artisans : [];
    return list.map((a) => ({
      // Use stable ID, then fallback fields if needed.
      id: a.id ?? a.artisan_id ?? a.created_at ?? a.name,
      name: a.name || "—",
      title: a.title || "Local Artisan",
      bio:
        a.bio ||
        "This artisan preserves traditional craftsmanship, passing skills from one generation to the next.",
      image:
        a.image_url ||
        "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600",
    }));
  }, [artisans]);

  const [idx, setIdx] = useState(0);
  const current = items[idx];

  function prev() {
    if (!items.length) return;
    setIdx((v) => (v - 1 + items.length) % items.length);
  }

  function next() {
    if (!items.length) return;
    setIdx((v) => (v + 1) % items.length);
  }

  return (
    <section id="artisans" className="py-16 bg-[#FDF8F4]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-baybay-ink">
            Artisans
          </h2>
          <p className="mt-2 text-sm text-black/60">
            Featured local makers and their stories.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="h-[400px] w-full bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-60 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Artisan section is ready
            </h3>
            <p className="mt-2 text-gray-600">
              No artisans available. Please check your internet connection and try again.
            </p>
          </div>
        ) : (
          <div className="relative rounded-3xl bg-white border border-black/10 shadow-soft overflow-hidden">
            {/* Manual controls */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/90 border border-black/10 grid place-items-center hover:bg-white transition"
                  aria-label="Previous artisan"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/90 border border-black/10 grid place-items-center hover:bg-white transition"
                  aria-label="Next artisan"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            <div className="grid md:grid-cols-2 gap-0 items-stretch">
              {/* Image */}
              <div className="w-full">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-[320px] md:h-[420px] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="p-8 sm:p-10">
                <h3 className="text-2xl sm:text-3xl font-semibold text-baybay-ink">
                  {current.name}
                </h3>

                <p className="mt-2 text-baybay-accent font-medium">
                  {current.title}
                </p>

                <p className="mt-4 text-gray-700 leading-relaxed">
                  {current.bio}
                </p>

                {/* View details button */}
                <div className="mt-6">
                  <Link
                    to={`/artisans/${encodeURIComponent(String(current.id))}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#7C3A2E] text-white px-6 py-3 text-sm font-semibold hover:bg-[#5e2b22] transition"
                  >
                    View Details
                    <span className="material-icons ml-2 text-sm">arrow_forward</span>
                  </Link>
                </div>

                {/* Slide dots */}
                {items.length > 1 && (
                  <div className="mt-8 flex gap-2">
                    {items.map((a, i) => (
                      <button
                        key={String(a.id)}
                        type="button"
                        onClick={() => setIdx(i)}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          i === idx ? "bg-[#7C3A2E]" : "bg-black/15"
                        }`}
                        aria-label={`Go to artisan ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
