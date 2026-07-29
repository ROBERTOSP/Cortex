import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";
import { useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import { ProfileShortcut } from "./components/ProfileShortcut";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="cortex_theme"
    >
      <AuthProvider>
        <Bootstrap />
        <div className="font-[family-name:var(--font-inter)]">
          <RouterProvider router={router} />
          <ProfileShortcut />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

function Bootstrap() {
  const { loadFromStorage } = useAuth();
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  return null;
}
