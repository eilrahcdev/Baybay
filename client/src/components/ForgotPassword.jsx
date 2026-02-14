import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = `${import.meta.env.VITE_SITE_URL || "http://localhost:5173"}/reset-password`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Please enter your email.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) return setError(error.message);
      setSent(true);
    } catch {
      setError("Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h2 className="text-center font-display text-4xl text-[#7C3A2E]">
          Forgot password
        </h2>
        <p className="mt-2 text-center text-sm text-black/60">
          Enter your email and we’ll send a reset link.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {sent ? (
          <div className="mt-8 rounded-2xl border border-[#7C3A2E]/20 bg-[#7C3A2E]/5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm border border-black/5">
                <Mail size={18} className="text-[#7C3A2E]" />
              </div>
              <div>
                <p className="font-semibold text-[#7C3A2E]">Check your email</p>
                <p className="mt-1 text-sm text-black/65">
                  We sent a password reset link to <span className="font-medium">{email}</span>.
                </p>

                <Link
                  to="/login"
                  className="mt-4 inline-block font-semibold text-[#7C3A2E] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="text-sm font-medium text-black/70">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="juandelacruz@gmail.com"
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none
                           focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-sm
                         hover:bg-[#6b3127] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
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
  );
}
