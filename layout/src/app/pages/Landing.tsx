import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  FileText,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { DisplayPreferences } from "../components/DisplayPreferences";

const features = [
  {
    icon: FileText,
    title: "Entenda seu edital",
    text: "Envie o edital para identificar cargos, matérias, regras e o que realmente importa para o seu perfil.",
  },
  {
    icon: CalendarDays,
    title: "Plano que cabe na vida real",
    text: "A rotina vira uma capacidade sustentável de estudo, até a data da sua prova.",
  },
  {
    icon: BrainCircuit,
    title: "Prioridades mais inteligentes",
    text: "O Cortex combina edital, incidência da banca e seu desempenho para orientar o próximo passo.",
  },
  {
    icon: BarChart3,
    title: "Evolução visível",
    text: "Acompanhe consistência, lacunas e revisões sem depender de planilhas.",
  },
];

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex w-full items-center justify-between px-6 py-5 lg:px-10 xl:px-14">
        <Link to="/" className="flex items-center gap-3" aria-label="Página inicial do Cortex">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
            <img src="/brand/cortex-logo.png" alt="" className="h-full w-full object-contain" />
          </span>
          <span>
            <strong className="block text-lg leading-none">Cortex</strong>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Estudos inteligentes
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Navegação principal">
          <a href="#como-funciona" className="transition-colors hover:text-foreground">Como funciona</a>
          <a href="#recursos" className="transition-colors hover:text-foreground">Recursos</a>
          <a href="#para-voce" className="transition-colors hover:text-foreground">Para você</a>
        </nav>
        <div className="flex items-center gap-2"><DisplayPreferences compact /><Button asChild variant="outline" className="rounded-xl"><Link to="/login">Entrar</Link></Button></div>
      </header>

      <section className="grid w-full gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-28 lg:pt-24 xl:px-14">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Seu estudo, com direção
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Prepare-se para a prova com um plano que entende a sua realidade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            O Cortex transforma edital, rotina e desempenho em uma jornada de estudo clara — do primeiro dia até a prova.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-xl px-6">
              <Link to="/login">Criar minha conta <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-6">
              <a href="#como-funciona"><PlayCircle className="h-4 w-4" /> Ver como funciona</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
            {['Comece pelo seu edital', 'Ajuste à sua rotina', 'Acompanhe o próximo passo'].map((item) => (
              <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/10 lg:mt-3">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Seu plano de hoje</p>
              <h2 className="mt-1 text-xl font-semibold">Avance com clareza</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground">Em preparação</span>
          </div>
          <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-xl bg-primary p-2 text-primary-foreground"><Target className="h-4 w-4" /></span>
              <div>
                <p className="font-semibold">Próxima ação recomendada</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Revise o tópico com maior impacto antes de iniciar o próximo bloco.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[['Edital', 'Analisado'], ['Rotina', '3h30/semana'], ['Progresso', 'Primeiro ciclo']].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-border p-4">
            <div className="flex justify-between text-sm"><span className="font-medium">Seu ciclo até a prova</span><span className="text-primary">Começar</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[28%] rounded-full bg-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">Um plano é ajustado quando sua rotina ou desempenho muda.</p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-border bg-muted/35">
        <div className="w-full px-6 py-20 lg:px-10 xl:px-14">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Como funciona</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Do edital ao primeiro ciclo, sem uma planilha para montar.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['01', 'Importe seu edital', 'O Cortex organiza os dados importantes do concurso e do cargo escolhido.'],
              ['02', 'Conte como é sua rotina', 'Você informa quando pode estudar e escolhe um ritmo possível de manter.'],
              ['03', 'Comece pelo melhor próximo passo', 'O plano prioriza o conteúdo e se adapta à sua evolução.'],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-2xl border border-border bg-card p-6">
                <span className="text-sm font-bold text-primary">{number}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="w-full px-6 py-20 lg:px-10 xl:px-14">
        <div className="flex max-w-3xl flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Uma plataforma, não apenas um cronograma</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ferramentas para estudar, decidir e evoluir.</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1">
              <span className="inline-flex rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="para-voce" className="w-full px-6 pb-20 lg:px-10 xl:px-14">
        <div className="rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 lg:px-14">
          <div className="max-w-3xl">
            <BookOpenCheck className="h-7 w-7" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Seu objetivo merece mais do que um formulário e uma lista de matérias.</h2>
            <p className="mt-4 text-lg leading-8 text-primary-foreground/80">Comece com o edital. O Cortex cuida da organização para você focar no estudo.</p>
            <Button asChild variant="secondary" size="lg" className="mt-7 h-12 rounded-xl bg-background text-foreground hover:bg-background/90">
              <Link to="/login">Criar minha conta <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">Cortex · estudos orientados por contexto, rotina e progresso.</footer>
    </main>
  );
}
