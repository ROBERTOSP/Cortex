import { createBrowserRouter } from "react-router";
import { ProtectedRootLayout } from "./components/ProtectedRootLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DeepWork } from "./pages/DeepWork";
import { Analytics } from "./pages/Analytics";
import { Schedule } from "./pages/Schedule";
import { RoutineOnboardingV1 } from "./pages/RoutineOnboardingV1";
import { PrivacyRoutine } from "./pages/PrivacyRoutine";
import { EditalReview } from "./pages/EditalReview";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedRootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "onboarding", Component: RoutineOnboardingV1 },
      { path: "onboarding-v1", Component: RoutineOnboardingV1 },
      { path: "como-usamos-seus-dados", Component: PrivacyRoutine },
      { path: "edital-review/:contestId", Component: EditalReview },
      { path: "study", Component: DeepWork },
      { path: "analytics", Component: Analytics },
      { path: "schedule", Component: Schedule },
    ],
  },
]);
