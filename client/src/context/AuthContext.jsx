import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

function getInitials(fullNameOrEmail) {
  const v = (fullNameOrEmail || "").trim();
  if (!v) return "U";

  // If it's an email, use before @
  const base = v.includes("@") ? v.split("@")[0] : v;

  const parts = base
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const user = session?.user ?? null;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "";

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      displayName,
      initials,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, user, loading, displayName, initials]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
