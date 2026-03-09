import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { getFriendlyError } from "../lib/friendlyErrors";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const cleanEmail = email.trim().toLowerCase();

  const verifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!cleanEmail) return setError("Please enter your email.");
    if (!/^\d{6}$/.test(otp.trim())) return setError("Code must be exactly 6 digits.");

    setLoading(true);
    try {
      await api.verifyOtp({
        email: cleanEmail,
        purpose: "verify",
        otp: otp.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("verify_email", e?.message));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    if (!cleanEmail) return setError("Enter your email first.");

    setResending(true);
    try {
      await api.requestOtp({
        email: cleanEmail,
        purpose: "verify",
      });
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("resend_verification_code", e?.message));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-shell relative grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1524498250077-390f9e378fc0?w=1600"
          alt="Email verification"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b130e]/80 via-[#6f3228]/68 to-[#130a08]/74" />
        <div className="absolute inset-0 flex items-center justify-center px-12">
          <div className="max-w-md text-white">
            <span className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
              Verify Email
            </span>
            <h1 className="mt-5 font-display text-5xl leading-tight">
              One last step to activate your account
            </h1>
            <p className="mt-5 text-white/90 leading-relaxed">
              Enter your 6-digit verification code to start using your Baybay account.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-start justify-center px-4 py-8 sm:items-center sm:px-8 sm:py-10 lg:overflow-y-auto">
        <div className="pointer-events-none absolute left-2 top-8 h-40 w-40 rounded-full bg-[#e8c3b8]/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-2 h-40 w-40 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_64px_rgba(28,17,13,0.16)] backdrop-blur-xl sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7C3A2E]/20 bg-[#7C3A2E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]">
              <ShieldCheck size={14} />
              Email Verification
            </span>

            <h2 className="mt-4 text-center font-display text-3xl text-[#7C3A2E] sm:text-4xl">
              Verify your email
            </h2>
            <p className="mt-2 text-center text-sm text-black/60">
              Enter the 6-digit code sent to your inbox.
            </p>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Email verified. Redirecting to login...
              </div>
            ) : null}

            <form onSubmit={verifyCode} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-black/70">Email</label>
                <div className="mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 px-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
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

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black/70">Verification code</label>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resending}
                    className="text-xs font-semibold text-[#7C3A2E] hover:underline disabled:opacity-60"
                  >
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                </div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm tracking-[0.2em] outline-none focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15 sm:tracking-[0.28em]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>

              <p className="text-center text-sm text-black/60">
                Already verified?{" "}
                <Link to="/login" className="font-semibold text-[#7C3A2E] hover:underline">
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
