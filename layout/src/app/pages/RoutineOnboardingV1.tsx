import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiFetch } from "../lib/api";

type Day = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
type Window = {
  id: string;
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
};
type Commitment = {
  id: string;
  category: string;
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
};
type CatalogContest = {
  id: string;
  name: string;
  board: string;
  targetJob: string;
  examDate: string;
  description: string;
};
const days: [Day, string][] = [
  ["MON", "Segunda"],
  ["TUE", "Terça"],
  ["WED", "Quarta"],
  ["THU", "Quinta"],
  ["FRI", "Sexta"],
  ["SAT", "Sábado"],
  ["SUN", "Domingo"],
];
const minute = (v: string) => {
  const p = v.split(":").map(Number);
  return p.length === 2 ? p[0] * 60 + p[1] : NaN;
};
const fmt = (v: number) =>
  `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
const monday = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};
const id = () => `${Date.now()}_${Math.random()}`;
const steps = [
  "Seu objetivo",
  "Como você estuda",
  "Quando pode estudar",
  "O que ocupa seu tempo",
  "Sua capacidade inicial",
];
function Choice({
  selected,
  onClick,
  title,
  detail,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  detail?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`}
    >
      <strong className="block">{title}</strong>
      {detail && (
        <span className="mt-1 block text-sm text-muted-foreground">
          {detail}
        </span>
      )}
    </button>
  );
}

