import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api } from "../lib/api";
import { getFriendlyError } from "../lib/friendlyErrors";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const from = location.state?.from || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) return setError("Please enter your email and password.");

    setLoading(true);
    try {
      const data = await api.login({ email, password });
      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        setError(getFriendlyError("login"));
        return;
      }

      signIn({
        accessToken,
        user: data?.user || null,
      });

      navigate(from, { replace: true });
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell relative grid min-h-screen w-full overflow-hidden lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
      {/* Left image */}
      <div className="relative hidden lg:block lg:h-screen">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3sEtA9VSN7qPvfv_YSMnxp7BpkOE3F522AH82n7mpA5aYVhcCxRnh_UmC0EtloCxmtacFvNON3KqvCT_IuPtD2h18pj_z_5NGEpgaAma1Qc8bydCT2qBj46MUnLlu1nrnlkSgKiDp957cyhxfcEJKFVRJPsF6a1lgCFvTvZ6H3PA8mrNH9h9Gus3KmuZSWS4b5R5TGZqC0riU0QbYdMxZDNNuiCGzg-MxT6s4Cexa8V4drcWHk9D7uRGtAELPxgrKEpvfKPwANSk"
          alt="BAYBAY background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b130e]/80 via-[#6f3228]/68 to-[#130a08]/74" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_78%_88%,rgba(196,138,126,0.3),transparent_36%)]" />
        <div className="absolute inset-0 flex items-center justify-center px-12">
          <div className="max-w-md text-white">
            <span className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
              Welcome Back
            </span>
            <h1 className="mt-5 font-display text-5xl leading-tight">
              Continue your craft journey
            </h1>
            <p className="mt-5 text-white/90 leading-relaxed">
              Access your Baybay account to explore handcrafted products and local artisan
              stories from Pangasinan.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative flex items-center justify-center px-6 py-10 sm:px-8 lg:h-screen lg:overflow-y-auto">
        <div className="pointer-events-none absolute left-2 top-8 h-40 w-40 rounded-full bg-[#e8c3b8]/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-2 h-40 w-40 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

        <div className="w-full max-w-md">
          {/* Form card */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_64px_rgba(28,17,13,0.16)] backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-[#7C3A2E]/10 blur-2xl" />

            <span className="inline-flex items-center rounded-full border border-[#7C3A2E]/18 bg-[#7C3A2E]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]">
              Account Login
            </span>

            <h2 className="mt-4 text-center font-display text-4xl text-[#7C3A2E]">
              Welcome back to Baybay!
            </h2>
            <p className="mt-2 text-center text-sm text-black/60">
              Log in to manage your Baybay account.
            </p>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-black/70">Email</label>
                <div className="mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 px-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                  <Mail size={17} className="text-black/45" />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="juandelacruz@gmail.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">Password</label>
                <div className="relative mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 pl-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                  <LockKeyhole size={17} className="text-black/45" />
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-3 pr-12 text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 transition hover:text-[#7C3A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-start text-sm">
                <Link to="/forgot-password" className="font-medium text-[#7C3A2E] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

                <p className="text-center text-sm text-black/60">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="font-semibold text-[#7C3A2E] hover:underline">
                    Sign up
                  </Link>
                  {" "}here.
                </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
