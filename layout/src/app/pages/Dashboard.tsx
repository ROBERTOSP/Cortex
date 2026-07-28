import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../lib/api";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routineV1Completed, setRoutineV1Completed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const state = await apiFetch<any>("/routine/me/state");
        if (cancelled) return;
        setRoutineV1Completed(Boolean(state?.isOnboardingV1Completed));
      } catch {
        if (cancelled) return;
        setRoutineV1Completed(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const todayTasks = [
    {
      id: 1,
      type: "revision",
      subject: "Direito Constitucional",
      topic: "Principios Fundamentais",
      duration: 25,
      done: true,
    },
    {
      id: 2,
      type: "reading",
      subject: "Portugues",
      topic: "Coesao e Coerencia Textual",
      duration: 40,
      done: true,
    },
    {
      id: 3,
      type: "questions",
      subject: "Raciocinio Logico",
      topic: "Logica Proposicional",
      duration: 30,
      done: false,
    },
    {
      id: 4,
      type: "revision",
      subject: "Administracao Publica",
      topic: "Principios da CRFB/88",
      duration: 20,
      done: false,
    },
    {
      id: 5,
      type: "reading",
      subject: "Informatica",
      topic: "Seguranca da Informacao",
      duration: 35,
      done: false,
    },
  ];

  const weekDays = [
    { day: "Seg", date: 2, done: true },
    { day: "Ter", date: 3, done: true },
    { day: "Qua", date: 4, done: true },
    { day: "Qui", date: 5, done: true },
    { day: "Sex", date: 6, done: false, today: true },
    { day: "Sab", date: 7, done: false },
    { day: "Dom", date: 8, done: false },
  ];

  const indicators = [
    {
      label: "Consistencia",
      value: 87,
      icon: <Flame className="w-4 h-4" />,
      sub: "22 dias seguidos",
    },
    {
      label: "Dominio medio",
      value: 73,
      icon: <Brain className="w-4 h-4" />,
      sub: "5 pontos acima da ultima semana",
    },
    {
      label: "Retencao",
      value: 81,
      icon: <TrendingUp className="w-4 h-4" />,
      sub: "Revisoes em dia",
    },
  ];

  const typeIcon: Record<string, React.ReactNode> = {
    revision: <RefreshCw className="w-3.5 h-3.5" />,
    reading: <BookOpen className="w-3.5 h-3.5" />,
    questions: <Target className="w-3.5 h-3.5" />,
  };

  const typeLabel: Record<string, string> = {
    revision: "Revisao",
    reading: "Leitura",
    questions: "Questoes",
  };

  const completed = todayTasks.filter((task) => task.done).length;
  const total = todayTasks.length;
  const totalMinutes = todayTasks.reduce((sum, task) => sum + task.duration, 0);
  const remainingMinutes = todayTasks
    .filter((task) => !task.done)
    .reduce((sum, task) => sum + task.duration, 0);
  const userName =
    user?.name?.trim()?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Aluno";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Sexta-feira, plano de alta prioridade
          </p>
          <h1 className="mb-0">Bom retorno, {userName}</h1>
          <p className="text-muted-foreground mt-1">
            Voce esta a <span className="font-medium text-foreground">22 dias</span> de
            consistencia. O proximo melhor passo ja esta pronto.
          </p>
        </div>
        <Button className="shrink-0 gap-2 h-10" onClick={() => navigate("/app/study")}>
          <Play className="w-4 h-4" />
          Iniciar sessao
        </Button>
      </div>

      {routineV1Completed === false ? (
        <div className="bg-card rounded-3xl border border-border p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-medium mb-1">
              Finalize o onboarding v1 da rotina semanal
            </div>
            <div className="text-sm text-muted-foreground">
              Isso destrava a capacidade semanal calculada no backend (blocos por intervalo,
              compromissos e check-in como teto).
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate("/app/onboarding-v1")}>
            Continuar onboarding v1
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="mb-0.5">Hoje</h2>
              <p className="text-sm text-muted-foreground">
                {completed}/{total} tarefas concluidas e {remainingMinutes} min restantes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {Math.round((completed / total) * 100)}%
              </span>
              <div className="w-20">
                <Progress value={(completed / total) * 100} className="h-2" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                  task.done ? "opacity-55" : "hover:bg-muted/50"
                }`}
              >
                {task.done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-medium ${task.done ? "line-through" : ""}`}>
                      {task.topic}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] gap-1 px-1.5 py-0 h-5"
                    >
                      {typeIcon[task.type]}
                      {typeLabel[task.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{task.subject}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {task.duration}min
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Total planejado: <strong className="text-foreground">{totalMinutes} min</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate("/app/study")}
            >
              <Zap className="w-3.5 h-3.5" />
              Continuar estudo
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border p-5">
            <h3 className="mb-4">Proximos 7 dias</h3>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{day.day}</span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-colors ${
                      day.today
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                        : day.done
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {day.date}
                  </div>
                  {day.done ? <div className="w-1 h-1 rounded-full bg-primary" /> : null}
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Proximo evento: <span className="text-foreground font-medium">Simulado CESPE no sabado</span>
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border p-5">
            <h3 className="mb-4">Indicadores</h3>
            <div className="space-y-4">
              {indicators.map((indicator) => (
                <div key={indicator.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-primary">{indicator.icon}</span>
                      {indicator.label}
                    </div>
                    <span className="text-sm font-semibold">{indicator.value}%</span>
                  </div>
                  <Progress value={indicator.value} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{indicator.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
