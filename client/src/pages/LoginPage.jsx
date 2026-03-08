import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        setError(userErr.message);
        await supabase.auth.signOut();
        return;
      }

      const user = userData?.user;
      if (user && !user.email_confirmed_at) {
        setError("Please verify your email first. Check your inbox for the verification link.");
        await supabase.auth.signOut();
        return;
      }

      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* Left image */}
      <div className="relative hidden lg:block">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3sEtA9VSN7qPvfv_YSMnxp7BpkOE3F522AH82n7mpA5aYVhcCxRnh_UmC0EtloCxmtacFvNON3KqvCT_IuPtD2h18pj_z_5NGEpgaAma1Qc8bydCT2qBj46MUnLlu1nrnlkSgKiDp957cyhxfcEJKFVRJPsF6a1lgCFvTvZ6H3PA8mrNH9h9Gus3KmuZSWS4b5R5TGZqC0riU0QbYdMxZDNNuiCGzg-MxT6s4Cexa8V4drcWHk9D7uRGtAELPxgrKEpvfKPwANSk"
          alt="BAYBAY background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#7C3A2E]/65" />
        <div className="absolute inset-0 flex items-center justify-center px-10">
          <div className="max-w-md text-center text-white">
            <h1 className="font-display text-5xl leading-tight">
              Be Part of the <br /> Excellence
            </h1>
            <p className="mt-4 text-white/90 leading-relaxed">
              Your gateway to Pangasinan’s artisanal excellence awaits. Join a community
              fueled by culture, creativity, and craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Form card */}
          <div className="rounded-3xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.10)] p-6 sm:p-8">
            <h2 className="text-center font-display text-4xl text-[#7C3A2E]">
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
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="juandelacruz@gmail.com"
                  className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none
                             focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">Password</label>
                <div className="relative mt-2">
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm outline-none
                               focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 hover:text-[#7C3A2E]
                               focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-[#7C3A2E] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-sm
                           hover:bg-[#6b3127] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              <p className="text-center text-sm text-black/60">
                Don’t have an account?{" "}
                <Link to="/signup" className="font-semibold text-[#7C3A2E] hover:underline">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
