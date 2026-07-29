import { useState, useEffect } from "react";
import {
  AlertCircle,
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  StickyNote,
  Target,
  TimerReset,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { apiFetch } from "../lib/api";

type DeepWorkQuestion = {
  id: string;
  subject: string | null;
  topic: string | null;
  statement: string;
  alternatives: { id: string; text: string }[];
};

type SubmitAnswerResponse = {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  correct_answer: string;
};

export function DeepWork() {
  const totalTime = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [question, setQuestion] = useState<DeepWorkQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitResult, setSubmitResult] = useState<SubmitAnswerResponse | null>(
    null
  );
  const [explanationText, setExplanationText] = useState<string>("");
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<DeepWorkQuestion>("/questions/next");
        if (cancelled) return;
        setQuestion(data);
      } catch {
        if (cancelled) return;
        setQuestion(null);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setResponseTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleConfirmAnswer = async () => {
    if (!selectedAnswer || !question) return;

    try {
      const result = await apiFetch<SubmitAnswerResponse>("/questions/submit", {
        method: "POST",
        body: JSON.stringify({
          question_id: question.id,
          selected_option: selectedAnswer,
          latency_ms: responseTime * 1000,
          switches_count: 0,
          hesitation_detected: responseTime > 60,
        }),
      });
      setSubmitResult(result);
      setShowExplanation(true);
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  const handleNextQuestion = async () => {
    setLoading(true);
    setIsRunning(false);
    setTimeLeft(totalTime);
    setResponseTime(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSubmitResult(null);
    setExplanationText("");
    setExplanationError("");
    try {
      const data = await apiFetch<DeepWorkQuestion>("/questions/next");
      setQuestion(data);
    } catch {
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!question || !submitResult) return;
    setShowExplanation(true);
    setExplanationLoading(true);
    setExplanationError("");
    try {
      const res = await apiFetch<{
        question_id: string;
        explanation: string;
        correct_answer: string;
        selected_option: string;
        is_correct: boolean;
      }>(`/questions/${question.id}/explain`);
      setExplanationText(res.explanation || "");
    } catch (e: any) {
      setExplanationText("");
      setExplanationError(e?.message || "Erro ao gerar explicação");
    } finally {
      setExplanationLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getFatigueLevel = () => {
    if (responseTime < 60) return { level: "Ótimo", color: "text-green-600" };
    if (responseTime < 120)
      return { level: "Bom", color: "text-blue-600" };
    if (responseTime < 180)
      return { level: "Regular", color: "text-yellow-600" };
    return { level: "Fadiga", color: "text-red-600" };
  };

  const fatigue = getFatigueLevel();
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando Cerebro Cortex...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="h-screen flex items-center justify-center">
        Nenhuma questao disponivel.
      </div>
    );
  }

  const insertFormat = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = notes.substring(start, end);
    const before = notes.substring(0, start);
    const after = notes.substring(end);

    const newText = before + prefix + selectedText + suffix + after;
    setNotes(newText);

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        );
      }
    }, 0);
  };

  const insertHeading = (level: number) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const lineStart = notes.lastIndexOf("\n", start - 1) + 1;
    const before = notes.substring(0, lineStart);
    const after = notes.substring(lineStart);

    const prefix = "#".repeat(level) + " ";
    const newText = before + prefix + after;
    setNotes(newText);

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          lineStart + prefix.length,
          lineStart + prefix.length
        );
      }
    }, 0);
  };

  const insertListItem = (ordered: boolean = false) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const lineStart = notes.lastIndexOf("\n", start - 1) + 1;
    const before = notes.substring(0, lineStart);
    const after = notes.substring(lineStart);

    const prefix = ordered ? "1. " : "- ";
    const newText = before + prefix + after;
    setNotes(newText);

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          lineStart + prefix.length,
          lineStart + prefix.length
        );
      }
    }, 0);
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="mb-0">Deep Work</h1>
            {isRunning ? (
              <Badge className="bg-muted text-foreground border-0">Ao vivo</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {question.subject || "Sem matéria"} · {question.topic || "Sem tópico"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowNotes((value) => !value)}
          >
            <StickyNote className="w-4 h-4" />
            {showNotes ? "Fechar notas" : "Abrir notas"}
          </Button>
          <Button
            variant={isRunning ? "outline" : "default"}
            size="sm"
            className="gap-2"
            onClick={() => setIsRunning((value) => !value)}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Pausar" : "Iniciar"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(totalTime);
              setResponseTime(0);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Pomodoro
                </p>
                <h3 className="mt-1">Sessao em foco</h3>
              </div>
              <Badge variant="secondary" className="gap-1.5">
                <TimerReset className="w-3.5 h-3.5" />
                25 min
              </Badge>
            </div>

            <div className="relative mx-auto mb-5 flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tabular-nums">
                {formatTime(timeLeft)}
              </div>
            </div>

            <Progress value={progress} className="h-1.5 mb-5" />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-muted/50 px-4 py-3">
                <div className="text-muted-foreground mb-1">Tempo de resposta</div>
                <div className="font-medium">{responseTime}s</div>
              </div>
              <div className="rounded-2xl bg-muted/50 px-4 py-3">
                <div className="text-muted-foreground mb-1">Fadiga</div>
                <div className={`font-medium ${fatigue.color}`}>{fatigue.level}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="mb-0">Objetivo da sessao</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Resolver a questao atual com foco total, registrar duvidas e revisar a
              explicacao antes de avancar para a proxima.
            </p>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Categoria</span>
              <Badge variant="secondary" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Questoes
              </Badge>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Badge variant="secondary">
                {question.subject || "Sem matéria"}
              </Badge>
              <Badge variant="secondary">{question.topic || "Sem tópico"}</Badge>
            </div>

            <div
              className="mb-8 leading-relaxed text-lg"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <p>{question.statement}</p>
            </div>

            <div className="space-y-3">
              {question.alternatives.map((alt: { id: string; text: string }) => (
                <button
                  key={alt.id}
                  onClick={() => setSelectedAnswer(alt.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedAnswer === alt.id
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-muted/50"
                  }`}
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <div className="flex gap-3">
                    <span className="font-medium shrink-0">{alt.id})</span>
                    <span>{alt.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExplain}
                disabled={!submitResult}
              >
                <Sparkles className="w-4 h-4" />
                Cortex Explain
              </Button>
              <Button onClick={handleConfirmAnswer} disabled={!selectedAnswer}>
                Confirmar resposta
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNextQuestion}>
                Proxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {showNotes ? (
            <div className="bg-card rounded-3xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-4 h-4 text-primary" />
                <h3 className="mb-0">Notas rapidas</h3>
              </div>
              <div className="flex flex-wrap items-center gap-1 mb-3 pb-3 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertFormat("**")}
                  className="h-8 w-8"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertFormat("*")}
                  className="h-8 w-8"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertFormat("`")}
                  className="h-8 w-8"
                >
                  <Code className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertHeading(1)}
                  className="h-8 w-8"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertHeading(2)}
                  className="h-8 w-8"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertListItem()}
                  className="h-8 w-8"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertListItem(true)}
                  className="h-8 w-8"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Registre pontos importantes, duvidas e armadilhas da questao..."
                className="min-h-44 resize-none rounded-2xl"
                ref={setTextareaRef}
              />
              <p className="text-xs text-muted-foreground mt-3">
                As anotacoes continuam sendo mantidas localmente durante a sessao.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-3xl border border-border p-5">
              <div className="flex flex-col items-center text-center py-4">
                <AlertCircle className="w-9 h-9 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Abra as notas para registrar insights e revisoes rapidas da questao.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Cortex Explain
            </DialogTitle>
            <DialogDescription>
              Explicação detalhada da questão com gabarito e análise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Gabarito</h4>
              <p className="text-sm">
                A alternativa correta é:{" "}
                <span className="font-medium">
                  {submitResult?.correct_answer ?? "-"}
                </span>
              </p>
              {submitResult ? (
                <p className="text-sm mt-2">
                  Seu resultado:{" "}
                  <span className="font-medium">
                    {submitResult.is_correct ? "Correto" : "Incorreto"}
                  </span>
                </p>
              ) : null}
            </div>
            <div>
              <h4 className="font-medium mb-2">Explicação</h4>
              {explanationLoading ? (
                <div className="text-sm text-muted-foreground">Gerando explicação...</div>
              ) : explanationError ? (
                <div className="text-sm text-muted-foreground">{explanationError}</div>
              ) : explanationText ? (
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                  {explanationText}
                </pre>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Clique em Cortex Explain para gerar a explicação.
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-border">
              <Button onClick={() => setShowExplanation(false)} className="w-full">
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
