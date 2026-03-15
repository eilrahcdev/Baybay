import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { resolveImageUrl } from "../lib/imageUrl";
import { getArtisanAlias } from "../lib/artisanAlias";

function getShortBio(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= 220) return value;
  return `${value.slice(0, 217).trim()}...`;
}

function splitTitle(title) {
  const raw = String(title || "").trim();
  if (!raw) return { place: "Pangasinan", craft: "Local Artisan" };

  const [first, ...rest] = raw.split("-");
  const place = String(first || "").trim() || "Pangasinan";
  const craft = String(rest.join("-") || "").trim() || raw;

  return { place, craft };
}

export default function Artisan({ artisans = [], loading = false, onViewDetails }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600";

  const items = useMemo(() => {
    const list = Array.isArray(artisans) ? artisans : [];
    return list.map((a) => {
      const title = a.title || "Local Artisan";
      const meta = splitTitle(title);

      return {
        id: a.id ?? a.artisan_id ?? a.created_at ?? a.name,
        name: a.name || "Unknown Artisan",
        alias: getArtisanAlias(a),
        title,
        place: meta.place,
        craft: meta.craft,
        bio:
          a.bio ||
          "This artisan preserves traditional craftsmanship, passing skills from one generation to the next.",
        image: resolveImageUrl(
          a.image_url || a.artisan_image || a.photo_url || a.avatar_url || a.image,
          fallbackImage
        ),
      };
    });
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
    <section
      id="artisans"
      className="relative -mt-1 overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(124,58,46,0.12),transparent_45%),radial-gradient(circle_at_88%_82%,rgba(196,138,126,0.16),transparent_48%),linear-gradient(180deg,#fff9f4_0%,#fff8f3_100%)] py-12 sm:py-16"
    >
      <div className="pointer-events-none absolute -left-14 top-10 h-44 w-44 rounded-full bg-[#f1bcae]/30 blur-3xl sm:h-56 sm:w-56" />
      <div className="pointer-events-none absolute -right-16 bottom-4 h-44 w-44 rounded-full bg-[#7C3A2E]/10 blur-3xl sm:h-56 sm:w-56" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(124,58,46,0.35) 0 1px, transparent 1px 18px)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#fff8f3]" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]/80">
            Featured Makers
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-baybay-ink sm:text-4xl">
            Artisan Stories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-black/65 sm:mt-3 sm:text-sm">
            Meet the craftspeople behind Baybay&apos;s handmade collections.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 rounded-[26px] border border-black/10 bg-white/90 p-4 shadow-[0_20px_50px_rgba(20,14,12,0.09)] sm:p-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-gray-200 lg:aspect-square" />
            <div className="space-y-4 py-2">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="font-display text-2xl font-bold text-gray-900">No artisans yet</h3>
            <p className="mt-2 text-gray-600">
              We&apos;re preparing this section. Please check back again soon.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-white/95 shadow-[0_20px_45px_rgba(20,14,12,0.1)]">
            {items.length > 1 && (
              <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-4 sm:top-4">
                <button
                  type="button"
                  onClick={prev}
                  className="grid h-9 w-9 place-items-center rounded-full border border-black/15 bg-white/90 text-black/70 transition hover:bg-white sm:h-10 sm:w-10"
                  aria-label="Previous artisan"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="grid h-9 w-9 place-items-center rounded-full border border-black/15 bg-white/90 text-black/70 transition hover:bg-white sm:h-10 sm:w-10"
                  aria-label="Next artisan"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="grid gap-0 lg:grid-cols-[1.02fr_1fr]">
              <div className="relative bg-black/5 aspect-[4/3] lg:aspect-square">
                <img
                  src={current.image}
                  alt={current.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error("Failed artisan image:", current);
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 text-white sm:p-6">
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                    <MapPin size={12} />
                    {current.place}
                  </div>
                </div>
              </div>

              <div className="flex flex-col p-4 sm:p-7 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7C3A2E]/70">
                  Artisan Spotlight
                </p>

                {current.alias && (
                  <p className="mt-2 text-xl font-bold leading-tight text-baybay-ink sm:mt-3 sm:text-3xl">
                    {current.alias}
                  </p>
                )}

                <h3 className="mt-1 text-sm font-medium leading-tight text-black/70 sm:mt-2 sm:text-lg">
                  {current.name}
                </h3>

                <p className="mt-2 inline-flex w-fit rounded-full border border-[#7C3A2E]/20 bg-[#7C3A2E]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C3A2E] sm:mt-3 sm:px-3 sm:text-xs">
                  {current.craft}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-black/70 sm:mt-5 sm:text-base">
                  {getShortBio(current.bio)}
                </p>

                <div className="mt-5 sm:mt-7">
                  {typeof onViewDetails === "function" ? (
                    <button
                      type="button"
                      onClick={() => onViewDetails(current.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#7C3A2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5e2b22] sm:px-6 sm:py-3"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </button>
                  ) : (
                    <Link
                      to={`/artisans/${encodeURIComponent(String(current.id))}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#7C3A2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5e2b22] sm:px-6 sm:py-3"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>

                {items.length > 1 && (
                  <>
                    <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-black/10 sm:mt-7">
                      <div
                        className="h-full rounded-full bg-[#7C3A2E] transition-all duration-300"
                        style={{ width: `${((idx + 1) / items.length) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-3">
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
