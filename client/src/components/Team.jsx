import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TeamCarousel({ team = [], loading = false }) {
  const slides = useMemo(() => {
    const list = Array.isArray(team) ? team : [];
    // Data stores one full team image per row.
    // Treat each row as one slide.
    return list
      .map((t) => ({
        id: t.id,
        title: t.title || "Our Team",
        image:
          t.image_url ||
          t.photo_url ||
          t.avatar_url ||
          t.team_image ||
          null,
      }))
      .filter((s) => !!s.image);
  }, [team]);

  const [idx, setIdx] = useState(0);

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
    <section id="team" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden reveal-section">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,46,0.08)_1px,transparent_1px)] [background-size:20px_20px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block py-1 px-3 rounded-full bg-[#7C3A2E]/10 text-[#7C3A2E] text-xs font-semibold tracking-wide uppercase mb-4">
            The Team Behind the Screen
          </span>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-[#7C3A2E] mb-4">
            Meet the Team
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            We are a passionate group dedicated to preserving Pangasinan’s cultural heritage through technology—connecting local artisans with the world.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-soft">
            <div className="h-[320px] sm:h-[420px] bg-baybay-sand animate-pulse rounded-2xl" />
          </div>
        ) : slides.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-gray-900">Team section is ready</h3>
            <p className="mt-2 text-gray-600">
              Team's not found. Please check your internet connection and try again.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-soft">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={slides[idx].image}
                alt={slides[idx].title}
                className="w-full h-[320px] sm:h-[460px] object-cover"
                loading="lazy"
              />

              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 border border-black/10 grid place-items-center hover:bg-white transition"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 border border-black/10 grid place-items-center hover:bg-white transition"
                    aria-label="Next"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Slide dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setIdx(i)}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          i === idx ? "bg-[#7C3A2E]" : "bg-white/70"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
