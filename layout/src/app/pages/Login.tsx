import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../auth/AuthContext";
import { DisplayPreferences } from "../components/DisplayPreferences";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isReady, loginDev, loginWithPassword, registerWithPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selfDeclaredColor, setSelfDeclaredColor] = useState("");
  const [sex, setSex] = useState("");
  const [city, setCity] = useState("");
  const [hasDisability, setHasDisability] = useState("");
  const [availableOtherStates, setAvailableOtherStates] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const devLoginEnabled = import.meta.env.DEV && String(import.meta.env.VITE_DEV_LOGIN_ENABLED || "").trim() === "1";
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app";

  const selectMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setNotice(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await registerWithPassword({
          email, password, name, phone, birthDate, selfDeclaredColor, sex, city,
          hasDisability: hasDisability === "sim",
          availableOtherStates: availableOtherStates === "sim",
        });
      } else {
        await loginWithPassword({ email, password });
      }
      navigate(fromPath, { replace: true });
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Não foi possível concluir o acesso.";
      setNotice(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="flex w-full items-center justify-between lg:px-4 xl:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar para a página inicial</Link>
        <div className="flex items-center gap-3"><DisplayPreferences compact /><Link to="/" className="flex items-center gap-2" aria-label="Cortex"><span className="h-9 w-9 overflow-hidden rounded-xl"><img src="/brand/cortex-logo.png" alt="" className="h-full w-full object-contain" /></span><strong>Cortex</strong></Link></div>
      </div>

      <section className="grid min-h-[calc(100vh-96px)] w-full items-start gap-10 py-10 lg:grid-cols-[.95fr_1.05fr] lg:px-4 lg:items-center xl:px-8">
        <div className="hidden max-w-md lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> Acesso ao seu ambiente</span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">Seu plano de estudos começa pelo seu objetivo.</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Use seu e-mail e senha para retomar seu edital, sua rotina e seu progresso em qualquer dispositivo.</p>
        </div>

        <div className="w-full max-w-xl justify-self-center rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-xl bg-primary/10 p-3 text-primary"><LockKeyhole className="h-5 w-5" /></span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">{mode === "register" ? "Crie sua conta" : "Acesse o Cortex"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "register" ? "Comece pelo seu e-mail. Em seguida, vamos entender seu edital e sua rotina." : "Entre para continuar seu plano de estudos."}</p>
          {notice ? <div role="alert" className="mt-5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm leading-6">{notice}</div> : null}

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1">
            <button type="button" onClick={() => selectMode("register")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Criar conta</button>
            <button type="button" onClick={() => selectMode("login")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Entrar</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" aria-label={mode === "register" ? "Cadastro por e-mail" : "Login por e-mail"}>
            {mode === "register" ? <label className="block text-sm font-medium" htmlFor="name">Seu nome<span className="relative mt-2 block"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos chamar você?" className="h-12 rounded-xl pl-10" /></span></label> : null}
            <label className="block text-sm font-medium" htmlFor="email">E-mail<span className="relative mt-2 block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="h-12 rounded-xl pl-10" required /></span></label>
            {mode === "register" ? <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium" htmlFor="phone">Telefone<span className="mt-2 block"><Input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(00) 00000-0000" className="h-12 rounded-xl" required /></span></label>
                <label className="block text-sm font-medium" htmlFor="birthDate">Data de nascimento<span className="mt-2 block"><Input id="birthDate" type="date" autoComplete="bday" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="h-12 rounded-xl" required /></span></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium" htmlFor="selfDeclaredColor">Cor ou raça<span className="mt-2 block"><select id="selfDeclaredColor" value={selfDeclaredColor} onChange={(event) => setSelfDeclaredColor(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm" required><option value="">Selecione</option><option value="BRANCA">Branca</option><option value="PRETA">Preta</option><option value="PARDA">Parda</option><option value="AMARELA">Amarela</option><option value="INDIGENA">Indígena</option><option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option></select></span></label>
                <label className="block text-sm font-medium" htmlFor="sex">Sexo<span className="mt-2 block"><select id="sex" value={sex} onChange={(event) => setSex(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm" required><option value="">Selecione</option><option value="FEMININO">Feminino</option><option value="MASCULINO">Masculino</option><option value="NAO_BINARIO">Não binário</option><option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option></select></span></label>
              </div>
              <label className="block text-sm font-medium" htmlFor="city">Cidade onde reside<span className="mt-2 block"><Input id="city" autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex.: Belo Horizonte" className="h-12 rounded-xl" required /></span></label>
              <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="sr-only">Informações de elegibilidade</legend><label className="block text-sm font-medium" htmlFor="hasDisability">Você é pessoa com deficiência?<span className="mt-2 block"><select id="hasDisability" value={hasDisability} onChange={(event) => setHasDisability(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm" required><option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option></select></span></label><label className="block text-sm font-medium" htmlFor="availableOtherStates">Apto a concursos em outros estados?<span className="mt-2 block"><select id="availableOtherStates" value={availableOtherStates} onChange={(event) => setAvailableOtherStates(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm" required><option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option></select></span></label></fieldset>
            </> : null}
            <label className="block text-sm font-medium" htmlFor="password">Senha<span className="relative mt-2 block"><Input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" minLength={8} className="h-12 rounded-xl pr-11" required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            {mode === "register" ? <p className="text-xs leading-5 text-muted-foreground">Usamos essas informações para personalizar seu plano, considerar regras do edital e oferecer recomendações. Você poderá consultar, corrigir ou solicitar a exclusão dos seus dados.</p> : null}
            <Button type="submit" className="h-12 w-full rounded-xl" disabled={isSubmitting}>{isSubmitting ? "Aguarde…" : mode === "register" ? "Criar conta e continuar" : "Entrar"}<LockKeyhole className="h-4 w-4" /></Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "register" ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <button type="button" className="font-semibold text-primary hover:underline" onClick={() => selectMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Entrar" : "Criar conta"}</button></p>
          {devLoginEnabled ? <div className="mt-6 border-t border-border pt-5"><p className="mb-3 text-xs text-muted-foreground">Ambiente de desenvolvimento</p><Button variant="outline" className="w-full rounded-xl" onClick={handleDevLogin} disabled={isSubmitting}>{isSubmitting ? "Entrando…" : "Entrar para teste local"}</Button></div> : null}
        </div>
      </section>
    </main>
  );
}
