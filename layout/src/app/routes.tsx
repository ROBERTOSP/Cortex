import { createBrowserRouter } from "react-router";
import { ProtectedRootLayout } from "./components/ProtectedRootLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DeepWork } from "./pages/DeepWork";
import { Analytics } from "./pages/Analytics";
import { Schedule } from "./pages/Schedule";
import { Onboarding } from "./pages/Onboarding";

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
      { path: "onboarding", Component: Onboarding },
      { path: "study", Component: DeepWork },
      { path: "analytics", Component: Analytics },
      { path: "schedule", Component: Schedule },
    ],
  },
]);
