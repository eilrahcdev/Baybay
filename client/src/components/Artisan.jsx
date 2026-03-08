import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { resolveImageUrl } from "../lib/imageUrl";

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
  const items = useMemo(() => {
    const list = Array.isArray(artisans) ? artisans : [];
    return list.map((a) => {
      const title = a.title || "Local Artisan";
      const meta = splitTitle(title);
      return {
        id: a.id ?? a.artisan_id ?? a.created_at ?? a.name,
        name: a.name || "Unknown Artisan",
        title,
        place: meta.place,
        craft: meta.craft,
        bio:
          a.bio ||
          "This artisan preserves traditional craftsmanship, passing skills from one generation to the next.",
        image:
          resolveImageUrl(
            a.image_url || a.artisan_image || a.photo_url || a.avatar_url || a.image,
            "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1600"
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
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7f3_0%,#fffdfb_100%)] py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#f1bcae]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-[#7C3A2E]/10 blur-3xl" />

      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]/80">
            Featured Makers
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-baybay-ink sm:text-4xl">Artisan Stories</h2>
          <p className="mt-3 text-sm text-black/60">
            Meet the craftspeople behind Baybay&apos;s handmade collections.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 rounded-[30px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(20,14,12,0.09)] sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div className="h-[320px] w-full animate-pulse rounded-3xl bg-gray-200 sm:h-[380px]" />
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
          <div className="relative overflow-hidden rounded-[30px] border border-black/10 bg-white/95 shadow-[0_24px_60px_rgba(20,14,12,0.11)]">
            {items.length > 1 && (
              <div className="absolute right-4 top-4 z-20 flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white/90 text-black/70 transition hover:bg-white"
                  aria-label="Previous artisan"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white/90 text-black/70 transition hover:bg-white"
                  aria-label="Next artisan"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
              <div className="relative bg-black/5">
                <img
                  src={current.image}
                  alt={current.name}
                  className="h-[320px] w-full object-cover sm:h-[390px] lg:h-full lg:min-h-[460px]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-5 text-white sm:p-6">
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                    <MapPin size={12} />
                    {current.place}
                  </div>
                </div>
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7C3A2E]/70">
                  Artisan Spotlight
                </p>

                <h3 className="mt-3 text-2xl font-semibold leading-tight text-baybay-ink sm:text-3xl">
                  {current.name}
                </h3>

                <p className="mt-3 inline-flex w-fit rounded-full border border-[#7C3A2E]/20 bg-[#7C3A2E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7C3A2E]">
                  {current.craft}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-black/70 sm:text-base">
                  {getShortBio(current.bio)}
                </p>

                <div className="mt-7">
                  {typeof onViewDetails === "function" ? (
                    <button
                      type="button"
                      onClick={() => onViewDetails(current.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#7C3A2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5e2b22]"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </button>
                  ) : (
                    <Link
                      to={`/artisans/${encodeURIComponent(String(current.id))}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#7C3A2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5e2b22]"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>

                {items.length > 1 && (
                  <>
                    <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#7C3A2E] transition-all duration-300"
                        style={{ width: `${((idx + 1) / items.length) * 100}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
