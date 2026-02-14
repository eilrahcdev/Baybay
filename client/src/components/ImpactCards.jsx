import { HeartHandshake, Hand, Users } from "lucide-react";

const items = [
  {
    title: "What We Do",
    icon: Hand,
    desc: "We curate a digital storefront that showcases crafts, food, and products—making it easier to discover and support local makers.",
    img: "https://images.unsplash.com/photo-1529421308418-eab98863cee1?w=1200",
  },
  {
    title: "Why We Do It",
    icon: HeartHandshake,
    desc: "We celebrate heritage and strengthen community income by connecting tradition with modern access.",
    img: "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?w=1200",
  },
  {
    title: "Who We Support",
    icon: Users,
    desc: "Artisans, home-based entrepreneurs, and cultural communities that keep Pangasinan’s heritage alive.",
    img: "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=1200",
  },
];

export default function ImpactCards({ loading = false, stats = {} }) {
  const safeStats = {
    artisans: stats?.artisans ?? 0,
    products: stats?.products ?? 0,
    communities: stats?.communities ?? 0,
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((x) => (
        <div
          key={x.title}
          className="rounded-2xl overflow-hidden bg-white border border-baybay-sand shadow-soft"
        >
          <div
            className="h-44 bg-cover bg-center"
            style={{ backgroundImage: `url(${x.img})` }}
          />

          <div className="p-5">
            <div className="flex items-center gap-2">
              <x.icon size={18} className="text-baybay-cocoa" />
              <h3 className="font-semibold">{x.title}</h3>
            </div>

            <p className="mt-2 text-black/70 text-sm leading-relaxed">{x.desc}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Artisans", value: loading ? "…" : safeStats.artisans },
                { label: "Products", value: loading ? "…" : safeStats.products },
                { label: "Areas", value: loading ? "…" : safeStats.communities },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-baybay-bg border border-baybay-sand px-2 py-2"
                >
                  <p className="font-semibold text-sm">{s.value}</p>
                  <p className="text-[11px] text-black/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
  