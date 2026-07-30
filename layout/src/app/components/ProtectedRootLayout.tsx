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

type RoutineStateResponse = {
  user: {
    onboardingVersion: number;
  };
  isOnboardingV1Completed: boolean;
};

export function ProtectedRootLayout() {
  const location = useLocation();
  const { token, isReady, user } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [legacyOnboardingCompleted, setLegacyOnboardingCompleted] = useState(false);
  const [routineOnboardingCompleted, setRoutineOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!token) {
        setProfileReady(true);
        setLegacyOnboardingCompleted(false);
        setRoutineOnboardingCompleted(false);
        return;
      }

      try {
        const [profile, routineState] = await Promise.all([
          apiFetch<ProfileResponse>("/users/me/profile"),
          apiFetch<RoutineStateResponse>("/routine/me/state").catch(() => null),
        ]);
        if (cancelled) return;
        setLegacyOnboardingCompleted(Boolean(profile.onboarding.completed));
        setRoutineOnboardingCompleted(
          Boolean(routineState?.isOnboardingV1Completed) ||
            Number(routineState?.user?.onboardingVersion || 0) >= 1
        );
      } catch {
        if (cancelled) return;
        setLegacyOnboardingCompleted(false);
        setRoutineOnboardingCompleted(false);
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

  if (user?.role === "ADMIN" && !location.pathname.startsWith("/app/admin/")) {
    return <Navigate to="/app/admin/editais" replace />;
  }

  const isOnboardingRoute =
    location.pathname === "/app/onboarding" ||
    location.pathname === "/app/onboarding-v1" ||
    location.pathname.startsWith("/app/edital-review/") ||
    location.pathname.startsWith("/app/admin/");

  const onboardingCompleted = legacyOnboardingCompleted || routineOnboardingCompleted;

  if (!onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/app/onboarding-v1" replace />;
  }

  return <RootLayout />;
}
