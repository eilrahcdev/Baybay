import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    async function run() {
      // For email verification / magic link flows:
      // Supabase puts code in URL. This exchanges it for a session.
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      // Regardless, go home (or login if something failed)
      if (!alive) return;

      if (error) {
        console.error(error);
        navigate("/login", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    }

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border border-black/10 animate-pulse" />
        <h1 className="mt-4 font-display text-2xl text-[#7C3A2E]">Verifying…</h1>
        <p className="mt-2 text-sm text-black/60">Please wait, redirecting you back to BAYBAY.</p>
      </div>
    </div>
  );
}
