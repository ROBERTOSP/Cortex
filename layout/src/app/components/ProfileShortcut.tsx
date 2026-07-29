import { CircleUserRound, LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function ProfileShortcut() {
  const { user, token } = useAuth();
  const label = user?.name?.trim() || user?.email?.split("@")[0] || "Meu perfil";
  const initials = label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <a
      href={token ? "/app" : "/login"}
      className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:left-6"
      aria-label={token ? "Abrir meu perfil" : "Acessar conta"}
      title={token ? "Meu perfil" : "Acessar conta"}
    >
      {token ? (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{initials || <CircleUserRound className="h-4 w-4" />}</span>
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><LogIn className="h-4 w-4" /></span>
      )}
      <span className="hidden max-w-32 truncate sm:inline">{token ? label : "Acessar conta"}</span>
    </a>
  );
}
