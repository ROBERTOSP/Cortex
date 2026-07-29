import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { apiFetch } from "../lib/api";

type Topic = { name: string; subtopics: string[] };
type Subject = { name: string; topics: Topic[] };
type Job = {
  name: string;
  requirements: string[];
  vacancies: string | null;
  quotas: string[];
  pcd: string[];
  notes: string[];
  subjects: Subject[];
};
type Review = {
  id: string;
  name: string;
  targetJob: string;
  board: string;
  examDate?: string;
  editalDraft?: { summary?: string; board?: string | null; examDate?: string | null; notices?: string[]; jobs?: Job[]; subjects?: Subject[] };
};

export function EditalReview() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [selectedJobName, setSelectedJobName] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const jobs = review?.editalDraft?.jobs || [];
  const selectedJob = useMemo(() => jobs.find((job) => job.name === selectedJobName), [jobs, selectedJobName]);

  useEffect(() => {
    if (!contestId) return;
    apiFetch<Review>(`/contests/${contestId}/edital-review`)
      .then((data) => {
        setReview(data);
        const initialJob = data.editalDraft?.jobs?.find((job) => job.name === data.targetJob) || data.editalDraft?.jobs?.[0];
        setSelectedJobName(initialJob?.name || data.targetJob || "");
        setSubjects(initialJob?.subjects || data.editalDraft?.subjects || []);
      })
      .catch((requestError) => setError(requestError.message || "Não foi possível abrir a revisão."));
  }, [contestId]);

  const chooseJob = (name: string) => {
    setSelectedJobName(name);
    setSubjects(jobs.find((job) => job.name === name)?.subjects || []);
  };

  const confirm = async () => {
    if (!contestId) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/contests/${contestId}/confirm-edital`, {
        method: "POST",
        body: JSON.stringify({ targetJob: selectedJobName, selectedJob: selectedJobName, subjects }),
      });
      navigate("/app/schedule");
    } catch (requestError: any) {
      setError(requestError.message || "Não foi possível confirmar o edital.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !review) return <main className="w-full p-8 text-destructive">{error}</main>;
  if (!review) return <main className="w-full p-8 text-muted-foreground">Lendo seu edital…</main>;

  return (
    <main className="onboarding-light min-h-screen w-full px-6 py-10 md:px-12">
      <header className="mb-6">
        <p className="text-sm font-semibold text-primary">Seu edital foi lido</p>
        <h1 className="mt-1 text-3xl font-semibold">Confira o que encontramos antes de montar seu plano</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Escolha o cargo. A partir dele, o Cortex usa apenas as matérias e regras que fazem sentido para o seu estudo.
        </p>
      </header>
      <div className="space-y-8">
        <div className="border-b pb-6">
          <p className="text-sm font-semibold text-primary">Etapa 1 de 5 · Seu edital</p>
          <h2 className="mt-2 text-3xl font-semibold">{review.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {review.editalDraft?.board || review.board}{review.examDate ? ` · Prova: ${new Date(review.examDate).toLocaleDateString("pt-BR")}` : ""}
          </p>
          {review.editalDraft?.summary && <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.editalDraft.summary}</p>}
        </div>

        {jobs.length > 0 && (
          <section className="rounded-3xl border bg-muted/20 p-5 md:p-7">
            <p className="text-sm font-semibold text-primary">Defina seu foco</p>
            <label className="mt-2 block text-xl font-semibold" htmlFor="job">Qual cargo você vai disputar?</label>
            <p className="mt-1 text-sm text-muted-foreground">Vamos usar apenas o conteúdo, requisitos e prioridades deste perfil.</p>
            <select id="job" className="mt-2 h-11 w-full rounded-xl border bg-background px-3" value={selectedJobName} onChange={(event) => chooseJob(event.target.value)}>
              {jobs.map((job) => <option key={job.name} value={job.name}>{job.name}</option>)}
            </select>
          </section>
        )}

        {selectedJob && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-4 text-sm"><strong>Requisitos</strong><p className="mt-2 text-muted-foreground">{selectedJob.requirements.length ? selectedJob.requirements.join(" · ") : "Não identificado no texto."}</p></div>
            <div className="rounded-2xl bg-muted/50 p-4 text-sm"><strong>Vagas e modalidades</strong><p className="mt-2 text-muted-foreground">{[selectedJob.vacancies, ...selectedJob.quotas, ...selectedJob.pcd].filter(Boolean).join(" · ") || "Confira as regras no edital."}</p></div>
          </section>
        )}

        {review.editalDraft?.notices?.length ? <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><strong>Atenção</strong><ul className="mt-2 list-disc space-y-1 pl-5">{review.editalDraft.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul></div> : null}
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <section className="border-t pt-8">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-primary">Conteúdo programático</p><h2 className="mt-1 text-2xl font-semibold">Matérias identificadas</h2></div><span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{subjects.length} disciplinas</span></div>
          <p className="mt-1 text-sm text-muted-foreground">Revise os nomes e remova o que não fizer parte do cargo escolhido.</p>
          <div className="mt-4 space-y-3">
            {subjects.map((subject, index) => <section key={`${subject.name}-${index}`} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><input aria-label={`Disciplina ${index + 1}`} className="min-w-0 flex-1 bg-transparent font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary" value={subject.name} onChange={(event) => setSubjects(subjects.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))}/><Button variant="ghost" size="sm" onClick={() => setSubjects(subjects.filter((_, itemIndex) => itemIndex !== index))}>Remover</Button></div><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{subject.topics.map((topic, topicIndex) => <li key={`${topic.name}-${topicIndex}`}><strong className="text-foreground">{topic.name}</strong>{topic.subtopics.length ? `: ${topic.subtopics.join(", ")}` : ""}</li>)}</ul></section>)}
          </div>
        </section>
        <div className="mt-7 flex flex-wrap justify-between gap-3 border-t pt-5"><Button variant="outline" onClick={() => navigate("/app/onboarding-v1")}>Voltar</Button><Button onClick={confirm} disabled={saving || subjects.length === 0}>{saving ? "Criando plano…" : "Confirmar edital e criar plano"}</Button></div>
      </div>
    </main>
  );
}
