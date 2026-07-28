import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Brain, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isReady, loginWithGoogleIdToken, loginDev } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  useEffect(() => {
    if (!isReady || token) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("VITE_GOOGLE_CLIENT_ID não configurado.");
      return;
    }

    const ensureInitialized = () => {
      const google = window.google;
      if (!google?.accounts?.id) {
        setError("Falha ao carregar Google Identity Services.");
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (credentialResponse: { credential?: string }) => {
          const credential = credentialResponse.credential;
          if (!credential) {
            setError("Não foi possível obter o token do Google.");
            return;
          }

          setIsSubmitting(true);
          setError(null);
          try {
            await loginWithGoogleIdToken(credential);
            navigate(fromPath, { replace: true });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha no login.");
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      const el = document.getElementById("google-signin-button");
      if (el) {
        el.innerHTML = "";
        google.accounts.id.renderButton(el, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 360,
        });
      }
    };

    if (window.google?.accounts?.id) {
      ensureInitialized();
      return;
    }

    if (document.querySelector('script[data-cortex="google-gsi"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.cortex = "google-gsi";
    script.onload = ensureInitialized;
    script.onerror = () => setError("Falha ao carregar o script do Google.");
    document.head.appendChild(script);
  }, [fromPath, isReady, loginWithGoogleIdToken, navigate, token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Login por e-mail ainda não está disponível.");
  };

  const devLoginEnabled =
    import.meta.env.DEV && String(import.meta.env.VITE_DEV_LOGIN_ENABLED || "").trim() === "1";

  const handleDevLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginDev();
      navigate(fromPath, { replace: true });
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e ? String((e as any).message) : "Falha no login.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReady && token) {
    return <Navigate to={fromPath} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-[44%] min-h-screen bg-primary text-primary-foreground p-12 xl:p-16 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10 border border-primary-foreground/10">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">Cortex</div>
            <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
              Personal Trainer Cognitivo
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <Badge className="mb-6 bg-primary-foreground/10 text-primary-foreground border-0 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Rotina com inteligencia adaptativa
          </Badge>
          <h1 className="text-4xl xl:text-5xl leading-tight font-medium">
            Um ambiente de estudo com foco, revisao e progresso visivel.
          </h1>
          <p className="mt-5 max-w-lg text-base text-primary-foreground/72">
            Entre com sua conta Google para acessar seu dashboard, organizar o
            cronograma e acompanhar a evolucao da sua preparacao.
          </p>
        </div>

        <div className="grid gap-4 max-w-xl">
          {[
            {
              title: "Deep Work",
              description: "Sessoes com tempo, notas e explicacao assistida.",
            },
            {
              title: "Analytics",
              description: "Indicadores de consistencia, acerto e retencao.",
            },
            {
              title: "Cronograma",
              description: "Planejamento visual para manter ritmo e prioridade.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 px-5 py-4"
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-sm text-primary-foreground/68">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">Cortex</div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Cognitive OS
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Login seguro
              </Badge>
              <h1 className="text-3xl font-medium tracking-tight mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-muted-foreground">
                Continue de onde parou e retome seu ciclo de estudos.
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {devLoginEnabled ? (
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm flex items-center justify-between gap-3 mb-6">
                <div className="text-muted-foreground">Modo desenvolvimento</div>
                <Button variant="secondary" onClick={handleDevLogin} disabled={isSubmitting}>
                  Entrar (dev)
                </Button>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-muted/40 p-4 mb-6">
              <div
                id="google-signin-button"
                className="w-full flex justify-center overflow-hidden"
              />
              {isSubmitting ? (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </div>
              ) : null}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-[0.18em]">
                <span className="bg-card px-3 text-muted-foreground">
                  Em breve
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                disabled
                required
              />
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                disabled
                required
              />
              <Button type="submit" className="w-full h-12 rounded-xl" disabled>
                Entrar com e-mail
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
              Seus dados de autenticacao continuam no fluxo atual do projeto.
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sua jornada cognitiva comeca aqui.
          </p>
        </div>
      </main>
    </div>
  );
}
