export default function Hero() {
  return (
    <header
      id="home"
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: "clamp(420px, 60vh, 700px)" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANtcvUBLnRgyqNQKojgyMt6UG471ZJHpqUHxXbXwYegseFM9PW8aUyxL3D3O0zkbvSOn31sL41aAKoosrACZZApzwBcXJ66j7Ev_V4TEGrDuLWrCUbIk8vSXHyHdSW5h1ZnBw3ZNf_n6CL4yB2cbAbIi-H6IyIJko9aSldbqwHjCOb9-CjB3MsGOon6udVVD6pc-b0yw2fVHN1LSAgc9S9ThUYv-_pkki1jCYOl_jQs2NXTw1q1lDr7SfJ755Gk7-yIusGwEwdOhM"
          alt="Traditional Weaving Texture"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3A2E]/75 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">
          Explore Local Artisans <br /> in Pangasinan
        </h1>
        <p className="text-white/90 text-base sm:text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto drop-shadow">
          Discover the exquisite craftsmanship of Pangasinan's local artisans
          and their finest handcrafted creations.
        </p>
        <a
          className="inline-block bg-white text-[#7C3A2E] hover:bg-orange-50 font-bold py-3 px-8 rounded-full transition shadow-lg transform hover:-translate-y-1"
          href="#about"
        >
          Start Your Journey
        </a>
      </div>
    </header>
  );
}
