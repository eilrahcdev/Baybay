import { Sparkles, X } from "lucide-react";

export default function AuthGateModal({
  open,
  title = "Sign up or log in first to continue",
  message = "You need an account to view this page.",
  onClose,
  onLogin,
  onSignup,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#140f0d]/55 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.97),rgba(255,247,242,0.9))] shadow-[0_28px_85px_rgba(31,19,14,0.35)]">
          <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-[#d8a396]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full border border-black/10 bg-white/90 p-2 text-black/60 transition hover:bg-white hover:text-black"
          >
            <X size={18} />
          </button>

          <div className="relative p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/20 bg-[#7C3A2E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]">
              <Sparkles size={14} />
              Account Required
            </span>

            <h3 className="mt-4 text-2xl font-display font-bold leading-tight text-[#7C3A2E]">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-black/65">{message}</p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onLogin}
                className="rounded-xl bg-[#7C3A2E] py-3 text-white font-semibold shadow-sm transition hover:bg-[#6b3127]"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-black/15 bg-white/70 py-3 font-semibold text-black/70 transition hover:bg-white"
              >
                Cancel
              </button>
            </div>

            <p className="mt-5 text-sm text-black/55">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSignup || onLogin}
                className="font-semibold text-[#7C3A2E] underline-offset-2 transition hover:underline"
              >
                Sign up
              </button>
              {" "}here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
