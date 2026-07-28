import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isReady, loginDev } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const devLoginEnabled = import.meta.env.DEV && String(import.meta.env.VITE_DEV_LOGIN_ENABLED || "").trim() === "1";
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app";

  const handleDevLogin = async () => {
    setIsSubmitting(true);
    setNotice(null);
    try {
      await loginDev(email || undefined);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível entrar no ambiente de desenvolvimento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReady && token) return <Navigate to={fromPath} replace />;

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para a página inicial
        </Link>
        <Link to="/" className="flex items-center gap-2" aria-label="Cortex">
          <span className="h-9 w-9 overflow-hidden rounded-xl bg-primary"><img src="/brand/cortex-logo.png" alt="" className="h-full w-full object-contain" /></span>
          <strong>Cortex</strong>
        </Link>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-6xl items-center gap-10 py-10 lg:grid-cols-[.95fr_1.05fr]">
        <div className="hidden max-w-md lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> Acesso ao seu ambiente</span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">Seu plano de estudos começa pelo seu objetivo.</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Quando o acesso estiver liberado, você poderá usar seu e-mail e senha para retomar seu edital, rotina e progresso em qualquer dispositivo.</p>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-xl bg-primary/10 p-3 text-primary"><LockKeyhole className="h-5 w-5" /></span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">Acesse o Cortex</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Cadastre-se ou entre com seu e-mail e senha. O acesso público ainda será liberado.</p>

          {notice ? <div role="status" className="mt-5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm leading-6">{notice}</div> : null}

          <form className="mt-6 space-y-4" aria-label="Acesso por e-mail em preparação">
            <label className="block text-sm font-medium" htmlFor="email">E-mail
              <span className="relative mt-2 block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="h-12 rounded-xl pl-10" required /></span>
            </label>
            <label className="block text-sm font-medium" htmlFor="password">Senha
              <span className="relative mt-2 block"><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" className="h-12 rounded-xl pr-11" required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
            </label>
            <Button type="button" className="h-12 w-full rounded-xl" disabled>Acesso por e-mail em breve <LockKeyhole className="h-4 w-4" /></Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">Cadastro por e-mail e senha em breve.</p>

          {devLoginEnabled ? <div className="mt-6 border-t border-border pt-5"><p className="mb-3 text-xs text-muted-foreground">Ambiente de desenvolvimento</p><Button variant="outline" className="w-full rounded-xl" onClick={handleDevLogin} disabled={isSubmitting}>{isSubmitting ? "Entrando…" : "Entrar para teste local"}</Button></div> : null}
        </div>
      </section>
    </main>
  );
}
