export default function Hero() {
  return (
    <header
      id="home"
      className="relative overflow-hidden"
      style={{ minHeight: "clamp(460px, 70vh, 760px)" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANtcvUBLnRgyqNQKojgyMt6UG471ZJHpqUHxXbXwYegseFM9PW8aUyxL3D3O0zkbvSOn31sL41aAKoosrACZZApzwBcXJ66j7Ev_V4TEGrDuLWrCUbIk8vSXHyHdSW5h1ZnBw3ZNf_n6CL4yB2cbAbIi-H6IyIJko9aSldbqwHjCOb9-CjB3MsGOon6udVVD6pc-b0yw2fVHN1LSAgc9S9ThUYv-_pkki1jCYOl_jQs2NXTw1q1lDr7SfJ755Gk7-yIusGwEwdOhM"
          alt="Traditional weaving texture"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#32130d]/75 via-[#5f2a20]/65 to-[#1f1512]/70" />
        <div className="absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#c48a7e]/35 blur-3xl" />
        <div className="absolute -right-14 bottom-10 h-64 w-64 rounded-full bg-[#7c3a2e]/45 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#fff9f4]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="surface-card w-full max-w-4xl p-6 sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#7C3A2E]/20 bg-[#7C3A2E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7C3A2E]">
              Pangasinan Craft Marketplace
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-[#2f1a14] sm:text-5xl md:text-6xl">
              Discover Handcrafted Stories From Local Artisans
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#4a352f] sm:text-lg">
              Shop unique pieces made with heritage techniques, and support makers
              preserving Pangasinan craftsmanship.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#7C3A2E] px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#5e2b22]"
                href="#products"
              >
                Browse Products
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-[#7C3A2E]/35 bg-white/70 px-7 py-3 text-sm font-semibold text-[#7C3A2E] transition hover:bg-white"
                href="#about"
              >
                Learn About Baybay
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 text-center sm:grid-cols-3 sm:gap-4 sm:text-left">
              <div className="rounded-2xl border border-[#7C3A2E]/15 bg-white/70 px-4 py-3">
                <p className="text-lg font-bold text-[#7C3A2E]">Local</p>
                <p className="text-xs text-black/60 sm:text-sm">Artisans</p>
              </div>
              <div className="rounded-2xl border border-[#7C3A2E]/15 bg-white/70 px-4 py-3">
                <p className="text-lg font-bold text-[#7C3A2E]">Handmade</p>
                <p className="text-xs text-black/60 sm:text-sm">Products</p>
              </div>
              <div className="rounded-2xl border border-[#7C3A2E]/15 bg-white/70 px-4 py-3">
                <p className="text-lg font-bold text-[#7C3A2E]">Cultural</p>
                <p className="text-xs text-black/60 sm:text-sm">Stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
