export default function Team({ team = [] }) {
  return (
    <section
      id="team"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-animate"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,46,0.08)_1px,transparent_1px)] [background-size:20px_20px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block py-1 px-3 rounded-full bg-[#7C3A2E]/10 text-[#7C3A2E] text-xs font-semibold tracking-wide uppercase mb-4">
            The Artisans Behind the Screen
          </span>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-[#7C3A2E] mb-4">
            Meet the Team
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            We are a passionate group dedicated to preserving Pangasinan's cultural
            heritage through technology—connecting local artisans with the world.
          </p>
        </div>

        {team.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Team section is ready
            </h3>
            <p className="mt-2 text-gray-600">
              Add members in Supabase table <b>team</b> to populate this section.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="material-icons text-base">info</span>
              Required columns: <code className="px-2 py-1 bg-white border rounded">id</code>,{" "}
              <code className="px-2 py-1 bg-white border rounded">full_name</code>,{" "}
              <code className="px-2 py-1 bg-white border rounded">role</code>,{" "}
              <code className="px-2 py-1 bg-white border rounded">bio</code>,{" "}
              <code className="px-2 py-1 bg-white border rounded">avatar_url</code>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((m) => (
              <div
                key={m.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
              >
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#7C3A2E] opacity-10 group-hover:scale-110 transition-transform duration-300" />
                  <img
                    alt={`Portrait of ${m.full_name || "Team member"}`}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                    src={m.avatar_url}
                    loading="lazy"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{m.full_name}</h3>
                <p className="text-[#7C3A2E] font-medium text-sm mb-4">{m.role}</p>

                <p className="text-sm text-gray-600 mb-6 line-clamp-3">{m.bio}</p>

                <button
                  type="button"
                  className="mt-auto text-sm font-semibold text-[#7C3A2E] hover:underline"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <a
            className="inline-flex items-center px-8 py-3 rounded-full shadow-sm text-white bg-[#7C3A2E] hover:bg-[#5e2b22] transition"
            href="#about"
          >
            Join Our Mission
            <span className="material-icons ml-2 text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}