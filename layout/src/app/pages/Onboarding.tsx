import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  FileText,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

type UserProfileResponse = {
  name?: string | null;
  email: string;
  profile: {
    studyLevel?: string | null;
    dailyStudyHours?: number | null;
    fatigueLevel?: string | null;
    peakEnergyTime?: string | null;
    works: boolean;
  };
  onboarding: {
    activeContest: {
      id: string;
      name: string;
      targetJob: string;
      board: string;
    } | null;
  };
};

type CatalogContest = {
  id: string;
  name: string;
  board: string;
  targetJob: string;
  examDate: string;
  description: string;
  subjects: Array<{ name: string }>;
};

type SetupMode = "catalog" | "manual";

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<CatalogContest[]>([]);
  const [mode, setMode] = useState<SetupMode>("catalog");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [studyLevel, setStudyLevel] = useState("INTERMEDIARIO");
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [fatigueLevel, setFatigueLevel] = useState("MEDIO");
  const [peakEnergyTime, setPeakEnergyTime] = useState("NOITE");
  const [works, setWorks] = useState(false);
  const [contestName, setContestName] = useState("");
  const [board, setBoard] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [examDate, setExamDate] = useState("");
  const [editalText, setEditalText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profile, catalogItems] = await Promise.all([
          apiFetch<UserProfileResponse>("/users/me/profile"),
          apiFetch<CatalogContest[]>("/contests/catalog"),
        ]);

        if (cancelled) return;

        setCatalog(catalogItems);
        setStudyLevel(profile.profile.studyLevel || "INTERMEDIARIO");
        setDailyStudyHours(profile.profile.dailyStudyHours || 2);
        setFatigueLevel(profile.profile.fatigueLevel || "MEDIO");
        setPeakEnergyTime(profile.profile.peakEnergyTime || "NOITE");
        setWorks(Boolean(profile.profile.works));

        if (profile.onboarding.activeContest) {
          setContestName(profile.onboarding.activeContest.name || "");
          setBoard(profile.onboarding.activeContest.board || "");
          setTargetJob(profile.onboarding.activeContest.targetJob || "");
        }

        if (catalogItems[0]) {
          setSelectedTemplateId(catalogItems[0].id);
          setContestName(catalogItems[0].name);
          setBoard(catalogItems[0].board);
          setTargetJob(catalogItems[0].targetJob);
          setExamDate(catalogItems[0].examDate);
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Nao foi possivel carregar o onboarding.");
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

  const selectedTemplate = useMemo(
    () => catalog.find((item) => item.id === selectedTemplateId) || null,
    [catalog, selectedTemplateId]
  );

  useEffect(() => {
    if (mode === "catalog" && selectedTemplate) {
      setContestName(selectedTemplate.name);
      setBoard(selectedTemplate.board);
      setExamDate(selectedTemplate.examDate);
      if (!targetJob) {
        setTargetJob(selectedTemplate.targetJob);
      }
    }
  }, [mode, selectedTemplate, targetJob]);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError("");

      await apiFetch("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          studyLevel,
          dailyStudyHours,
          fatigueLevel,
          peakEnergyTime,
          works,
        }),
      });

      await apiFetch("/contests", {
        method: "POST",
        body: JSON.stringify(
          mode === "catalog"
            ? {
                templateId: selectedTemplateId,
                name: contestName || selectedTemplate?.name,
                board: board || selectedTemplate?.board,
                examDate: examDate || selectedTemplate?.examDate,
                targetJob,
              }
            : {
                name: contestName,
                board,
                examDate: examDate || undefined,
                targetJob,
                editalText,
              }
        ),
      });

      await apiFetch("/planning/schedule", {
        method: "POST",
        body: JSON.stringify({
          profile: {
            dailyStudyHours,
            peakEnergyTime,
            fatigueLevel,
            works,
          },
        }),
      });

      navigate("/schedule");
    } catch (err: any) {
      setError(err?.message || "Nao foi possivel concluir o onboarding.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue =
    targetJob.trim().length > 0 &&
    (mode === "catalog" ? selectedTemplateId.length > 0 : contestName.trim().length > 0);

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando onboarding...</div>;
  }

  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="mb-0.5">Vamos montar seu sistema de estudo</h1>
                <p className="text-sm text-muted-foreground">
                  O Cortex nao quer ser apenas um organizador. A meta aqui e descobrir como voce aprende melhor.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                Login Google pronto
              </Badge>
              <Badge variant="secondary">Assinatura futura</Badge>
              <Badge variant="secondary">Engine adaptativa ativa</Badge>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="mb-0">1. Pesquisa de rotina</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nivel atual</Label>
                <Select value={studyLevel} onValueChange={setStudyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INICIANTE">Iniciante</SelectItem>
                    <SelectItem value="INTERMEDIARIO">Intermediario</SelectItem>
                    <SelectItem value="AVANCADO">Avancado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyStudyHours">Horas de estudo por dia</Label>
                <Input
                  id="dailyStudyHours"
                  type="number"
                  min={1}
                  max={8}
                  value={dailyStudyHours}
                  onChange={(event) => setDailyStudyHours(Number(event.target.value || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pico de energia</Label>
                <Select value={peakEnergyTime} onValueChange={setPeakEnergyTime}>
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
                <Label>Fadiga media</Label>
                <Select value={fatigueLevel} onValueChange={setFatigueLevel}>
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
              <div className="space-y-2 md:col-span-2">
                <Label>Voce trabalha atualmente?</Label>
                <div className="h-11 rounded-xl border border-border px-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {works ? "Sim, preciso de uma rotina mais enxuta" : "Nao, tenho mais flexibilidade"}
                  </span>
                  <Switch checked={works} onCheckedChange={setWorks} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="mb-0">2. Edital e cargo pretendido</h3>
            </div>

            <div className="flex gap-2 mb-5">
              <Button
                variant={mode === "catalog" ? "default" : "outline"}
                onClick={() => setMode("catalog")}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar na lista
              </Button>
              <Button
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Colar edital
              </Button>
            </div>

            {mode === "catalog" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {catalog.map((item) => {
                  const active = item.id === selectedTemplateId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedTemplateId(item.id);
                        setContestName(item.name);
                        setBoard(item.board);
                        setExamDate(item.examDate);
                        if (!targetJob) {
                          setTargetJob(item.targetJob);
                        }
                      }}
                      className={`text-left rounded-3xl border p-4 transition-all ${
                        active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.board} · {item.targetJob}
                          </p>
                        </div>
                        <Badge variant="secondary">{item.subjects.length} materias</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <p className="text-xs text-muted-foreground">Prova alvo: {item.examDate}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 mb-5">
                <div className="space-y-2">
                  <Label htmlFor="contestName">Nome do edital/concurso</Label>
                  <Input
                    id="contestName"
                    value={contestName}
                    onChange={(event) => setContestName(event.target.value)}
                    placeholder="Ex.: TJSP 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editalText">Texto do edital</Label>
                  <Textarea
                    id="editalText"
                    value={editalText}
                    onChange={(event) => setEditalText(event.target.value)}
                    placeholder="Cole aqui o texto principal do edital para a IA estruturar materias e topicos."
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetJob">Cargo pretendido</Label>
                <Input
                  id="targetJob"
                  value={targetJob}
                  onChange={(event) => setTargetJob(event.target.value)}
                  placeholder="Ex.: Escrevente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Banca</Label>
                <Input
                  id="board"
                  value={board}
                  onChange={(event) => setBoard(event.target.value)}
                  placeholder="Ex.: Cebraspe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examDate">Data prevista</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(event) => setExamDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <BriefcaseBusiness className="w-4 h-4 text-primary" />
              <h3 className="mb-0">3. Criar plano inicial</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao concluir, o Cortex salva sua rotina, cria seu edital/cargo, estrutura o mapa inicial
              de materias e prepara um cronograma adaptativo para voce comecar a estudar.
            </p>
            <Separator className="my-5" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit} disabled={!canContinue || submitting} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {submitting ? "Montando seu plano..." : "Concluir onboarding"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/schedule")}>
                Ir para o cronograma
              </Button>
            </div>
            {error ? <p className="text-sm text-destructive mt-4">{error}</p> : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Conta ativa
            </p>
            <h3 className="mb-1">{user?.name || user?.email || "Usuario Cortex"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Separator className="my-5" />
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>1. Cadastro/login com Google concluido</p>
              <p>2. Rotina vai calibrar sua carga diaria</p>
              <p>3. Edital + cargo viram o eixo do plano</p>
              <p>4. A engine passa a observar como voce aprende</p>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Visao do produto
            </p>
            <h3 className="mb-2">Nao e so organizacao</h3>
            <p className="text-sm text-muted-foreground">
              A plataforma deve aprender com sua rotina, desempenho, anotacoes e revisoes para ajustar
              como voce estuda, memoriza e retoma o conteudo.
            </p>
            <Separator className="my-5" />
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-muted/50 px-4 py-3">
                <p className="font-medium mb-1">Anotacoes inteligentes</p>
                <p className="text-muted-foreground">
                  Proxima etapa: um bloco de notas forte, conectado a edital, materia e cronograma.
                </p>
              </div>
              <div className="rounded-2xl bg-muted/50 px-4 py-3">
                <p className="font-medium mb-1">Aprendizagem individual</p>
                <p className="text-muted-foreground">
                  O objetivo central do Cortex e descobrir quais blocos, horarios e revisoes funcionam melhor para voce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
