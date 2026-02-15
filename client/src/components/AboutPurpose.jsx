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
        "relative overflow-hidden",
        "w-[96px] h-[84px] sm:w-[110px] sm:h-[96px] lg:w-[126px] lg:h-[110px] xl:w-[140px] xl:h-[122px]",
        "shadow-[0_16px_36px_rgba(0,0,0,0.30)]",
        className,
      ].join(" ")}
      style={{
        clipPath:
          "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
      }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
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
      <div className="h-56 sm:h-64 rounded-t-2xl overflow-hidden relative">
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

      <div className="bg-white p-6 sm:p-8 rounded-b-2xl border border-gray-100 flex-1">
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

const HEX_ITEMS = [
  { src: welcome1, alt: "Shoes display" },
  { src: welcome4, alt: "Handmade bracelets" },
  { src: welcome5, alt: "Handmade baskets" },
  { src: welcome3, alt: "Colorful crafts basket" },
  { src: welcome2, alt: "Home designs crafts" },
  { src: welcome6, alt: "Handcrafted bags" },
];

// Desktop cluster positions only (enabled from lg+)
const HEX_POS = [
  { left: "78%", top: "10%" },
  { left: "58%", top: "24%" },
  { left: "38%", top: "40%" },
  { left: "38%", top: "62%" },
  { left: "58%", top: "77%" },
  { left: "78%", top: "90%" },
];

export default function AboutPurpose() {
  return (
    <section id="about" className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div
          className={[
            "relative overflow-hidden rounded-[28px]",
            "bg-[#7C3A2E]",
            "px-6 sm:px-10 lg:px-14",
            "py-10 sm:py-12 lg:py-16",
            "shadow-[0_30px_70px_rgba(0,0,0,0.25)]",
          ].join(" ")}
        >
          {/* glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-[380px] w-[380px] rounded-full bg-black/20 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
          </div>

          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Welcome to BAYBAY, the home of Pangasinan’s local artisans and their creations.
              </h2>

              <p className="mt-5 sm:mt-6 text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                We bridge the gap between tradition and the modern market—bringing
                the crafts and flavors of our heritage closer to everyone.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-[#7C3A2E] font-bold shadow-lg hover:bg-orange-50 transition"
                >
                  Explore Products
                </a>
              </div>
            </div>

            {/* RIGHT (RESPONSIVE HEX) */}
            <div className="flex justify-center lg:justify-end">
              {/* ✅ Mobile/tablet: clean grid (no absolute overlap) */}
              <div className="lg:hidden w-full max-w-md">
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {HEX_ITEMS.map((h) => (
                    <HexImage key={h.alt} src={h.src} alt={h.alt} />
                  ))}
                </div>
              </div>

              {/* ✅ Desktop: clustered hex layout */}
              <div className="hidden lg:block relative w-[520px] h-[430px]">
                {HEX_ITEMS.map((h, idx) => (
                  <div
                    key={h.alt}
                    className="absolute"
                    style={{
                      left: HEX_POS[idx].left,
                      top: HEX_POS[idx].top,
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

      {/* PURPOSE */}
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[#7C3A2E] font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">
            Our Purpose
          </span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 sm:mb-6">
            Connecting Artisans, Preserving Heritage
          </h3>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
            We are building the digital bridge between Pangasinan&apos;s master
            craftsmen and the global stage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white p-7 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#7C3A2E] transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            <div className="flex items-center mb-5 sm:mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#7C3A2E]/10 flex items-center justify-center text-[#7C3A2E] mr-4">
                <span className="material-icons-round text-2xl">flag</span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
                Our Mission
              </h4>
            </div>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              To develop and maintain{" "}
              <span className="text-[#7C3A2E] font-bold">BAYBAY</span> as a
              user-friendly digital hub that connects artisans with wider
              audiences, showcases Pangasinan&apos;s craftsmanship, and
              strengthens cultural identity while supporting tourism and economic
              growth.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C48A7E] transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            <div className="flex items-center mb-5 sm:mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#C48A7E]/20 flex items-center justify-center text-[#7C3A2E] mr-4">
                <span className="material-icons-round text-2xl">visibility</span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
                Our Vision
              </h4>
            </div>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              To empower Pangasinan artisans by providing a digital platform that
              promotes cultural heritage, expands market access, and ensures
              sustainable livelihoods through technology-driven visibility.
            </p>
          </div>
        </div>

        {/* IMPACT */}
        <div className="py-16 sm:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <div className="w-24 h-1 bg-[#7C3A2E] mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <ImpactCard
              title="What We Do"
              icon="storefront"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAOmek7zhybv-E5vC-AJ9I0IET24t2PgNjVrlH81FIL--vyPgFCLWKSwcdFrVAzC06dQ0C0rO8tW6fUm0y6DkOgIUcZCPOLLkCI53IxpR-nNX59eQ7gI43E_CgRNFiVYhf-XBMOn9-drjTTQLXMDL5N2TnH6J5mwbC9tnAui5q3wtCJz6v3WGSdNOd3pXzEvnMQ1Cm8lzH0_F1mIVHybg7YUpPN3dkh16bP4bA7zTsDGs14QTzFf0TG9BDaaifpfOiaOIb21DhyWwA"
            >
              We create a digital platform that showcases the skills, products, and stories of local artisans in Pangasinan. From pottery and weaving to food crafts, furniture, and traditional tools, we connect their handmade creations to a wider audience through an accessible website.
            </ImpactCard>

            <ImpactCard
              title="Why We Do It"
              icon="favorite"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAVI-wGsO0k28xcgLS1bkXZ_xdBNvf3ZXjkFRJy-h8OVU_Dl3uTprH2Urv5-rSp-FOGk14oPkwLUErLicljQBOQNCLk3blP7AIqFDogUuptX_lNIhEjpdih8PxGRVN8rzdSevWGpcuo7v8RB9VMWB9WDD86obsaFEzuPSdZMRjPZkMg-dHkrLdV2ATDKWptIDsCdFyRchRJI9MiFqi2oqRNPaYcDHR_Rf7cYdsCcXYLZ5SUs-LSqLdq_oPxDCyBj0-yhwF6JQIiUCM"
            >
              Many talented artisans remain unseen and underserved. We believe their craftsmanship deserves recognition, fair income, and opportunities to grow. By going digital, we help preserve culture while opening doors to modern markets.
            </ImpactCard>

            <ImpactCard
              title="Who We Support"
              icon="groups"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAYspRcANfW-ZfHIk5tMYhXqSdaZSq3MfPWUaZmmsWA1_k6fsqDBr_LLWPF9Ikxh0KWVd_i0Go-ZhvbJ7EHZQ_j8HyE1cbRbJSU3YuGjyR5zdRAe8REqSxIzD9QnaSDCv7qPZBZnyWLp6mk15FNQfFiKoYo-MQqSQCNs91oimFxVOBvfzC0qrbUuQP0AcxweBJBSQllhzX8FmEOxkLYZdeSbHv_x4f0IVdvP5iVQ-veQrCdUCAjFwJzXT-VNulkz_3wtWo4xJVD4sM"
            >
              We work with: Pottery makers, Food Artisans (<i>puto</i>, <i>kakanin</i>, native delicacies), Furniture Makers, Woodworkers, Blacksmiths, Weavers, Traditional Craftsmen, and Small Home-Based Producers.
            </ImpactCard>
          </div>
        </div>
      </div>
    </section>
  );
}
