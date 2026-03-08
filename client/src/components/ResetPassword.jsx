import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // Keep listener for recovery flow events.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      // Event may be PASSWORD_RECOVERY depending on setup.
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pw || pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) return setError(error.message);

      setOk(true);

      // Optional: sign out and redirect to login.
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 900);
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h2 className="text-center font-display text-4xl text-[#7C3A2E]">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-black/60">
          Create a new password for your account.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {ok ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password updated! Redirecting to login...
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="text-sm font-medium text-black/70">New password</label>
            <div className="relative mt-2">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Create a new password"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm outline-none
                           focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 hover:text-[#7C3A2E]
                           focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
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
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
