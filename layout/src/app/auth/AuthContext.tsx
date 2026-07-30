import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: "USER" | "ADMIN";
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  loginWithGoogleIdToken: (googleToken: string) => Promise<void>;
  registerWithPassword: (payload: { email: string; password: string; name?: string; phone: string; selfDeclaredColor: string; hasDisability: boolean; birthDate: string; sex: string; city: string; availableOtherStates: boolean }) => Promise<void>;
  loginWithPassword: (payload: { email: string; password: string }) => Promise<void>;
  loginDev: (email?: string) => Promise<void>;
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

  const saveSession = useCallback((res: { user: AuthUser; token: string }) => {
    try {
      localStorage.setItem("cortex_token", res.token);
      localStorage.setItem("cortex_user", JSON.stringify(res.user));
    } catch {}
    setUser(res.user);
    setToken(res.token);
    setIsReady(true);
  }, []);

  const registerWithPassword = useCallback(async (payload: { email: string; password: string; name?: string; phone: string; selfDeclaredColor: string; hasDisability: boolean; birthDate: string; sex: string; city: string; availableOtherStates: boolean }) => {
    const res = await apiFetch<{ user: AuthUser; token: string }>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
    saveSession(res);
  }, [saveSession]);

  const loginWithPassword = useCallback(async (payload: { email: string; password: string }) => {
    const res = await apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
    saveSession(res);
  }, [saveSession]);

  const loginDev = useCallback(async (email?: string) => {
    const secret = (import.meta.env.VITE_DEV_LOGIN_SECRET || "").trim();
    const res = await apiFetch<{ user: AuthUser; token: string }>("/auth/dev/login", {
      method: "POST",
      auth: false,
      headers: secret ? { "X-Dev-Login-Secret": secret } : undefined,
      body: JSON.stringify({ email: email || undefined }),
    });

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
      registerWithPassword,
      loginWithPassword,
      loginDev,
      logout,
      loadFromStorage,
    }),
    [isReady, loginWithGoogleIdToken, loginWithPassword, loginDev, logout, registerWithPassword, token, user, loadFromStorage]
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
