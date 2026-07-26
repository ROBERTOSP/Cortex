import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { RootLayout } from "./RootLayout";
import { apiFetch } from "../lib/api";

type ProfileResponse = {
  onboarding: {
    completed: boolean;
  };
};

export function ProtectedRootLayout() {
  const location = useLocation();
  const { token, isReady } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!token) {
        setProfileReady(true);
        setOnboardingCompleted(false);
        return;
      }

      try {
        const profile = await apiFetch<ProfileResponse>("/users/me/profile");
        if (cancelled) return;
        setOnboardingCompleted(Boolean(profile.onboarding.completed));
      } catch {
        if (cancelled) return;
        setOnboardingCompleted(false);
      } finally {
        if (cancelled) return;
        setProfileReady(true);
      }
    }

    if (isReady) {
      setProfileReady(false);
      loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [isReady, token]);

  if (!isReady) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profileReady) {
    return null;
  }

  if (!onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingCompleted && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <RootLayout />;
}
