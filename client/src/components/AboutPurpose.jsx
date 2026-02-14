import React from "react";

import welcome1 from "../assets/welcome-1.jpg";
import welcome2 from "../assets/welcome-2.webp";
import welcome3 from "../assets/welcome-3.jpg";
import welcome4 from "../assets/welcome-4.jpg";
import welcome5 from "../assets/welcome-5.jpg";
import welcome6 from "../assets/welcome-6.jpg";

function HexImage({ src, alt, className = "" }) {
  return (
    <div
      className={[
        "relative",
        // Slightly smaller = more breathing room (closer to your UI)
        "w-[108px] h-[94px] sm:w-[120px] sm:h-[104px] lg:w-[130px] lg:h-[112px] xl:w-[140px] xl:h-[122px]",
        "shadow-[0_16px_36px_rgba(0,0,0,0.30)]",
        className,
      ].join(" ")}
      style={{
        clipPath:
          "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* subtle inner outline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath:
            "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
          boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.25)",
        }}
      />
    </div>
  );
}

function ImpactCard({ img, icon, title, children, tags }) {
  return (
    <div className="flex flex-col">
      <div className="h-64 rounded-t-2xl overflow-hidden relative">
        <img
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
          src={img}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6 text-white">
          <span className="material-icons-round text-3xl mb-2">{icon}</span>
          <h3 className="text-xl font-bold font-display">{title}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-2xl border border-gray-100 flex-1">
        <div className="text-gray-600 text-sm leading-relaxed">{children}</div>

        {tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="bg-white text-[#7C3A2E] px-3 py-1 rounded-full text-xs font-bold border border-[#7C3A2E]/20 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}


const HEX_POS = [
  { src: welcome1, alt: "Shoes display", left: "75%", top: "9%" }, // top-right
  { src: welcome4, alt: "Handmade bracelets", left: "55%", top: "23%" }, // upper-mid 
  { src: welcome5, alt: "Handmade baskets", left: "35%", top: "37%" }, // left-mid
  { src: welcome3, alt: "Colorful crafts basket", left: "35%", top: "62.2%" }, // center-right
  { src: welcome2, alt: "Home designs crafts", left: "55%", top: "76.7%" }, // lower-mid
  { src: welcome6, alt: "Handcrafted bags", left: "75%", top: "91%" }, // bottom-right
];

export default function AboutPurpose() {
  return (
    <section id="about" className="py-14 sm:py-16 px-4 sm:px-6">
      {/* ===== WELCOME PANEL (MATCHED TO UI) ===== */}
      <div className="max-w-7xl mx-auto">
        <div
          className={[
            "relative overflow-hidden rounded-[28px]",
            "bg-[#7C3A2E]",
            // more correct banner height like your screenshot
            "min-h-[520px] lg:min-h-[540px]",
            "px-6 sm:px-10 lg:px-14",
            "py-12 sm:py-14 lg:py-16",
            "shadow-[0_30px_70px_rgba(0,0,0,0.25)]",
          ].join(" ")}
        >
          {/* subtle glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-[380px] w-[380px] rounded-full bg-black/20 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
          </div>

          <div className="relative h-full grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            {/* LEFT TEXT */}
            <div className="text-center lg:text-left">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-5xl font-bold text-white leading-[1.03] tracking-tight">
                Welcome to BAYBAY, the home of Pangasinan’s
                local artisans and theircreations.
              </h2>

              <p className="mt-6 text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                We bridge the gap between tradition and the modern market—bringing
                the crafts and flavors of our heritage closer to everyone.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#shows"
                  className="inline-flex items-center justify-center px-9 py-3.5 rounded-full bg-white text-[#7C3A2E] font-bold shadow-lg hover:bg-orange-50 transition"
                >
                  Explore Products
                </a>

                <a
                  href="#heritage"
                  className="inline-flex items-center justify-center px-9 py-3.5 rounded-full border border-white/35 text-white font-bold hover:bg-white/10 transition"
                >
                  Discover Heritage
                </a>
              </div>
            </div>

            {/* RIGHT HEX CLUSTER (FIXED SPACING + MATCHED SHAPE) */}
            <div className="flex justify-center lg:justify-end">
              {/* Bigger container = proper breathing room like your UI */}
              <div className="relative w-[420px] h-[360px] sm:w-[460px] sm:h-[390px] lg:w-[520px] lg:h-[430px]">
                {HEX_POS.map((h) => (
                  <div
                    key={h.alt}
                    className="absolute"
                    style={{
                      left: h.left,
                      top: h.top,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <HexImage src={h.src} alt={h.alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PURPOSE / MISSION / VISION / IMPACT ===== */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="text-center mb-16">
          <span className="text-[#7C3A2E] font-bold tracking-widest uppercase text-sm mb-3 block">
            Our Purpose
          </span>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Connecting Artisans, Preserving Heritage
          </h3>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            We are building the digital bridge between Pangasinan&apos;s master
            craftsmen and the global stage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="bg-white p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#7C3A2E] transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#7C3A2E]/10 flex items-center justify-center text-[#7C3A2E] mr-4">
                <span className="material-icons-round text-2xl">flag</span>
              </div>
              <h4 className="text-3xl font-display font-bold text-gray-800">
                Our Mission
              </h4>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              To develop and maintain{" "}
              <span className="text-[#7C3A2E] font-bold">BAYBAY</span> as a
              user-friendly digital hub that connects artisans with wider
              audiences, showcases Pangasinan&apos;s craftsmanship, and
              strengthens cultural identity while supporting tourism and economic
              growth.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C48A7E] transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#C48A7E]/20 flex items-center justify-center text-[#7C3A2E] mr-4">
                <span className="material-icons-round text-2xl">visibility</span>
              </div>
              <h4 className="text-3xl font-display font-bold text-gray-800">
                Our Vision
              </h4>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              To empower Pangasinan artisans by providing a digital platform that
              promotes cultural heritage, expands market access, and ensures
              sustainable livelihoods through technology-driven visibility.
            </p>
          </div>
        </div>

        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <div className="w-24 h-1 bg-[#7C3A2E] mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ImpactCard
              title="What We Do"
              icon="storefront"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAOmek7zhybv-E5vC-AJ9I0IET24t2PgNjVrlH81FIL--vyPgFCLWKSwcdFrVAzC06dQ0C0rO8tW6fUm0y6DkOgIUcZCPOLLkCI53IxpR-nNX59eQ7gI43E_CgRNFiVYhf-XBMOn9-drjTTQLXMDL5N2TnH6J5mwbC9tnAui5q3wtCJz6v3WGSdNOd3pXzEvnMQ1Cm8lzH0_F1mIVHybg7YUpPN3dkh16bP4bA7zTsDGs14QTzFf0TG9BDaaifpfOiaOIb21DhyWwA"
            >
              We create a digital platform that showcases the skills, products,
              and stories of local artisans in Pangasinan.
            </ImpactCard>

            <ImpactCard
              title="Why We Do It"
              icon="favorite"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAVI-wGsO0k28xcgLS1bkXZ_xdBNvf3ZXjkFRJy-h8OVU_Dl3uTprH2Urv5-rSp-FOGk14oPkwLUErLicljQBOQNCLk3blP7AIqFDogUuptX_lNIhEjpdih8PxGRVN8rzdSevWGpcuo7v8RB9VMWB9WDD86obsaFEzuPSdZMRjPZkMg-dHkrLdV2ATDKWptIDsCdFyRchRJI9MiFqi2oqRNPaYcDHR_Rf7cYdsCcXYLZ5SUs-LSqLdq_oPxDCyBj0-yhwF6JQIiUCM"
            >
              Many talented artisans remain unseen and underserved. We help
              preserve culture while opening doors to modern markets.
            </ImpactCard>

            <ImpactCard
              title="Who We Support"
              icon="groups"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAYspRcANfW-ZfHIk5tMYhXqSdaZSq3MfPWUaZmmsWA1_k6fsqDBr_LLWPF9Ikxh0KWVd_i0Go-ZhvbJ7EHZQ_j8HyE1cbRbJSU3YuGjyR5zdRAe8REqSxIzD9QnaSDCv7qPZBZnyWLp6mk15FNQfFiKoYo-MQqSQCNs91oimFxVOBvfzC0qrbUuQP0AcxweBJBSQllhzX8FmEOxkLYZdeSbHv_x4f0IVdvP5iVQ-veQrCdUCAjFwJzXT-VNulkz_3wtWo4xJVD4sM"
              tags={[
                "Pottery Makers",
                "Food Artisans",
                "Furniture Makers",
                "Woodworkers",
                "Blacksmiths",
                "Weavers",
              ]}
            >
              We work with a diverse community of dedicated craftspeople across
              Pangasinan.
            </ImpactCard>
          </div>
        </div>
      </div>
    </section>
  );
}
