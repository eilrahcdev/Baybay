import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "../lib/api";
import { getFriendlyError } from "../lib/friendlyErrors";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Please enter your email.");

    setLoading(true);
    try {
      await api.requestOtp({
        email: cleanEmail,
        purpose: "reset",
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      const raw = String(e?.message || "").toLowerCase();
      if (raw.includes("no account found")) {
        setSent(true);
        return;
      }
      setError(getFriendlyError("send_reset_code", e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute left-4 top-8 h-40 w-40 rounded-full bg-[#e8c3b8]/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-6 h-44 w-44 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-[28px] border border-white/65 bg-white/88 p-6 shadow-[0_24px_64px_rgba(28,17,13,0.16)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full bg-[#7C3A2E]/10 blur-2xl" />

          <h2 className="text-center font-display text-4xl text-[#7C3A2E]">Forgot password</h2>
          <p className="mt-2 text-center text-sm text-black/60">
            Enter your email and we will send a 6-digit OTP code.
          </p>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {sent ? (
            <div className="mt-8 rounded-2xl border border-[#7C3A2E]/20 bg-[#7C3A2E]/5 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-black/5 bg-white p-2 shadow-sm">
                  <Mail size={18} className="text-[#7C3A2E]" />
                </div>
                <div>
                  <p className="font-semibold text-[#7C3A2E]">Check your email</p>
                  <p className="mt-1 text-sm text-black/65">
                    If this email is registered, a 6-digit reset code has been sent to{" "}
                    <span className="font-medium">{email}</span>.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
                    }
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#7C3A2E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6b3127]"
                  >
                    Continue to Reset Password
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-3 block text-sm font-semibold text-[#7C3A2E] hover:underline disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send another code"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-black/70">Email</label>
                <div className="mt-2 flex items-center rounded-xl border border-black/15 bg-white/95 px-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                  <Mail size={17} className="text-black/45" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="juandelacruz@gmail.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send 6-digit code"}
              </button>

              <p className="text-center text-sm text-black/60">
                Remember your password?{" "}
                <Link to="/login" className="font-semibold text-[#7C3A2E] hover:underline">
                  Log In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
