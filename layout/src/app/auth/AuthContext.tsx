import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  loginWithGoogleIdToken: (googleToken: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("cortex_token");
      localStorage.removeItem("cortex_user");
    } catch {}
    setUser(null);
    setToken(null);
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("cortex_token");
      const storedUser = localStorage.getItem("cortex_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);

        try {
          const me = await apiFetch<AuthUser>("/auth/me");
          setUser(me);
          localStorage.setItem("cortex_user", JSON.stringify(me));
        } catch {
          logout();
        }
      }
    } catch {
      logout();
    } finally {
      setIsReady(true);
    }
  }, [logout]);

  const loginWithGoogleIdToken = useCallback(async (googleToken: string) => {
    const res = await apiFetch<{ user: AuthUser; token: string }>(
      "/auth/google",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify({ token: googleToken }),
      }
    );

    try {
      localStorage.setItem("cortex_token", res.token);
      localStorage.setItem("cortex_user", JSON.stringify(res.user));
    } catch {}

    setUser(res.user);
    setToken(res.token);
    setIsReady(true);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      isReady,
      loginWithGoogleIdToken,
      logout,
      loadFromStorage,
    }),
    [isReady, loginWithGoogleIdToken, logout, token, user, loadFromStorage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthProvider ausente");
  }
  return ctx;
}