export function RoutineOnboardingV1() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<any>(null);
  const [goal, setGoal] = useState({
    type: "APPROVAL",
    studyLevel: "INTERMEDIATE",
    phase: "PRE_NOTICE",
    title: "",
    targetJob: "",
    board: "",
    examDate: "",
    examDateUnknown: true,
  });
  const [routine, setRoutine] = useState({
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
    peakEnergyPeriod: "MORNING",
    habitualFatigueLevel: "MEDIUM",
    preferredSessionMinutes: 40,
    planMode: "FLEXIBLE",
    maxSubjectsPerDay: 3,
    badDayMinimumMinutes: 20,
    missedDayStrategy: "REDISTRIBUTE",
  });
  const [windows, setWindows] = useState<Window[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [catalog, setCatalog] = useState<CatalogContest[]>([]);
  const [editalMode, setEditalMode] = useState<
    "none" | "catalog" | "pdf" | "link"
  >("none");
  const [catalogId, setCatalogId] = useState("");
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [editalLink, setEditalLink] = useState("");
  const [contestCreated, setContestCreated] = useState(false);
  const [draftContestId, setDraftContestId] = useState<string | null>(null);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const s: any = await apiFetch("/routine/me/state");
        if (cancel) return;
        if (s.studyGoal)
          setGoal((x: any) => ({
            ...x,
            ...s.studyGoal,
            examDate: s.studyGoal.examDate?.slice(0, 10) || "",
          }));
        if (s.routine)
          setRoutine((x: any) => ({
            ...x,
            ...s.routine,
            timezone: s.routine.timezone || x.timezone,
          }));
        setWindows(
          (s.availabilityWindows || []).map((w: any) => ({
            id: w.id,
            dayOfWeek: w.dayOfWeek,
            startTime: fmt(w.startMinute),
            endTime: fmt(w.endMinute),
          })),
        );
        setCommitments(
          (s.commitments || []).map((c: any) => ({
            id: c.id,
            category: c.category,
            dayOfWeek: c.dayOfWeek,
            startTime: fmt(c.startMinute),
            endTime: fmt(c.endMinute),
          })),
        );
      } catch (e: any) {
        setError(e.message || "Não foi possível carregar suas respostas.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  useEffect(() => {
    apiFetch<CatalogContest[]>("/contests/catalog")
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);
  const saveGoal = () =>
    apiFetch("/routine/me/goal", {
      method: "PUT",
      body: JSON.stringify({
        ...goal,
        targetJob: goal.targetJob || "Ainda não definido",
        board: goal.board || null,
        examDate: goal.examDate || null,
      }),
    });
  const saveRoutine = () =>
    apiFetch("/routine/me/routine", {
      method: "PUT",
      body: JSON.stringify({
        ...routine,
        wantsDayOff: false,
        dayOffPreference: null,
      }),
    });
  const saveWindows = () =>
    apiFetch("/routine/me/windows", {
      method: "PUT",
      body: JSON.stringify({
        windows: windows.map((w) => ({
          dayOfWeek: w.dayOfWeek,
          startMinute: minute(w.startTime),
          endMinute: minute(w.endTime),
          context: "HOME",
          devices: ["LAPTOP"],
          flexibility: "FLEXIBLE",
          allowedActivities: ["THEORY", "REVIEW", "QUESTIONS"],
        })),
      }),
    });
  const saveCommitments = () =>
    apiFetch("/routine/me/commitments", {
      method: "PUT",
      body: JSON.stringify({
        commitments: commitments.map((c) => ({
          category: c.category,
          dayOfWeek: c.dayOfWeek,
          startMinute: minute(c.startTime),
          endMinute: minute(c.endTime),
          flexibility: "STRICT",
          note: null,
        })),
      }),
    });
  const createContest = async () => {
    if (contestCreated || editalMode === "none") return;
    const meta = {
      name: goal.title,
      targetJob: goal.targetJob || goal.title,
      board: goal.board || undefined,
      examDate: goal.examDate || undefined,
    };
    let contest: any;
    if (editalMode === "catalog") {
      if (!catalogId)
        throw new Error(
          "Escolha um edital do catálogo ou selecione outra opção.",
        );
      contest = await apiFetch("/contests", {
        method: "POST",
        body: JSON.stringify({ ...meta, templateId: catalogId }),
      });
    }
    if (editalMode === "pdf") {
      if (!editalFile)
        throw new Error("Selecione o PDF do edital para continuar.");
      const body = new FormData();
      body.set("file", editalFile);
      Object.entries(meta).forEach(([key, value]) => {
        if (value) body.set(key, value);
      });
      contest = await apiFetch("/contests/upload-edital", {
        method: "POST",
        body,
      });
    }
    if (editalMode === "link") {
      if (!editalLink.trim())
        throw new Error("Cole o link direto do PDF do edital.");
      contest = await apiFetch("/contests/import-edital-link", {
        method: "POST",
        body: JSON.stringify({ ...meta, url: editalLink.trim() }),
      });
    }
    if (contest?.status === "DRAFT") setDraftContestId(contest.id);
    setContestCreated(true);
    return contest;
  };
  const advance = async () => {
    setError("");
    if (step === 0 && editalMode === "none" && !goal.title.trim()) {
      setError("Envie o edital ou informe um objetivo para continuar.");
      return;
    }
    if (step === 2 && !windows.length) {
      setError("Escolha ao menos um horário em que você possa estudar.");
      return;
    }
    setSaving(true);
    try {
      if (step === 0) {
        const contest = await createContest();
        if (contest?.status === "DRAFT") {
          navigate(`/edital-review/${contest.id}`);
          return;
        }
        await saveGoal();
      }
      if (step === 1) await saveRoutine();
      if (step === 2) await saveWindows();
      if (step === 3) {
        await saveCommitments();
        const r: any = await apiFetch("/routine/me/preview-week", {
          method: "POST",
          body: JSON.stringify({
            weekStartDate: monday(),
            checkInDateKey: null,
          }),
        });
        setPreview(r.preview);
      }
      if (step < 4) setStep(step + 1);
      else {
        await apiFetch("/routine/me/complete", { method: "POST" });
        navigate(
          draftContestId ? `/edital-review/${draftContestId}` : "/schedule",
        );
      }
    } catch (e: any) {
      setError(e.message || "Não foi possível salvar agora.");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="p-8 text-muted-foreground">Carregando sua rotina…</div>
    );
  const total =
    Math.round(((preview?.weekly?.sustainableMinutes || 0) / 60) * 10) / 10;
  const blocks = preview?.weekly?.maximumBlocks || 0;
  return (
    <main className="onboarding-light mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8">
      <header className="mb-5 max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock3 className="size-4" />
          Leva cerca de 3 minutos
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Vamos conhecer sua rotina
        </h1>
        <p className="mt-2 text-muted-foreground">
          Poucas respostas agora ajudam a criar um plano que caiba na sua vida.
        </p>
      </header>
      <Card className="rounded-3xl p-5 md:p-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3 border-b pb-5">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || saving}
          >
            <ChevronLeft />
            Voltar
          </Button>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Seu progresso</span>
              <span>Etapa {step + 1} de 5</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(step + 1) * 20}%` }}
              />
            </div>
          </div>
          <Button onClick={advance} disabled={saving}>
            {step === 4 ? "Criar minha rotina" : "Avançar"}
            <ChevronRight />
          </Button>
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {step === 0 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">Conheça seu edital</p>
            <h2 className="mt-1 text-2xl font-semibold">
              Vamos começar pelo seu edital
            </h2>
            <p className="mt-2 text-muted-foreground">
              Envie o documento ou cole o link. O Cortex encontra os cargos, regras e matérias antes de pedir informações sobre sua rotina.
            </p>
            <div className="mt-7 max-w-2xl space-y-4">
                <div>
                  <Label htmlFor="objective">Nome do concurso <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                  <Input
                    id="objective"
                    className="mt-2"
                    value={goal.title}
                    onChange={(e) =>
                      setGoal({ ...goal, title: e.target.value })
                    }
                    placeholder="Ex.: Polícia Federal — a IA pode preencher depois"
                  />
                </div>
                <div>
                  <Label htmlFor="job">
                    Cargo pretendido{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="job"
                    className="mt-2"
                    value={goal.targetJob}
                    onChange={(e) =>
                      setGoal({ ...goal, targetJob: e.target.value })
                    }
                    placeholder="Ex.: Agente"
                  />
                </div>
                <div>
                  <Label htmlFor="board">
                    Banca{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="board"
                    className="mt-2"
                    value={goal.board}
                    onChange={(e) =>
                      setGoal({ ...goal, board: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date">
                    Data da prova{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="date"
                    className="mt-2"
                    type="date"
                    disabled={goal.examDateUnknown}
                    value={goal.examDate}
                    onChange={(e) =>
                      setGoal({
                        ...goal,
                        examDate: e.target.value,
                        examDateUnknown: false,
                      })
                    }
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={goal.examDateUnknown}
                      onCheckedChange={(v) =>
                        setGoal({
                          ...goal,
                          examDateUnknown: Boolean(v),
                          examDate: "",
                        })
                      }
                    />
                    Ainda não sei a data
                  </label>
                </div>
                <div>
                  <Label>Envie seu edital para uma análise inteligente</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Em poucos instantes, identificaremos banca, datas, cargos, requisitos, cotas/PCD e as matérias de cada cargo. Você revisa tudo antes de continuar.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Choice selected={editalMode === "none"} onClick={() => setEditalMode("none")} title="Ainda não" />
                    <Choice selected={editalMode === "pdf"} onClick={() => setEditalMode("pdf")} title="Enviar PDF" />
                    <Choice selected={editalMode === "link"} onClick={() => setEditalMode("link")} title="Colar link" />
                    <Choice selected={editalMode === "catalog"} onClick={() => setEditalMode("catalog")} title="Usar catálogo" />
                  </div>
                  {editalMode === "pdf" && <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4"><input id="edital-pdf" className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => setEditalFile(event.target.files?.[0] || null)} /><label htmlFor="edital-pdf" className="flex cursor-pointer items-center justify-between gap-3"><span><strong className="block">Selecionar PDF do edital</strong><span className="mt-1 block text-sm text-muted-foreground">{editalFile ? `Arquivo selecionado: ${editalFile.name}` : "Clique aqui para escolher o arquivo"}</span></span><span className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Escolher arquivo</span></label></div>}
                  {editalMode === "link" && <Input className="mt-3" type="url" value={editalLink} onChange={(event) => setEditalLink(event.target.value)} placeholder="https://.../edital.pdf" />}
                  {editalMode === "catalog" && <select className="mt-3 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={catalogId} onChange={(event) => setCatalogId(event.target.value)}><option value="">Escolha um edital</option>{catalog.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.targetJob}</option>)}</select>}
                </div>
            </div>
          </section>
        )}
        {step === 1 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">
              Como você estuda
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Vamos adaptar o plano ao seu ritmo
            </h2>
            <div className="mt-6">
              <Label>Qual é seu nível de conhecimento atual?</Label>
              <p className="mt-1 text-sm text-muted-foreground">Não é uma prova: isso apenas define o ponto de partida do seu plano.</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {[["BEGINNER", "Iniciante", "Estou começando ou retomando a base"], ["INTERMEDIATE", "Intermediário", "Já estudei parte do conteúdo"], ["ADVANCED", "Avançado", "Quero revisar e ganhar desempenho"]].map(([v, t, d]) => <Choice key={v} selected={goal.studyLevel === v} onClick={() => setGoal({ ...goal, studyLevel: v })} title={t} detail={d} />)}
              </div>
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <Label>Em qual período você rende melhor?</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["MORNING", "Manhã"],
                    ["AFTERNOON", "Tarde"],
                    ["EVENING", "Noite"],
                    ["NIGHT", "Madrugada"],
                  ].map(([v, t]) => (
                    <Choice
                      key={v}
                      selected={routine.peakEnergyPeriod === v}
                      onClick={() =>
                        setRoutine({ ...routine, peakEnergyPeriod: v })
                      }
                      title={t}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Quanto tempo você aguenta estudar de uma vez?</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha um bloco confortável. Você pode mudar depois.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {[20, 25, 30, 40, 45, 50, 60].map((v) => (
                    <Choice
                      key={v}
                      selected={routine.preferredSessionMinutes === v}
                      onClick={() =>
                        setRoutine({ ...routine, preferredSessionMinutes: v })
                      }
                      title={`${v} min`}
                    />
                  ))}
                </div>
                <Label className="mt-6 block">Como prefere seu plano?</Label>
                <div className="mt-3 grid gap-2">
                  {[
                    ["FLEXIBLE", "Flexível", "Reorganiza o que não coube"],
                    ["RIGID", "Estruturado", "Mantém uma sequência definida"],
                  ].map(([v, t, d]) => (
                    <Choice
                      key={v}
                      selected={routine.planMode === v}
                      onClick={() => setRoutine({ ...routine, planMode: v })}
                      title={t}
                      detail={d}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        {step === 2 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">
              Quando pode estudar
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Escolha horários possíveis de verdade
            </h2>
            <p className="mt-2 text-muted-foreground">
              Comece com os dias em que você realmente consegue estudar.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {days.map(([d, label]) => (
                <Button
                  key={d}
                  variant="outline"
                  className="justify-between"
                  onClick={() =>
                    setWindows([
                      ...windows,
                      {
                        id: id(),
                        dayOfWeek: d,
                        startTime: "19:00",
                        endTime: "20:00",
                      },
                    ])
                  }
                >
                  {label}
                  <Plus />
                </Button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {windows.map((w) => (
                <div
                  key={w.id}
                  className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <strong>{days.find((x) => x[0] === w.dayOfWeek)?.[1]}</strong>
                  <Input
                    type="time"
                    step="60"
                    value={w.startTime}
                    onChange={(e) =>
                      setWindows(
                        windows.map((x) =>
                          x.id === w.id
                            ? { ...x, startTime: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="time"
                    step="60"
                    value={w.endTime}
                    onChange={(e) =>
                      setWindows(
                        windows.map((x) =>
                          x.id === w.id ? { ...x, endTime: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setWindows(windows.filter((x) => x.id !== w.id))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
        {step === 3 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">
              O que ocupa seu tempo
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Há compromissos nesses horários?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Esta parte é opcional. Usamos compromissos para não marcar estudo
              em horários impossíveis.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() =>
                setCommitments([
                  ...commitments,
                  {
                    id: id(),
                    category: "OTHER",
                    dayOfWeek: "MON",
                    startTime: "19:00",
                    endTime: "20:00",
                  },
                ])
              }
            >
              <Plus />
              Adicionar compromisso
            </Button>
            <div className="mt-5 space-y-3">
              {commitments.map((c) => (
                <div
                  key={c.id}
                  className="grid gap-3 rounded-2xl border p-4 md:grid-cols-4"
                >
                  <Input
                    value={c.category}
                    aria-label="Categoria"
                    onChange={(e) =>
                      setCommitments(
                        commitments.map((x) =>
                          x.id === c.id
                            ? { ...x, category: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="time"
                    step="60"
                    value={c.startTime}
                    onChange={(e) =>
                      setCommitments(
                        commitments.map((x) =>
                          x.id === c.id
                            ? { ...x, startTime: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="time"
                    step="60"
                    value={c.endTime}
                    onChange={(e) =>
                      setCommitments(
                        commitments.map((x) =>
                          x.id === c.id ? { ...x, endTime: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setCommitments(commitments.filter((x) => x.id !== c.id))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
        {step === 4 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">
              Sua capacidade inicial
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Uma rotina possível para começar
            </h2>
            <p className="mt-2 text-muted-foreground">
              Calculamos com base nos horários que você informou.
            </p>
            {preview && (
              <div className="mt-7 grid gap-3 md:grid-cols-3">
                <Card className="p-5">
                  <span className="text-sm text-muted-foreground">
                    Tempo disponível por semana
                  </span>
                  <strong className="mt-2 block text-3xl">{total}h</strong>
                </Card>
                <Card className="p-5">
                  <span className="text-sm text-muted-foreground">
                    Blocos estimados
                  </span>
                  <strong className="mt-2 block text-3xl">{blocks}</strong>
                </Card>
                <Card className="p-5">
                  <span className="text-sm text-muted-foreground">
                    Melhor período
                  </span>
                  <strong className="mt-2 block text-3xl">
                    {
                      (
                        {
                          MORNING: "Manhã",
                          AFTERNOON: "Tarde",
                          EVENING: "Noite",
                          NIGHT: "Madrugada",
                        } as any
                      )[routine.peakEnergyPeriod]
                    }
                  </strong>
                </Card>
              </div>
            )}
            <p className="mt-7 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
              Você poderá editar horários e preferências quando precisar. O
              importante é começar com algo possível.
            </p>
          </section>
        )}
      </Card>
    </main>
  );
}
