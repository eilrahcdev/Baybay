import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "../lib/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let alive = true;

    async function init() {
      setLoadingAuth(true);
      const token = getAuthToken();

      if (!token) {
        if (!alive) return;
        setUser(null);
        setLoadingAuth(false);
        return;
      }

      try {
        const data = await api.me();
        if (!alive) return;
        setUser(data?.user || null);
      } catch (error) {
        clearAuthToken();
        if (!alive) return;
        setUser(null);
      } finally {
        if (alive) setLoadingAuth(false);
      }
    }

    init();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loadingAuth,
      isAuthed: !!user,
      signIn: ({ accessToken, user: nextUser }) => {
        if (accessToken) setAuthToken(accessToken);
        setUser(nextUser || null);
      },
      signOut: () => {
        clearAuthToken();
        setUser(null);
      },
      refreshUser: async () => {
        const data = await api.me();
        setUser(data?.user || null);
      },
    }),
    [user, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
