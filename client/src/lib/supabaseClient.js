import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in client/.env");
}

// Use sessionStorage so sessions do not survive browser restarts.
// Set persistSession to false if you do not want session persistence at all.
const PERSIST = (import.meta.env.VITE_PERSIST_SESSION ?? "true") === "true";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: PERSIST,
    autoRefreshToken: PERSIST,
    detectSessionInUrl: true,
    storage: PERSIST ? window.sessionStorage : undefined,
  },
});
