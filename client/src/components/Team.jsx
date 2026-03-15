import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "../lib/imageUrl";

export default function TeamCarousel({ team = [], loading = false }) {
  const slides = useMemo(() => {
    const list = Array.isArray(team) ? team : [];

    return list
      .map((t) => ({
        id: t.id,
        title: t.title || "Our Team",
        image:
          resolveImageUrl(
            t.image_url || t.photo_url || t.avatar_url || t.team_image,
            ""
          ) || null,
      }))
      .filter((s) => Boolean(s.image));
  }, [team]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx > Math.max(0, slides.length - 1)) {
      setIdx(0);
    }
  }, [idx, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIdx((v) => (v + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  function prev() {
    if (!slides.length) return;
    setIdx((v) => (v - 1 + slides.length) % slides.length);
  }

  function next() {
    if (!slides.length) return;
    setIdx((v) => (v + 1) % slides.length);
  }

  return (
    <section
      id="team"
      className="relative -mt-1 overflow-hidden bg-[linear-gradient(180deg,#fcf3ec_0%,#f4ece8_100%)] px-4 py-14 reveal-section sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,46,0.08)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#7C3A2E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7C3A2E]">
            The Team Behind the Screen
          </span>

          <h2 className="mb-4 font-display text-4xl font-bold text-[#7C3A2E] md:text-5xl">
            Meet the Team
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
            We are a passionate group dedicated to preserving Pangasinan's cultural
            heritage through technology, connecting local artisans with the world.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-soft">
            <div className="h-[320px] rounded-2xl bg-baybay-sand animate-pulse sm:h-[420px]" />
          </div>
        ) : slides.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Team section is ready
            </h3>
            <p className="mt-2 text-gray-600">
              Team's not found. Please check your internet connection and try again.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-soft backdrop-blur sm:p-6">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={slides[idx].image}
                alt={slides[idx].title}
                className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[460px]"
                loading="lazy"
              />
            </div>

            {slides.length > 1 && (
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-black/70 transition hover:bg-black/5"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-black/70 transition hover:bg-black/5"
                    aria-label="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIdx(i)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        i === idx ? "bg-[#7C3A2E]" : "bg-black/20"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
