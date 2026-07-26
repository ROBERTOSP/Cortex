import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";
import { useEffect } from "react";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <Bootstrap />
        <div className="font-[family-name:var(--font-inter)]">
          <RouterProvider router={router} />
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
