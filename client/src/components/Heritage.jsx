export default function Heritage() {
  return (
    <section id="heritage" className="relative py-16 lg:py-24 overflow-hidden reveal-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#7C3A2E]/5 rounded-full blur-3xl" />

          <div className="lg:col-span-7 relative z-10 group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                alt="Traditional loom weaving colorful patterns"
                className="h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[460px] lg:h-[560px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm7R1gtnBcz3xKtCB2RZLx1ZCKf1hhhl9LoU3-UKJEPfHiVd4SQ2wfblmphK4Nag-g7EltzB_R7lsJF-tu4J05d5eFVyv-5LIA_-89g2tq7QtYXv1fsxVtyfpGZl3Xnb6lQwUAzv__ZQzdaaGfoqqjhYt4N3jUNr6GvDA8Bsg57ItMNQA4bqbVN1P_WR4m5LIohw7Fuc72rBgxPlp7VDAF4pKQQYi_xxgBEAK9B668QXfybuZYQGqFY_RTs3ms_2B_hqBpRM5c0pc"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>

            <div className="hidden lg:block absolute -bottom-16 -right-12 w-64 h-80 rounded-xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-500 hover:-translate-y-2">
              <img
                alt="Hands shaping clay on pottery wheel"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM66ygmSLhsO8JutD95U-Wmiam9niyQAApescj-JV0Jb--7Q_sgI9bP0Z6YAfTpQG4LbkljHqcYT6ZuW3Pt2yafzPDotBWjukn42dpd0QvhBDG_P2UOyaYGD5rVuwgADOeI3Lqr7AEX8QjMKSwkv7qw-n5WU3YS9UXpOH8OoulIJ4OF-A22LJ-Mn21Xxfj_aSmZiAlMbYHxqTon0A8jXrtHbLEKlqJN2R-PoNsfwPAAsYQpYLNfzrUEGAvONP9ZWXur5HOqk20Fzs"
              />
            </div>
          </div>

          <div className="lg:col-span-5 mt-12 lg:mt-0 lg:pl-8 relative z-20 flex flex-col justify-center h-full">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-semibold uppercase tracking-wider text-[#7C3A2E]">
                <span className="w-2 h-2 rounded-full bg-[#7C3A2E] animate-pulse" />
                Cultural Heritage
              </span>

              <h2 className="font-display text-5xl font-bold text-gray-900 leading-tight">
                The Heart of{" "}
                <span className="text-[#7C3A2E] italic">Pangasinan Craft</span>
              </h2>

              <p className="text-gray-600 leading-relaxed text-lg">
                In the quiet towns of Pangasinan, the rhythmic clack of the loom and the gentle spin of the potter&apos;s wheel are the heartbeats of our culture.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Every thread intertwined and every clay vessel molded is a testament to resilience and artistry—bringing the warmth of Filipino craftsmanship directly to your home.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-[#7C3A2E] hover:bg-[#5e2b22] transition-all shadow-lg"
                  href="#shows"
                >
                  Explore the Collection
                </a>
                <a
                  className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-transparent hover:bg-gray-50 transition-all"
                  href="#about"
                >
                  Learn More
                </a>
              </div>

              <blockquote className="mt-6 border-l-4 border-[#7C3A2E] pl-4 italic text-gray-500">
                “Preserving our craft is preserving our identity. Every piece carries the spirit of our ancestors.”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
