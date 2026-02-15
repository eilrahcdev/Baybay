import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in client/.env");
}

// Use sessionStorage to avoid "sticky sessions" across browser restarts
// If you want NO persistence even on refresh, set persistSession: false
const PERSIST = (import.meta.env.VITE_PERSIST_SESSION ?? "true") === "true";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: PERSIST,
    autoRefreshToken: PERSIST,
    detectSessionInUrl: true,
    storage: PERSIST ? window.sessionStorage : undefined,
  },
});
