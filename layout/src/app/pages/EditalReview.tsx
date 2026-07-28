import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { apiFetch } from "../lib/api";

type Topic = { name: string; subtopics: string[] };
type Subject = { name: string; topics: Topic[] };
type Review = { id:string; name:string; targetJob:string; board:string; examDate?:string; editalDraft?:{subjects?:Subject[]} };

export function EditalReview(){
  const { contestId }=useParams(); const navigate=useNavigate();
  const [review,setReview]=useState<Review|null>(null); const [subjects,setSubjects]=useState<Subject[]>([]); const [error,setError]=useState(""); const [saving,setSaving]=useState(false);
  useEffect(()=>{if(!contestId)return;apiFetch<Review>(`/contests/${contestId}/edital-review`).then(data=>{setReview(data);setSubjects(data.editalDraft?.subjects||[])}).catch(e=>setError(e.message||"Não foi possível abrir a revisão."))},[contestId]);
  const confirm=async()=>{if(!contestId)return;setSaving(true);setError("");try{await apiFetch(`/contests/${contestId}/confirm-edital`,{method:"POST",body:JSON.stringify({subjects})});navigate("/schedule")}catch(e:any){setError(e.message||"Não foi possível confirmar o edital.")}finally{setSaving(false)}};
  if(error&&!review)return <main className="mx-auto max-w-3xl p-8 text-destructive">{error}</main>;
  if(!review)return <main className="mx-auto max-w-3xl p-8 text-muted-foreground">Lendo seu edital…</main>;
  return <main className="onboarding-light mx-auto min-h-screen max-w-4xl px-5 py-8"><header className="mb-6"><p className="text-sm font-semibold text-primary">Revise seu edital</p><h1 className="mt-1 text-3xl font-semibold">Confirme o conteúdo antes de criar o plano</h1><p className="mt-2 text-muted-foreground">A análise é uma sugestão. Remova o que não faz parte do seu cargo e ajuste os nomes quando necessário.</p></header><Card className="rounded-3xl p-5 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5"><div><strong>{review.name}</strong><p className="text-sm text-muted-foreground">{review.targetJob} · {review.board}</p></div><span className="text-sm text-muted-foreground">{subjects.length} disciplinas identificadas</span></div>{error&&<p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="mt-6 space-y-4">{subjects.map((subject,index)=><section key={`${subject.name}-${index}`} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><input className="min-w-0 flex-1 bg-transparent font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary" value={subject.name} onChange={e=>setSubjects(subjects.map((item,i)=>i===index?{...item,name:e.target.value}:item))}/><Button variant="ghost" size="sm" onClick={()=>setSubjects(subjects.filter((_,i)=>i!==index))}>Remover</Button></div><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{subject.topics.map((topic,i)=><li key={`${topic.name}-${i}`}><strong className="text-foreground">{topic.name}</strong>{topic.subtopics.length?`: ${topic.subtopics.join(", ")}`:""}</li>)}</ul></section>)}</div><div className="mt-6 flex flex-wrap justify-between gap-3"><Button variant="outline" onClick={()=>navigate("/onboarding")}>Voltar à rotina</Button><Button onClick={confirm} disabled={saving||subjects.length===0}>{saving?"Confirmando…":"Confirmar edital e criar plano"}</Button></div></Card></main>
}
