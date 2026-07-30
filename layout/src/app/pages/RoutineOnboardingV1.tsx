import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogOut,
  Moon,
  Plus,
  Sun,
  Type,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

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
  title: string;
  board?: string | null;
  examDate?: string | null;
  extraction?: {
    summary?: string;
    generalEligibilityRequirements?: string[];
    notices?: string[];
    jobs?: Array<{
      name: string;
      baseJob?: string;
      profileName?: string;
      requirements?: string[];
      taskSummary?: string;
      tasks?: string[];
      vacancies?: string | null;
      quotas?: string[];
      pcd?: string[];
      notes?: string[];
      subjects?: Array<{ name: string; topics?: Array<{ name: string; subtopics?: string[] }> }>;
    }>;
  };
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
const editalProcessingSteps = ["Lendo o arquivo do edital", "Localizando datas, banca e regras", "Identificando cargos e requisitos", "Organizando matérias por cargo", "Preparando a revisão para você"];
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
      className={`rounded-2xl border p-4 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10 text-foreground shadow-sm" : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"}`}
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

function InfoBlock({ title, values }: { title: string; values?: string[] | null }) {
  if (!values?.length) return null;
  return <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p><ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{values.map((value) => <li key={value} className="flex gap-2"><span className="text-primary">•</span><span>{value}</span></li>)}</ul></div>;
}

function InfoPanel({ title, values }: { title: string; values?: string[] | null }) {
  if (!values?.length) return null;
  return <div className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{values.map((value) => <li key={value} className="flex gap-2"><span className="text-primary">•</span><span>{value}</span></li>)}</ul></div>;
}

