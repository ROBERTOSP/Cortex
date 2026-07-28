import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {
  Brain,
  LayoutDashboard,
  Zap,
  BarChart2,
  CalendarDays,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Sun,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useAuth } from "../auth/AuthContext";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/study", label: "Deep Work", icon: Zap, badge: "Hoje" },
    { path: "/analytics", label: "Analytics", icon: BarChart2 },
    { path: "/schedule", label: "Cronograma", icon: CalendarDays },
  ];

  const pageMeta = useMemo(() => {
    if (location.pathname.startsWith("/study")) {
      return {
        title: "Deep Work",
        description: "Sessao focada com acompanhamento do seu ritmo cognitivo.",
      };
    }
    if (location.pathname.startsWith("/analytics")) {
      return {
        title: "Analytics",
        description: "Metricas de evolucao, retencao e desempenho por materia.",
      };
    }
    if (location.pathname.startsWith("/schedule")) {
      return {
        title: "Cronograma",
        description: "Planejamento semanal com prioridades e replanejamento inteligente.",
      };
    }
    if (location.pathname.startsWith("/onboarding-v1")) {
      return {
        title: "Onboarding v1",
        description: "Defina sua rotina semanal para calcular capacidade e blocos de estudo.",
      };
    }
    if (location.pathname.startsWith("/onboarding")) {
      return {
        title: "Onboarding",
        description: "Configure sua rotina, escolha o edital e deixe a engine montar seu plano.",
      };
    }
    return {
      title: "Dashboard",
      description: "Visao geral da sua rotina de estudos e do proximo melhor passo.",
    };
  }, [location.pathname]);

  const userName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Aluno";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // O onboarding é uma experiência focada: não exibe navegação, menu ou cabeçalho da plataforma.
  if (
    location.pathname === "/onboarding-v1" ||
    location.pathname === "/onboarding" ||
    location.pathname.startsWith("/edital-review/")
  ) {
    return <Outlet />;
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary flex items-center justify-center shadow-sm">
          <img src="/brand/cortex-logo.png" alt="Cortex" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="font-semibold tracking-tight text-sidebar-foreground">
            Cortex
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Cognitive OS
          </div>
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          Beta
        </Badge>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span
                    className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      active
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-sidebar-border space-y-1">
        <div className="rounded-xl border border-sidebar-border bg-card px-3 py-3 mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user?.avatarUrl || undefined} alt={userName} />
              <AvatarFallback>{userInitials || "C"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-sidebar-foreground">
                {userName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email || "Sessao ativa"}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span className="text-sm">
            {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex md:w-72 border-r border-sidebar-border bg-sidebar flex-col">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0 bg-sidebar">
                    <div className="flex flex-col h-full">
                      <SidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Cortex</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{pageMeta.title}</span>
                </div>
                <div className="text-sm md:text-base font-medium truncate">
                  {pageMeta.description}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Bell className="w-4 h-4" />
              </Button>
              <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
                <Sparkles className="w-3 h-3" />
                Rotina ativa
              </Badge>
              <Separator orientation="vertical" className="hidden md:block h-6" />
              <div className="hidden md:flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={userName} />
                  <AvatarFallback>{userInitials || "C"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{userName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email || "Sessao ativa"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
