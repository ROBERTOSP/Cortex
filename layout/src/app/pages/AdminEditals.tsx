import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  CheckCircle2,
  FileSearch,
  FileUp,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { DisplayPreferences } from "../components/DisplayPreferences";

type Topic = { name: string; subtopics: string[] };
type Subject = { name: string; topics: Topic[] };
type Job = { name: string; baseJob?: string | null; profileName?: string | null; requirements: string[]; taskSummary?: string | null; tasks: string[]; vacancies?: string | null; quotas: string[]; pcd: string[]; notes: string[]; subjects: Subject[] };
type Extraction = { jobs: Job[]; summary: string; board?: string | null; organization?: string | null; examDate?: string | null; generalEligibilityRequirements: string[]; notices: string[] };
type Edital = {
  id: string;
  title: string;
  board?: string | null;
  examDate?: string | null;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  extraction?: Extraction | null;
  updatedAt: string;
};

const statusLabel: Record<Edital["status"], string> = {
  DRAFT: "Rascunho",
  REVIEW: "Aguardando revisão",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};

export function AdminEditals() {
  const { logout, user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editals, setEditals] = useState<Edital[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", board: "", examDate: "" });
  const [draft, setDraft] = useState<Extraction | null>(null);

  const selected = editals.find((item) => item.id === selectedId) || null;
  const jobs = draft?.jobs || [];
  const subjectCount = useMemo(
    () => jobs.reduce((total, job) => total + (job.subjects?.length || 0), 0),
    [jobs],
  );
  const reviewIssues = useMemo(() => getReviewIssues(draft), [draft]);

  async function load(preferredId?: string) {
    setLoading(true);
    setError("");
    try {
      const items = await apiFetch<Edital[]>("/contests/admin/editals");
      setEditals(items);
      setSelectedId((current) =>
        preferredId && items.some((item) => item.id === preferredId)
          ? preferredId
          : items.some((item) => item.id === current)
            ? current
            : items[0]?.id || "",
      );
    } catch (cause: any) {
      setError(cause.message || "Não foi possível carregar os editais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setForm({
      title: selected.title,
      board: selected.board || "",
      examDate: selected.examDate ? selected.examDate.slice(0, 10) : "",
    });
    const extraction = selected.extraction;
    setDraft({
      summary: extraction?.summary || "",
      board: selected.board || null,
      organization: null,
      examDate: selected.examDate?.slice(0, 10) || null,
      generalEligibilityRequirements: extraction?.generalEligibilityRequirements || [],
      notices: extraction?.notices || [],
      jobs: (extraction?.jobs || []).map((job) => ({
        ...job,
        requirements: job.requirements || [],
        tasks: job.tasks || [],
        quotas: job.quotas || [],
        pcd: job.pcd || [],
        notes: job.notes || [],
        subjects: (job.subjects || []).map((subject) => ({
          ...subject,
          topics: (subject.topics || []).map((topic) => ({
            ...topic,
            subtopics: topic.subtopics || [],
          })),
        })),
      })),
    });
  }, [selectedId, selected?.updatedAt]);

  async function analyze(file?: File) {
    if (!file) return;
    setProcessing(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.set("file", file);
      const created = await apiFetch<Edital>("/contests/admin/editals/upload", {
        method: "POST",
        body,
      });
      setNotice("Análise concluída. Revise os dados antes de publicar.");
      await load(created.id);
    } catch (cause: any) {
      setError(cause.message || "Falha ao analisar o edital.");
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/contests/admin/editals/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...form, extraction: draft }),
      });
      setNotice("Alterações salvas.");
      await load(selected.id);
    } catch (cause: any) {
      setError(cause.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(action: "publish" | "archive") {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      if (action === "publish") {
        await apiFetch(`/contests/admin/editals/${selected.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...form, extraction: draft }),
        });
      }
      await apiFetch(`/contests/admin/editals/${selected.id}/${action}`, { method: "POST" });
      setNotice(action === "publish" ? "Edital publicado no catálogo dos alunos." : "Edital arquivado.");
      await load(selected.id);
    } catch (cause: any) {
      setError(cause.message || "Não foi possível alterar o status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b bg-card lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b p-5">
          <img src="/brand/cortex-logo.png" alt="" className="h-10 w-10 object-contain" />
          <div><strong className="block">Cortex Admin</strong><span className="text-xs text-muted-foreground">Gestão da plataforma</span></div>
        </div>
        <nav className="grid grid-cols-2 gap-1 p-3 text-sm lg:grid-cols-1">
          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><LayoutDashboard className="size-4" />Visão geral</span>
          <span className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground"><BookOpenCheck className="size-4" />Editais</span>
          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><Users className="size-4" />Usuários</span>
          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><ShieldCheck className="size-4" />Assinaturas</span>
        </nav>
        <div className="p-3 lg:absolute lg:bottom-0 lg:w-full">
          <div className="mb-2 rounded-xl border p-3 text-sm"><strong className="block truncate">{user?.name || "Administrador"}</strong><span className="block truncate text-xs text-muted-foreground">{user?.email}</span></div>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}><LogOut /> Sair</Button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 md:px-8">
          <div><p className="text-sm font-semibold text-primary">Gestão central</p><h1 className="text-2xl font-semibold">Catálogo de editais</h1></div>
          <div className="flex items-center gap-2">
            <DisplayPreferences compact />
            <input ref={fileRef} className="sr-only" type="file" accept=".pdf,application/pdf" onChange={(event) => analyze(event.target.files?.[0])} />
            <Button onClick={() => fileRef.current?.click()} disabled={processing}>
              {processing ? <RefreshCw className="animate-spin" /> : <FileUp />}
              {processing ? "Analisando PDF…" : "Importar edital"}
            </Button>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {processing && <div className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4"><p className="flex items-center gap-3 font-medium"><RefreshCw className="size-5 animate-spin text-primary" />O Cortex está lendo cargos, requisitos e matérias.</p><p className="mt-1 pl-8 text-sm text-muted-foreground">A análise será salva para todos os alunos e não precisará ser repetida.</p></div>}
          {error && <p className="mb-5 rounded-xl bg-destructive/10 p-4 text-destructive">{error}</p>}
          {notice && <p className="mb-5 flex items-center gap-2 rounded-xl bg-primary/10 p-4 text-primary"><CheckCircle2 className="size-5" />{notice}</p>}

          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Total" value={editals.length} />
            <Metric label="Em revisão" value={editals.filter((item) => item.status === "REVIEW").length} />
            <Metric label="Publicados" value={editals.filter((item) => item.status === "PUBLISHED").length} />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(300px,420px)_1fr]">
            <section>
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Editais cadastrados</h2><Button variant="ghost" size="sm" onClick={() => load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar</Button></div>
              <div className="grid gap-2">
                {!loading && !editals.length && <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"><FileSearch className="mx-auto mb-3 size-8 text-primary" />Importe o primeiro edital para iniciar o catálogo.</button>}
                {editals.map((edital) => (
                  <button key={edital.id} onClick={() => setSelectedId(edital.id)} className={`rounded-xl border p-4 text-left transition ${selectedId === edital.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <div className="flex items-start justify-between gap-3"><strong className="line-clamp-2">{edital.title}</strong><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px]">{statusLabel[edital.status]}</span></div>
                    <p className="mt-2 text-sm text-muted-foreground">{edital.board || "Banca não informada"}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border bg-card p-5 md:p-6">
              {!selected ? <div className="grid min-h-72 place-items-center text-center text-muted-foreground"><div><FileSearch className="mx-auto mb-3 size-10" /><p>Selecione ou importe um edital.</p></div></div> : <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
                  <div><p className="text-sm font-semibold text-primary">Revisão editorial</p><h2 className="mt-1 text-xl font-semibold">{selected.title}</h2><p className="mt-1 text-sm text-muted-foreground">{jobs.length} cargos · {subjectCount} matérias mapeadas</p></div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{statusLabel[selected.status]}</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">Nome do concurso<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                  <label className="grid gap-1.5 text-sm font-medium">Banca<Input value={form.board} onChange={(event) => setForm({ ...form, board: event.target.value })} /></label>
                  <label className="grid gap-1.5 text-sm font-medium">Data da prova<Input type="date" value={form.examDate} onChange={(event) => setForm({ ...form, examDate: event.target.value })} /></label>
                </div>
                {draft && <EditalEditor value={draft} onChange={setDraft} />}
                {!!reviewIssues.length && <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><h3 className="font-semibold">Pendências antes da publicação</h3><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{reviewIssues.map((issue) => <li key={issue}>• {issue}</li>)}</ul></div>}
                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-5">
                  {selected.status !== "ARCHIVED" && <Button variant="outline" onClick={() => changeStatus("archive")} disabled={saving}><Archive /> Arquivar</Button>}
                  <Button variant="outline" onClick={save} disabled={saving || !form.title.trim() || !draft}>Salvar revisão</Button>
                  {selected.status !== "PUBLISHED" && <Button onClick={() => changeStatus("publish")} disabled={saving || !!reviewIssues.length}><CheckCircle2 /> Salvar e publicar</Button>}
                </div>
              </>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-card p-4"><span className="text-sm text-muted-foreground">{label}</span><strong className="mt-1 block text-2xl">{value}</strong></div>;
}

function lines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function getReviewIssues(value: Extraction | null) {
  if (!value?.jobs.length) return ["Adicione ao menos um cargo."];
  const issues: string[] = [];
  value.jobs.forEach((job) => {
    const label = job.name.trim() || "Cargo sem nome";
    if (!job.name.trim()) issues.push("Há um cargo sem nome.");
    if (!job.requirements.some((item) => item.trim())) issues.push(`${label}: informe o requisito específico.`);
    if (!job.subjects.length) issues.push(`${label}: adicione o conteúdo programático.`);
    job.subjects.forEach((subject) => {
      if (!subject.name.trim()) issues.push(`${label}: há uma matéria sem nome.`);
      if (!subject.topics.length) issues.push(`${label} / ${subject.name || "matéria"}: adicione ao menos um tópico.`);
      if (subject.topics.some((topic) => !topic.name.trim())) issues.push(`${label} / ${subject.name || "matéria"}: há um tópico sem nome.`);
    });
  });
  return [...new Set(issues)];
}

function EditalEditor({ value, onChange }: { value: Extraction; onChange: (value: Extraction) => void }) {
  const updateJob = (index: number, job: Job) =>
    onChange({ ...value, jobs: value.jobs.map((item, itemIndex) => itemIndex === index ? job : item) });
  const removeJob = (index: number) => {
    if (!window.confirm("Remover este cargo e todo o conteúdo associado?")) return;
    onChange({ ...value, jobs: value.jobs.filter((_, itemIndex) => itemIndex !== index) });
  };
  const addJob = () => onChange({
    ...value,
    jobs: [...value.jobs, { name: "Novo cargo", requirements: [], tasks: [], vacancies: null, quotas: [], pcd: [], notes: [], subjects: [] }],
  });

  return <div className="mt-6 space-y-6">
    <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium md:col-span-2">Resumo para o aluno
        <Textarea value={value.summary} onChange={(event) => onChange({ ...value, summary: event.target.value })} />
      </label>
      <ListField label="Requisitos gerais" value={value.generalEligibilityRequirements} onChange={(items) => onChange({ ...value, generalEligibilityRequirements: items })} />
      <ListField label="Avisos importantes" value={value.notices} onChange={(items) => onChange({ ...value, notices: items })} />
    </section>

    <section>
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="font-semibold">Cargos e perfis</h3><p className="text-sm text-muted-foreground">Revise cada requisito e conteúdo antes de publicar.</p></div>
        <Button type="button" variant="outline" size="sm" onClick={addJob}><Plus /> Adicionar cargo</Button>
      </div>
      <div className="mt-3 space-y-4">
        {value.jobs.map((job, index) => (
          <JobEditor key={`${index}-${job.name}`} value={job} onChange={(next) => updateJob(index, next)} onRemove={() => removeJob(index)} />
        ))}
      </div>
    </section>
  </div>;
}

function JobEditor({ value, onChange, onRemove }: { value: Job; onChange: (value: Job) => void; onRemove: () => void }) {
  const updateSubject = (index: number, subject: Subject) =>
    onChange({ ...value, subjects: value.subjects.map((item, itemIndex) => itemIndex === index ? subject : item) });
  const addSubject = () => onChange({ ...value, subjects: [...value.subjects, { name: "Nova matéria", topics: [] }] });
  const removeSubject = (index: number) => {
    if (!window.confirm("Remover esta matéria e seus tópicos?")) return;
    onChange({ ...value, subjects: value.subjects.filter((_, itemIndex) => itemIndex !== index) });
  };

  return <details open className="rounded-xl border bg-card p-4">
    <summary className="cursor-pointer font-semibold">{value.name || "Cargo sem nome"} · {value.subjects.length} matérias</summary>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium md:col-span-2">Nome do cargo/perfil
        <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
      </label>
      <ListField label="Requisitos específicos do cargo" value={value.requirements} onChange={(items) => onChange({ ...value, requirements: items })} />
      <label className="grid gap-1.5 text-sm font-medium">Vagas e localidades
        <Textarea value={value.vacancies || ""} onChange={(event) => onChange({ ...value, vacancies: event.target.value || null })} />
      </label>
      <ListField label="Reserva de vagas/cotas" value={value.quotas} onChange={(items) => onChange({ ...value, quotas: items })} />
      <ListField label="Regras para PCD" value={value.pcd} onChange={(items) => onChange({ ...value, pcd: items })} />
      <ListField label="Atribuições" value={value.tasks} onChange={(items) => onChange({ ...value, tasks: items })} />
      <ListField label="Observações" value={value.notes} onChange={(items) => onChange({ ...value, notes: items })} />
    </div>
    <div className="mt-5 border-t pt-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold">Conteúdo programático</h4>
        <Button type="button" variant="outline" size="sm" onClick={addSubject}><Plus /> Matéria</Button>
      </div>
      <div className="mt-3 space-y-3">
        {value.subjects.map((subject, index) => (
          <SubjectEditor key={`${index}-${subject.name}`} value={subject} onChange={(next) => updateSubject(index, next)} onRemove={() => removeSubject(index)} />
        ))}
        {!value.subjects.length && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Adicione ao menos uma matéria com um tópico para publicar.</p>}
      </div>
    </div>
    <div className="mt-5 flex justify-end"><Button type="button" variant="ghost" className="text-destructive" onClick={onRemove}><Trash2 /> Remover cargo</Button></div>
  </details>;
}

function SubjectEditor({ value, onChange, onRemove }: { value: Subject; onChange: (value: Subject) => void; onRemove: () => void }) {
  const updateTopic = (index: number, topic: Topic) =>
    onChange({ ...value, topics: value.topics.map((item, itemIndex) => itemIndex === index ? topic : item) });
  return <div className="rounded-lg bg-muted/40 p-4">
    <div className="flex gap-2">
      <Input aria-label="Nome da matéria" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
      <Button type="button" variant="ghost" size="icon" aria-label="Remover matéria" onClick={onRemove}><Trash2 /></Button>
    </div>
    <div className="mt-3 space-y-2">
      {value.topics.map((topic, index) => (
        <div key={`${index}-${topic.name}`} className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium">Tópico<Input value={topic.name} onChange={(event) => updateTopic(index, { ...topic, name: event.target.value })} /></label>
          <div className="flex items-end gap-2">
            <label className="grid flex-1 gap-1 text-xs font-medium">Subtópicos, um por linha<Textarea className="min-h-10" value={lines(topic.subtopics)} onChange={(event) => updateTopic(index, { ...topic, subtopics: fromLines(event.target.value) })} /></label>
            <Button type="button" variant="ghost" size="icon" aria-label="Remover tópico" onClick={() => onChange({ ...value, topics: value.topics.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...value, topics: [...value.topics, { name: "Novo tópico", subtopics: [] }] })}><Plus /> Adicionar tópico</Button>
    </div>
  </div>;
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}<span className="text-xs font-normal text-muted-foreground">Um item por linha</span><Textarea value={lines(value)} onChange={(event) => onChange(fromLines(event.target.value))} /></label>;
}
