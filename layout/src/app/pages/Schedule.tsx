import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Brain,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { apiFetch } from "../lib/api";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type TaskStatus = "pending" | "done" | "missed";
type TaskType = "revision" | "reading" | "questions";

type PlanningProfile = {
  dailyStudyHours: number;
  peakEnergyTime: "MANHA" | "TARDE" | "NOITE";
  fatigueLevel: "BAIXO" | "MEDIO" | "ALTO";
  works: boolean;
};

type PlanningInsight = {
  subject: string;
  topic: string;
  attempts: number;
  accuracy: number;
  hesitationRate: number;
  priority: number;
  reason: string;
};

type ScheduledTask = {
  id: string;
  date: string;
  weekdayLabel: string;
  startsAt: string;
  subject: string;
  topic: string;
  type: TaskType;
  duration: number;
  priority: number;
  reason: string;
  status: TaskStatus;
};

type PlanningResponse = {
  generatedAt: string;
  profile: PlanningProfile;
  summary: {
    mode: "adaptativo" | "inicial";
    totalAttempts: number;
    dailyMinutes: number;
    weeklyMinutes: number;
    blockMinutes: number;
    strongestSubject: string | null;
    weakestSubject: string | null;
    subjectsInFocus: string[];
  };
  insights: PlanningInsight[];
  schedule: ScheduledTask[];
};

const typeIcon: Record<string, React.ReactNode> = {
  revision: <RefreshCw className="w-3.5 h-3.5" />,
  reading: <BookOpen className="w-3.5 h-3.5" />,
  questions: <Target className="w-3.5 h-3.5" />,
};

const typeClassName: Record<string, string> = {
  revision: "bg-muted text-foreground",
  reading: "bg-secondary text-secondary-foreground",
  questions: "bg-accent text-accent-foreground",
};

const initialProfile: PlanningProfile = {
  dailyStudyHours: 2,
  peakEnergyTime: "NOITE",
  fatigueLevel: "MEDIO",
  works: false,
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(fromDateKey(dateKey));
}

