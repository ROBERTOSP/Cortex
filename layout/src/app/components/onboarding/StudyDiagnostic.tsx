import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { Button } from "../ui/button";

type DiagnosticQuestion = {
  id: string;
  subject: string | null;
  topic: string | null;
  statement: string;
  alternatives: Array<{ id: string; text: string }>;
};

type DiagnosticSummary = {
  answered: number;
  correct: number;
  averageLatencyMs: number;
};

const storageKey = "cortex-onboarding-study-diagnostic";

export function StudyDiagnostic() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [switches, setSwitches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Array<{ correct: boolean; latencyMs: number }>>([]);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const current = questions[position];
  const progress = questions.length ? ((position + 1) / questions.length) * 100 : 0;
  const subjects = useMemo(
    () => [...new Set(questions.map((question) => question.subject).filter(Boolean))],
    [questions],
  );

  useEffect(() => {
    if (current) setStartedAt(Date.now());
  }, [current?.id]);

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ questions: DiagnosticQuestion[] }>("/questions/diagnostic?limit=8");
      if (!response.questions.length) {
        setError("Ainda não há questões disponíveis para este diagnóstico.");
        return;
      }
      setQuestions(response.questions);
      setPosition(0);
      setResults([]);
      setSelected("");
      setSwitches(0);
      setSummary(null);
    } catch (reason: any) {
      setError(reason.message || "Não foi possível iniciar o diagnóstico agora.");
    } finally {
      setLoading(false);
    }
  };

  const choose = (option: string) => {
    if (selected && selected !== option) setSwitches((value) => value + 1);
    setSelected(option);
  };

  const answer = async () => {
    if (!current || !selected) return;
    setSubmitting(true);
    setError("");
    const latencyMs = Math.max(Date.now() - startedAt, 0);
    try {
      const response = await apiFetch<{ is_correct: boolean }>("/questions/submit", {
        method: "POST",
        body: JSON.stringify({
          question_id: current.id,
          selected_option: selected,
          latency_ms: latencyMs,
          switches_count: switches,
          hesitation_detected: latencyMs > 90000 || switches >= 3,
        }),
      });
      const nextResults = [...results, { correct: response.is_correct, latencyMs }];
      if (position + 1 < questions.length) {
        setResults(nextResults);
        setPosition((value) => value + 1);
        setSelected("");
        setSwitches(0);
      } else {
        const completed: DiagnosticSummary = {
          answered: nextResults.length,
          correct: nextResults.filter((result) => result.correct).length,
          averageLatencyMs: Math.round(
            nextResults.reduce((total, result) => total + result.latencyMs, 0) / nextResults.length,
          ),
        };
        localStorage.setItem(storageKey, JSON.stringify(completed));
        setSummary(completed);
        setQuestions([]);
      }
    } catch (reason: any) {
      setError(reason.message || "Não foi possível registrar sua resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  if (summary) {
    return (
      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold">Ponto de partida registrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Você respondeu {summary.answered} questões. O Cortex usará acertos e tempo de resposta
              para ajustar o início do plano — sem rotular seu conhecimento.
            </p>
            <Button type="button" variant="link" className="mt-2 h-auto p-0" onClick={start}>
              Refazer diagnóstico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h3 className="font-semibold">Descubra seu ponto de partida</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Responda 8 questões rápidas. Não vale nota: observamos apenas familiaridade, acertos e
          ritmo para evitar um plano fácil ou pesado demais.
        </p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={start} disabled={loading}>
            {loading && <LoaderCircle className="animate-spin" />}
            {loading ? "Preparando questões" : "Iniciar diagnóstico"}
          </Button>
          <span className="text-xs text-muted-foreground">Leva cerca de 5 minutos e não usa IA paga.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium">Diagnóstico inicial</span>
        <span className="text-muted-foreground">Questão {position + 1} de {questions.length}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">
        {current.subject || "Conhecimentos gerais"}{current.topic ? ` · ${current.topic}` : ""}
      </p>
      <p className="mt-2 font-medium">{current.statement}</p>
      <div className="mt-4 grid gap-2">
        {current.alternatives.map((alternative) => (
          <button
            key={alternative.id}
            type="button"
            onClick={() => choose(alternative.id)}
            className={`rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selected === alternative.id ? "border-primary bg-primary/10" : "hover:border-primary/60"
            }`}
          >
            <strong className="mr-2">{alternative.id}.</strong>{alternative.text}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {subjects.length ? `${subjects.length} matérias distribuídas neste diagnóstico` : "Seleção equilibrada"}
        </span>
        <Button type="button" onClick={answer} disabled={!selected || submitting}>
          {submitting && <LoaderCircle className="animate-spin" />}
          Confirmar resposta
        </Button>
      </div>
    </div>
  );
}
