import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api } from "../lib/api";
import { getFriendlyError } from "../lib/friendlyErrors";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) return setError("Please enter your email.");
    if (!/^\d{6}$/.test(cleanOtp)) return setError("OTP must be exactly 6 digits.");
    if (!pw || pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api.resetPasswordWithOtp({
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: pw,
      });

      setOk(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("reset_password", e?.message));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Enter your email first.");

    setSendingCode(true);
    try {
      await api.requestOtp({
        email: cleanEmail,
        purpose: "reset",
      });
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("resend_reset_code", e?.message));
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div className="page-shell relative flex min-h-screen items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute left-4 top-8 h-40 w-40 rounded-full bg-[#e8c3b8]/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-6 h-44 w-44 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

      <div className="w-full max-w-xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/65 bg-white/88 p-6 shadow-[0_24px_64px_rgba(28,17,13,0.16)] backdrop-blur-xl sm:p-8">
          <h2 className="text-center font-display text-3xl text-[#7C3A2E] sm:text-4xl">Reset password</h2>
          <p className="mt-2 text-center text-sm text-black/60">
            Enter your email, OTP code, and new password.
          </p>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {ok ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Password updated. Redirecting to login...
            </div>
          ) : null}

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

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black/70">OTP code</label>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={sendingCode}
                  className="text-xs font-semibold text-[#7C3A2E] hover:underline disabled:opacity-60"
                >
                  {sendingCode ? "Sending..." : "Resend code"}
                </button>
              </div>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                type="text"
                inputMode="numeric"
                placeholder="123456"
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm tracking-[0.2em] outline-none focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15 sm:tracking-[0.3em]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black/70">New password</label>
              <div className="relative mt-2 flex items-center rounded-xl border border-black/15 bg-white/95 pl-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                <LockKeyhole size={17} className="text-black/45" />
                <input
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  type={show ? "text" : "password"}
                  placeholder="Create a new password"
                  className="w-full bg-transparent px-3 py-3 pr-12 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 transition hover:text-[#7C3A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-black/70">Confirm password</label>
              <input
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Confirm new password"
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Reset password"}
            </button>

            <p className="text-center text-sm text-black/60">
              Back to{" "}
              <Link to="/login" className="font-semibold text-[#7C3A2E] hover:underline">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
