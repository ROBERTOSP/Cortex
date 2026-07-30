import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  CheckCircle2,
  FileSearch,
  FileUp,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { DisplayPreferences } from "../components/DisplayPreferences";

type Subject = { name: string; topics?: Array<{ name: string; subtopics?: string[] }> };
type Job = { name: string; baseJob?: string; requirements?: string[]; taskSummary?: string; tasks?: string[]; vacancies?: string | null; quotas?: string[]; pcd?: string[]; notes?: string[]; subjects?: Subject[] };
type Extraction = { jobs?: Job[]; summary?: string; generalEligibilityRequirements?: string[]; notices?: string[] };
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

  const selected = editals.find((item) => item.id === selectedId) || null;
  const jobs = selected?.extraction?.jobs || [];
  const subjectCount = useMemo(
    () => jobs.reduce((total, job) => total + (job.subjects?.length || 0), 0),
    [jobs],
  );

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
        body: JSON.stringify(form),
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
                {selected.extraction?.summary && <div className="mt-5 rounded-xl bg-muted/50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resumo</p><p className="mt-2 text-sm">{selected.extraction.summary}</p></div>}
                <div className="mt-6"><h3 className="font-semibold">Cargos e perfis extraídos</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{jobs.map((job) => <details key={job.name} className="rounded-xl border p-4"><summary className="cursor-pointer"><strong className="block">{job.name}</strong><span className="mt-2 block text-sm text-muted-foreground">{job.requirements?.join(" · ") || "Requisito não identificado"}</span><span className="mt-3 block text-xs font-medium text-primary">{job.subjects?.length || 0} matérias</span></summary><AdminInfo title="Vagas e localidades" values={job.vacancies ? [job.vacancies] : []} /><AdminInfo title="Reserva de vagas" values={job.quotas} /><AdminInfo title="Pessoas com deficiência" values={job.pcd} /><AdminInfo title="Atribuições" values={job.tasks} /><AdminInfo title="Observações" values={job.notes} /><div className="mt-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Matérias, tópicos e subtópicos</p><div className="mt-2 space-y-2">{(job.subjects || []).map((subject) => <div key={subject.name} className="rounded-lg bg-muted/50 p-3 text-sm"><strong>{subject.name}</strong><ul className="mt-2 space-y-1 text-xs text-muted-foreground">{(subject.topics || []).map((topic) => <li key={topic.name}>{topic.name}{topic.subtopics?.length ? ` — ${topic.subtopics.join(" · ")}` : ""}</li>)}</ul></div>)}</div></div></details>)}</div></div>
                <div className="mt-6 grid gap-4 md:grid-cols-2"><AdminPanel title="Requisitos gerais" values={selected.extraction?.generalEligibilityRequirements} /><AdminPanel title="Avisos importantes" values={selected.extraction?.notices} /></div>
                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-5">
                  {selected.status !== "ARCHIVED" && <Button variant="outline" onClick={() => changeStatus("archive")} disabled={saving}><Archive /> Arquivar</Button>}
                  <Button variant="outline" onClick={save} disabled={saving || !form.title.trim()}>Salvar revisão</Button>
                  {selected.status !== "PUBLISHED" && <Button onClick={() => changeStatus("publish")} disabled={saving || !jobs.length}><CheckCircle2 /> Publicar no catálogo</Button>}
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

function AdminInfo({ title, values }: { title: string; values?: string[] | null }) {
  if (!values?.length) return null;
  return <div className="mt-4"><p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{values.map((value) => <li key={value}>• {value}</li>)}</ul></div>;
}

function AdminPanel({ title, values }: { title: string; values?: string[] | null }) {
  if (!values?.length) return null;
  return <div className="rounded-xl border p-4"><h3 className="font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{values.map((value) => <li key={value}>• {value}</li>)}</ul></div>;
}