export function Schedule() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [profile, setProfile] = useState<PlanningProfile>(initialProfile);
  const [plan, setPlan] = useState<PlanningResponse | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [rescheduleTask, setRescheduleTask] = useState<ScheduledTask | null>(null);
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [rescheduleDate, setRescheduleDate] = useState("");

  const loadPlan = async (nextProfile?: PlanningProfile) => {
    const profileToSend = nextProfile || profile;

    try {
      if (plan) {
        setGenerating(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await apiFetch<PlanningResponse>("/planning/schedule", {
        method: "POST",
        body: JSON.stringify({ profile: profileToSend }),
      });

      setPlan(response);
      setTasks(response.schedule);
      setProfile(response.profile);

      const firstDate = response.schedule[0]?.date || toDateKey(today);
      setSelectedDate(firstDate);
      const firstTaskDate = fromDateKey(firstDate);
      setViewDate(new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), 1));
    } catch (err: any) {
      setError(err?.message || "Nao foi possivel gerar o cronograma.");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1
  );
  const availableDates = Array.from(new Set(tasks.map((task) => task.date))).sort();

  function getDayTasks(dateKey: string) {
    return tasks
      .filter((task) => task.date === dateKey)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  function markStatus(id: string, status: TaskStatus) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
  }

  function handleReschedule() {
    if (!rescheduleTask || !rescheduleDate) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === rescheduleTask.id
          ? { ...task, date: rescheduleDate, status: "pending" }
          : task
      )
    );
    setRescheduleTask(null);
    setReason("");
    setSelectedDate(rescheduleDate);
    setRescheduleDate("");
  }

  const selectedDayTasks = getDayTasks(selectedDate);
  const selectedDayLabel = selectedDate ? formatDateLabel(selectedDate) : "";

  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="mb-0.5">Cronograma</h1>
          <p className="text-muted-foreground text-sm">
            Engine adaptativa de estudo com plano semanal automatico
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => loadPlan()}
          disabled={loading || generating}
        >
          <Sparkles className="w-4 h-4" />
          {generating ? "Gerando..." : "Regenerar plano"}
        </Button>
      </div>

      <div className="bg-card rounded-3xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="mb-0">Configurar engine</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyStudyHours">Horas por dia</Label>
            <Input
              id="dailyStudyHours"
              type="number"
              min={1}
              max={8}
              value={profile.dailyStudyHours}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  dailyStudyHours: Number(event.target.value || 1),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Pico de energia</Label>
            <Select
              value={profile.peakEnergyTime}
              onValueChange={(value: PlanningProfile["peakEnergyTime"]) =>
                setProfile((prev) => ({ ...prev, peakEnergyTime: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANHA">Manha</SelectItem>
                <SelectItem value="TARDE">Tarde</SelectItem>
                <SelectItem value="NOITE">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nivel de fadiga</Label>
            <Select
              value={profile.fatigueLevel}
              onValueChange={(value: PlanningProfile["fatigueLevel"]) =>
                setProfile((prev) => ({ ...prev, fatigueLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXO">Baixo</SelectItem>
                <SelectItem value="MEDIO">Medio</SelectItem>
                <SelectItem value="ALTO">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Voce trabalha?</Label>
            <div className="h-9 rounded-md border border-border px-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {profile.works ? "Sim" : "Nao"}
              </span>
              <Switch
                checked={profile.works}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({ ...prev, works: checked }))
                }
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              className="w-full gap-2"
              onClick={() => loadPlan(profile)}
              disabled={loading || generating}
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Atualizando..." : "Gerar cronograma"}
            </Button>
          </div>
        </div>
        {plan ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Modo</p>
              <p className="font-medium capitalize">{plan.summary.mode}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Carga diaria</p>
              <p className="font-medium">{plan.summary.dailyMinutes} min</p>
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Tentativas lidas</p>
              <p className="font-medium">{plan.summary.totalAttempts}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Foco da semana</p>
              <p className="font-medium">
                {plan.summary.subjectsInFocus[0] || "Aguardando dados"}
              </p>
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive mt-4">{error}</p>
        ) : null}
      </div>

      {plan?.insights?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {plan.insights.slice(0, 3).map((insight) => (
            <div
              key={insight.subject}
              className="bg-card rounded-3xl border border-border p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium">{insight.subject}</p>
                  <p className="text-xs text-muted-foreground">{insight.topic}</p>
                </div>
                <Badge variant="secondary">Prioridade {insight.priority}</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Acerto: {Math.round(insight.accuracy * 100)}%</p>
                <p>Hesitacao: {Math.round(insight.hesitationRate * 100)}%</p>
                <p>Tentativas: {insight.attempts}</p>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{insight.reason}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="mb-0">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setViewDate((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setViewDate((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) {
                return <div key={index} />;
              }

              const date = new Date(year, month, day);
              const dateKey = toDateKey(date);
              const dateTasks = getDayTasks(dateKey);
              const isToday = dateKey === toDateKey(today);
              const isSelected = dateKey === selectedDate;
              const hasMissed = dateTasks.some((task) => task.status === "missed");
              const hasDone = dateTasks.some((task) => task.status === "done");
              const hasPending = dateTasks.some((task) => task.status === "pending");

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all relative ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "ring-2 ring-primary text-primary font-semibold"
                      : "hover:bg-muted/60"
                  }`}
                >
                  {day}
                  {dateTasks.length > 0 ? (
                    <div className="flex gap-0.5 absolute bottom-1.5">
                      {hasDone ? <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> : null}
                      {hasPending ? <div className="w-1.5 h-1.5 rounded-full bg-primary/60" /> : null}
                      {hasMissed ? <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> : null}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <Separator className="my-4" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Concluido
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              Pendente
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Perdido
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="mb-0">{selectedDayLabel || "Selecione um dia"}</h3>
            <Badge variant="secondary">
              {selectedDayTasks.length} tarefa{selectedDayTasks.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Gerando cronograma...</p>
            </div>
          ) : selectedDayTasks.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma tarefa neste dia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="w-14 shrink-0">
                    <p className="text-sm font-medium">{task.startsAt}</p>
                    <p className="text-[11px] text-muted-foreground">{task.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate">{task.topic}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{task.subject}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] gap-1 px-1.5 py-0 h-5 ${typeClassName[task.type]}`}
                      >
                        {typeIcon[task.type]}
                        {task.type === "revision"
                          ? "Revisao"
                          : task.type === "reading"
                          ? "Leitura"
                          : "Questoes"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5">
                        P{task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {task.weekdayLabel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{task.reason}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {task.status === "pending" ? (
                      <>
                        <button
                          onClick={() => markStatus(task.id, "done")}
                          className="text-foreground hover:text-primary transition-colors"
                          title="Marcar como feito"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRescheduleTask(task);
                            setRescheduleDate(task.date);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Replanejar"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </>
                    ) : null}
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                    {task.status === "missed" ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <button
                          onClick={() => {
                            setRescheduleTask(task);
                            setRescheduleDate(task.date);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!rescheduleTask}
        onOpenChange={() => {
          setRescheduleTask(null);
          setRescheduleDate("");
          setReason("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Replanejar atividade</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {rescheduleTask ? (
              <div className="p-3 bg-muted rounded-2xl text-sm">
                <p className="font-medium">{rescheduleTask.topic}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {rescheduleTask.subject} · {rescheduleTask.duration}min
                </p>
              </div>
            ) : null}
            <div>
              <label className="text-sm font-medium block mb-2">
                Por que nao conseguiu?
              </label>
              <Textarea
                placeholder="Ex.: nao tive tempo disponivel ou o assunto exigiu mais esforco."
                className="resize-none text-sm"
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                Novo dia desta semana
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableDates.map((dateKey) => (
                  <button
                    key={dateKey}
                    onClick={() => setRescheduleDate(dateKey)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                      rescheduleDate === dateKey
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {formatDateLabel(dateKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTask(null)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule} disabled={!reason.trim()}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
