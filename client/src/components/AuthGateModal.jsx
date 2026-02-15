import { X } from "lucide-react";

export default function AuthGateModal({
  open,
  title = "Sign up or log in first to continue",
  message = "You need an account to view this page.",
  onClose,
  onLogin,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-black/10">
          {/* X */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-black/70 hover:text-black hover:bg-white"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#7C3A2E]">{title}</h3>
            <p className="mt-2 text-sm text-black/60 leading-relaxed">{message}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onLogin}
                className="flex-1 rounded-xl bg-[#7C3A2E] py-3 text-white font-semibold hover:bg-[#6b3127] transition"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-black/15 py-3 font-semibold text-black/70 hover:bg-black/5 transition"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-xs text-black/45">
              Don’t have an account? You can sign up from the login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