export function RoutineOnboardingV1() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
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
  const [editalMode, setEditalMode] = useState<"catalog">("catalog");
  const [catalogId, setCatalogId] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [candidateProfile, setCandidateProfile] = useState<{ selfDeclaredColor?: string | null; hasDisability?: boolean | null }>({});
  const [participationMode, setParticipationMode] = useState("");
  const [considerPcdRules, setConsiderPcdRules] = useState("");
  const [contestCreated, setContestCreated] = useState(false);
  const [draftContestId, setDraftContestId] = useState<string | null>(null);
  const [editalReview, setEditalReview] = useState<any>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "sending" | "analyzing">("idle");
  const [largeText, setLargeText] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const onboardingDraftKey = "cortex-onboarding-v1-draft";
  useEffect(() => {
    const saved = localStorage.getItem("cortex-large-text") === "true";
    setLargeText(saved);
    document.documentElement.style.setProperty("--font-size", saved ? "18px" : "16px");
  }, []);
  const toggleLargeText = () => {
    const next = !largeText;
    setLargeText(next);
    localStorage.setItem("cortex-large-text", String(next));
    document.documentElement.style.setProperty("--font-size", next ? "18px" : "16px");
  };
  useEffect(() => {
    if (!saving || step !== 0) { setProcessingStep(0); return; }
    const interval = window.setInterval(() => setProcessingStep((current) => Math.min(current + 1, editalProcessingSteps.length - 1)), 1800);
    return () => window.clearInterval(interval);
  }, [saving, step, editalMode]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [s, contests] = await Promise.all([
          apiFetch<any>("/routine/me/state"),
          apiFetch<any[]>("/contests").catch(() => []),
        ]);
        if (cancel) return;
        let saved: any = null;
        try { saved = JSON.parse(localStorage.getItem(onboardingDraftKey) || "null"); } catch {}
        if (s.studyGoal)
          setGoal((x: any) => ({
            ...x,
            ...s.studyGoal,
            examDate: s.studyGoal.examDate?.slice(0, 10) || "",
            ...(saved?.goal || {}),
          }));
        else if (saved?.goal) setGoal((x: any) => ({ ...x, ...saved.goal }));
        if (s.routine)
          setRoutine((x: any) => ({
            ...x,
            ...s.routine,
            timezone: s.routine.timezone || x.timezone,
            ...(saved?.routine || {}),
          }));
        else if (saved?.routine) setRoutine((x: any) => ({ ...x, ...saved.routine }));
        setWindows(
          saved?.windows?.length ? saved.windows : (s.availabilityWindows || []).map((w: any) => ({
            id: w.id,
            dayOfWeek: w.dayOfWeek,
            startTime: fmt(w.startMinute),
            endTime: fmt(w.endMinute),
          })),
        );
        setCommitments(
          saved?.commitments?.length ? saved.commitments : (s.commitments || []).map((c: any) => ({
            id: c.id,
            category: c.category,
            dayOfWeek: c.dayOfWeek,
            startTime: fmt(c.startMinute),
            endTime: fmt(c.endMinute),
          })),
        );
        if (saved?.catalogId) setCatalogId(saved.catalogId);
        if (saved?.participationMode) setParticipationMode(saved.participationMode);
        if (saved?.considerPcdRules) setConsiderPcdRules(saved.considerPcdRules);
        const draft = contests.find((contest) => contest.status === "DRAFT");
        if (draft) {
          setDraftContestId(draft.id);
          setEditalReview(draft);
          setContestCreated(true);
          setStep(0);
        } else if (Number.isInteger(saved?.step)) {
          setStep(Math.min(4, Math.max(0, saved.step)));
        }
      } catch (e: any) {
        setError(e.message || "Não foi possível carregar suas respostas.");
      } finally {
        if (!cancel) { setHydrated(true); setLoading(false); }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(onboardingDraftKey, JSON.stringify({
        step, goal, routine, windows, commitments, editalMode, catalogId, participationMode, considerPcdRules,
      }));
    } catch {}
  }, [hydrated, step, goal, routine, windows, commitments, editalMode, catalogId, participationMode, considerPcdRules]);
  useEffect(() => {
    apiFetch<CatalogContest[]>("/contests/published-catalog")
      .then(setCatalog)
      .catch(() => setCatalog([]));
    apiFetch<any>("/users/me/profile")
      .then((response) => setCandidateProfile(response.profile || {}))
      .catch(() => setCandidateProfile({}));
  }, []);
  const saveGoal = () =>
    apiFetch("/routine/me/goal", {
      method: "PUT",
      body: JSON.stringify({
        ...goal,
        title: goal.title || editalReview?.name || "Meu concurso",
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
    if (contestCreated) return;
    const meta = {
      name: goal.title,
      targetJob: goal.targetJob || goal.title,
      board: goal.board || undefined,
      examDate: goal.examDate || undefined,
      participationMode,
      highlightPcdRules: considerPcdRules === "YES",
    };
    let contest: any;
    if (!catalogId) throw new Error("Escolha o edital do seu concurso.");
    contest = await apiFetch("/contests", {
      method: "POST",
      body: JSON.stringify({ ...meta, templateId: catalogId }),
    });
    if (contest?.status === "DRAFT") { setDraftContestId(contest.id); setEditalReview(contest); }
    setContestCreated(true);
    return contest;
  };
  const confirmSelectedProfile = async () => {
    if (!goal.targetJob) return;
    if (!draftContestId) { setStep(1); return; }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/contests/${draftContestId}/confirm-edital`, {
        method: "POST",
        body: JSON.stringify({ selectedJob: goal.targetJob, targetJob: goal.targetJob, participationMode, highlightPcdRules: considerPcdRules === "YES" }),
      });
      await saveGoal();
      setDraftContestId(null);
      setStep(1);
    } catch (e: any) {
      setError(e.message || "Não foi possível confirmar este perfil.");
    } finally {
      setSaving(false);
    }
  };
  const reanalyzeCurrentEdital = async () => {
    if (!draftContestId) return;
    setSaving(true);
    setError("");
    try {
      const contest = await apiFetch<any>(`/contests/${draftContestId}/reanalyze-edital`, { method: "POST" });
      setEditalReview(contest);
      setContestCreated(true);
      setGoal((current) => ({ ...current, targetJob: "" }));
    } catch (e: any) {
      setError(e.message || "Não foi possível reanalisar este edital.");
    } finally {
      setSaving(false);
    }
  };
  const replaceCurrentEdital = async () => {
    if (!draftContestId) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/contests/${draftContestId}/discard-edital`, { method: "POST" });
      setDraftContestId(null);
      setEditalReview(null);
      setContestCreated(false);
      setGoal((current) => ({ ...current, targetJob: "", title: "", board: "", examDate: "", examDateUnknown: true }));
      setCatalogId("");
      setError("Escolha outro edital do catálogo.");
    } catch (e: any) {
      setError(e.message || "Não foi possível substituir este edital.");
    } finally {
      setSaving(false);
    }
  };
  const advance = async () => {
    setError("");
    if (step === 0 && !catalogId && !editalReview) {
      setError("Escolha o edital do seu concurso para continuar.");
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
        if (!contest) throw new Error("Não foi possível abrir o edital selecionado.");
        if (contest?.status === "DRAFT") return;
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
        navigate("/app/schedule");
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
  const selectedEditalJob = (editalReview?.editalDraft?.jobs || []).find((job: any) => job.name === goal.targetJob) as any;
  const selectedSubjectCount = selectedEditalJob?.subjects?.length || 0;
  const selectedTopicCount = (selectedEditalJob?.subjects || []).reduce((total: number, subject: any) => total + (subject.topics?.length || 0), 0);
  const boards = [...new Set(catalog.map((item) => item.board).filter(Boolean))] as string[];
  const filteredCatalog = catalog.filter((item) => {
    const query = catalogSearch.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !query || `${item.title} ${item.board || ""}`.toLocaleLowerCase("pt-BR").includes(query);
    return matchesSearch && (!boardFilter || item.board === boardFilter);
  });
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-12">
      <header className="mb-8 flex w-full items-start justify-between gap-5">
        <div>
        {step === 0 ? <><p className="text-sm font-medium text-primary">Etapa 1 · Análise do edital</p><h1 className="mt-2 text-3xl font-semibold">Vamos entender seu concurso</h1><p className="mt-2 text-muted-foreground">Envie o edital. O Cortex identifica cargos, datas, regras da prova e conteúdo programático para montar seu plano.</p></> : <><p className="flex items-center gap-2 text-sm font-medium text-primary"><Clock3 className="size-4" />Leva cerca de 3 minutos</p><h1 className="mt-2 text-3xl font-semibold">Vamos conhecer sua rotina</h1><p className="mt-2 text-muted-foreground">Poucas respostas agora ajudam a criar um plano que caiba na sua vida.</p></>}
        </div>
        <div className="flex shrink-0 items-center gap-2" aria-label="Preferências de acessibilidade">
          {user?.role === "ADMIN" && <Button type="button" variant="outline" size="sm" onClick={() => navigate("/app/admin/editais")}>Painel Admin</Button>}
          <Button type="button" variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}><LogOut /> <span className="hidden sm:inline">Sair</span></Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Alternar modo claro e escuro" title="Alternar modo claro e escuro">{theme === "dark" ? <Sun /> : <Moon />}</Button>
          <Button type="button" variant="outline" size="sm" onClick={toggleLargeText} aria-pressed={largeText} aria-label="Alternar texto ampliado" title="Ampliar tamanho do texto"><Type /> <span className="hidden sm:inline">Texto</span></Button>
        </div>
      </header>
      <div className="w-full">
        <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3 border-b pb-5">
          <Button
            variant="outline"
            onClick={() => step === 0 ? navigate("/") : setStep(step - 1)}
            disabled={saving}
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
            {saving && step === 0 ? "Analisando edital…" : step === 0 && editalMode !== "none" ? "Analisar edital" : step === 4 ? "Criar minha rotina" : "Avançar"}
            <ChevronRight />
          </Button>
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {saving && step === 0 && editalMode !== "none" && (
          <>
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-3"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span><strong className="block text-foreground">{uploadPhase === "sending" ? "Enviando o arquivo ao Cortex" : "Analisando seu edital"}</strong><span className="text-sm text-muted-foreground">{uploadPhase === "sending" ? "O PDF foi selecionado e está sendo enviado." : "Você não precisa fazer nada agora."}</span></span></div>
            <ol className="mt-5 space-y-3">{editalProcessingSteps.map((label, index) => <li key={label} className={`flex items-center gap-3 text-sm transition-opacity ${index <= processingStep ? "text-foreground" : "text-muted-foreground/50"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${index < processingStep ? "bg-primary text-primary-foreground" : index === processingStep ? "border-2 border-primary text-primary" : "border bg-background"}`}>{index < processingStep ? "✓" : index === processingStep ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : index + 1}</span><span>{label}{index === processingStep ? <span className="ml-2 animate-pulse text-primary">em andamento…</span> : null}</span></li>)}</ol>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span><strong className="block text-foreground">Estamos analisando seu edital</strong>Extraindo cargos, requisitos, datas e matérias. Isso pode levar alguns instantes.</span>
          </div>
          </>
        )}
        {step === 0 && editalReview ? (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">Seu edital foi analisado</p>
            <h2 className="mt-1 text-3xl font-semibold">{editalReview.name}</h2>
            {(editalReview.editalDraft?.board || editalReview.board) ? <p className="mt-3 text-sm text-muted-foreground">Banca identificada: <strong className="text-foreground">{editalReview.editalDraft?.board || editalReview.board}</strong></p> : null}
            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,.8fr)]">
              <div>
                <div className="flex items-baseline justify-between gap-3"><h3 className="font-semibold">Cargos identificados</h3><span className="text-sm text-muted-foreground">Escolha o cargo pretendido</span></div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {(editalReview.editalDraft?.jobs || []).map((job: any) => (
                    <button key={job.name} type="button" onClick={() => setGoal({ ...goal, targetJob: job.name })} className={`rounded-xl border p-3 text-left transition-colors ${goal.targetJob === job.name ? "border-primary bg-primary/10" : "bg-background hover:border-primary/50"}`}>
                      <strong className="line-clamp-2 text-sm leading-5">{job.profileName || job.name}</strong>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground"><strong className="font-semibold text-foreground">Requisitos: </strong>{job.requirements?.join(" · ") || "Não identificado no edital."}</span>
                      <span className="mt-2 block text-xs font-medium text-primary">{job.subjects?.length || 0} matérias · {(job.subjects || []).reduce((total: number, subject: any) => total + (subject.topics?.length || 0), 0)} tópicos</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold">Informações do perfil</h3>
                {selectedEditalJob ? <>
                  <p className="mt-1 text-sm font-medium text-primary">{selectedEditalJob.baseJob || selectedEditalJob.name}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{selectedEditalJob.taskSummary || "Confira as informações encontradas para este cargo."}</p>
                  <p className="mt-3 text-sm font-medium text-primary">{selectedSubjectCount} matérias · {selectedTopicCount} tópicos identificados</p>
                  <InfoBlock title="Requisitos" values={selectedEditalJob.requirements} />
                  {selectedEditalJob.vacancies && <InfoBlock title="Vagas e localidades" values={[selectedEditalJob.vacancies]} />}
                  <InfoBlock title="Reserva de vagas" values={selectedEditalJob.quotas} />
                  <InfoBlock title="Pessoas com deficiência" values={selectedEditalJob.pcd} />
                  <InfoBlock title="Observações do cargo" values={selectedEditalJob.notes} />
                  <InfoBlock title="Atribuições" values={selectedEditalJob.tasks} />
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matérias, tópicos e subtópicos</p>
                    <div className="mt-2 grid gap-2">
                      {(selectedEditalJob.subjects || []).map((subject: any) => (
                        <details key={subject.name} className="rounded-lg border bg-background px-3 py-2">
                          <summary className="cursor-pointer text-sm font-medium">{subject.name}</summary>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {(subject.topics || []).map((topic: any) => <li key={topic.name}><strong className="text-foreground">{topic.name}</strong>{topic.subtopics?.length ? <span className="mt-1 block text-xs">{topic.subtopics.join(" · ")}</span> : null}</li>)}
                          </ul>
                        </details>
                      ))}
                    </div>
                  </div>
                </> : <p className="mt-2 text-sm text-muted-foreground">Escolha um perfil para ver requisitos, vagas, modalidades e matérias.</p>}
              </div>
            </div>
            {selectedEditalJob && <section className="mt-7 rounded-2xl border bg-card p-5">
              <p className="text-sm font-semibold text-primary">Como você pretende participar?</p>
              <h3 className="mt-1 text-lg font-semibold">Escolha como deseja considerar as modalidades previstas no edital</h3>
              <p className="mt-2 text-sm text-muted-foreground">O Cortex não define sua identidade nem sua elegibilidade. Mostramos as regras encontradas e você escolhe como pretende se inscrever; a confirmação oficial acontece no sistema da organizadora.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Choice selected={participationMode === "GENERAL"} onClick={() => setParticipationMode("GENERAL")} title="Ampla concorrência" detail="Montar o plano sem considerar uma modalidade de reserva de vagas." />
                <Choice selected={participationMode === "RESERVED"} onClick={() => setParticipationMode("RESERVED")} title="Quero avaliar reserva de vagas" detail="Destacar regras, documentos e prazos aplicáveis encontrados no edital." />
                <Choice selected={participationMode === "UNDECIDED"} onClick={() => setParticipationMode("UNDECIDED")} title="Ainda não decidi" detail="Manter as opções visíveis para você revisar mais tarde." />
              </div>
              {candidateProfile.hasDisability && selectedEditalJob.pcd?.length ? <div className="mt-5"><p className="text-sm font-medium">Você informou possuir deficiência. Deseja que o Cortex destaque as regras e os prazos de atendimento previstos neste edital?</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant={considerPcdRules === "YES" ? "default" : "outline"} onClick={() => setConsiderPcdRules("YES")}>Sim, destacar</Button><Button type="button" variant={considerPcdRules === "NO" ? "default" : "outline"} onClick={() => setConsiderPcdRules("NO")}>Não agora</Button></div></div> : null}
            </section>}
            {(editalReview.editalDraft?.generalEligibilityRequirements?.length || editalReview.editalDraft?.notices?.length) ? <section className="mt-7 grid gap-4 md:grid-cols-2"><InfoPanel title="Requisitos gerais" values={editalReview.editalDraft.generalEligibilityRequirements} /><InfoPanel title="Avisos importantes" values={editalReview.editalDraft.notices} /></section> : null}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><Button type="button" variant="ghost" onClick={replaceCurrentEdital} disabled={saving}>Escolher outro edital</Button><Button onClick={confirmSelectedProfile} disabled={!goal.targetJob || !participationMode || saving}>{saving ? "Salvando perfil…" : "Confirmar cargo e continuar"} <ChevronRight /></Button></div>
          </section>
        ) : step === 0 && (
          <section className="py-7">
            <p className="text-sm font-semibold text-primary">Conheça seu edital</p>
            <h2 className="mt-1 text-2xl font-semibold">
              Vamos começar pelo seu edital
            </h2>
            <p className="mt-2 text-muted-foreground">
              Pesquise um edital já revisado pela equipe Cortex. Depois, escolha o cargo para receber somente as informações relevantes ao seu objetivo.
            </p>
            <div className="mt-7 w-full space-y-4">
                <div>
                  <Label>Escolha o edital do seu concurso</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cada edital foi analisado e revisado uma única vez pela equipe Cortex. Ao selecionar, você confere cargos, requisitos, banca e matérias sem gastar uma nova análise.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_260px]">
                    <Input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Pesquisar por concurso, órgão ou banca" aria-label="Pesquisar editais" />
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={boardFilter} onChange={(event) => setBoardFilter(event.target.value)} aria-label="Filtrar por banca"><option value="">Todas as bancas</option>{boards.map((board) => <option key={board} value={board}>{board}</option>)}</select>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCatalog.map((item) => (
                      <Choice
                        key={item.id}
                        selected={catalogId === item.id}
                        onClick={() => setCatalogId(item.id)}
                        title={item.title}
                        detail={`${item.board || "Banca a confirmar"} · ${item.extraction?.jobs?.length || 0} cargos`}
                      />
                    ))}
                  </div>
                  {catalog.length > 0 && filteredCatalog.length === 0 && <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nenhum edital corresponde aos filtros informados.</div>}
                  {!catalog.length && <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nenhum edital está publicado no momento. A equipe Cortex precisa publicar o edital pelo painel administrativo.</div>}
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
      </div>
    </main>
  );
}
