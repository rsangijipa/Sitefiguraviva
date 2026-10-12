"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, FileSearch, PenLine, RefreshCw, Send, UserPlus, Users, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminStates";
import { cn } from "@/lib/utils";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import {
  getEditorialOverview, getEditorialVersion, removeEditorialRole, returnEditorialVersion, saveEditorialRole,
  type ApprovalResourceSummary, type ApprovalVersionDetail, type ApprovalVersionSummary, type EditorialOverview, type EditorialStatus,
} from "./approval.actions";
import { transitionEditorialVersion } from "./editorial.actions";
import type { EditorialItem } from "./editorial-schema";

type Stage = "publish" | "review" | "authoring" | "empty" | "published";
const STATUS: Record<EditorialStatus, { label: string; tone: string }> = {
  draft: { label: "Em autoria", tone: "border-stone-200 bg-stone-50 text-stone-700" },
  submitted: { label: "Aguardando revisão docente", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  reviewed: { label: "Assinada · aguardando publicação", tone: "border-sky-200 bg-sky-50 text-sky-800" },
  published: { label: "Publicada", tone: "border-green-200 bg-green-50 text-green-800" },
  archived: { label: "Arquivada", tone: "border-stone-200 bg-stone-50 text-stone-500" },
};
const STAGES: Record<Stage, { label: string; hint: string }> = {
  publish: { label: "Prontas para publicar", hint: "Assinadas por revisão docente. Falta a publicação." },
  review: { label: "Em revisão docente", hint: "Submetidas pela autoria, aguardando assinatura com CRP." },
  authoring: { label: "Em autoria", hint: "Rascunhos sendo escritos ou devolvidos para ajustes." },
  empty: { label: "Sem conteúdo", hint: "Nenhum item escrito ainda. Precisa de autoria." },
  published: { label: "Publicados", hint: "Com versão publicada e nada pendente." },
};
const KIND: Record<EditorialItem["kind"], string> = {
  card: "Carta", case: "Caso", vignette: "Vinheta", situation: "Situação", exercise: "Exercício",
  emotion: "Emoção", need: "Necessidade", sound: "Som", guidance: "Orientação",
};
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

/** A etapa de um recurso é a da versão mais adiantada no fluxo. */
function stageOf(resource: ApprovalResourceSummary): Stage {
  if (resource.inProgress.some(version => version.status === "reviewed")) return "publish";
  if (resource.inProgress.some(version => version.status === "submitted")) return "review";
  if (resource.inProgress.some(version => version.itemCount > 0)) return "authoring";
  return resource.published ? "published" : "empty";
}
function nextStep(resource: ApprovalResourceSummary): string {
  const latest = resource.inProgress[0];
  switch (stageOf(resource)) {
    case "publish": return "Conferir e publicar a versão assinada.";
    case "review": return "Um docente revisor, diferente da autoria, precisa assinar com CRP.";
    case "authoring": return latest?.reviewNote ? "Autoria precisa atender à devolução e submeter de novo." : "Autoria precisa concluir o rascunho e submeter à revisão.";
    case "empty": return resource.inProgress.length ? "Escrever o conteúdo no editor." : "Criar a primeira versão e atribuir autoria docente.";
    default: return "Nada pendente.";
  }
}

function StatusBadge({ status, demo = false }: { status: EditorialStatus; demo?: boolean }) {
  if (demo) return <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-800">Publicada · demonstração</span>;
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS[status].tone)}>{STATUS[status].label}</span>;
}

export function ResourceApprovalBoard() {
  const [overview, setOverview] = useState<EditorialOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage | "all">("all");
  const [openVersion, setOpenVersion] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await getEditorialOverview();
      if (result.ok === false) { setError(result.error); setOverview(null); } else setOverview(result.data);
    } catch { setError("Não foi possível carregar o acervo editorial."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const base: Record<Stage, number> = { publish: 0, review: 0, authoring: 0, empty: 0, published: 0 };
    overview?.resources.forEach(resource => { base[stageOf(resource)] += 1; });
    return base;
  }, [overview]);
  const queue = useMemo(() => (overview?.resources ?? []).flatMap(resource => resource.inProgress
    .filter(version => version.status === "reviewed" || version.status === "submitted")
    .map(version => ({ resource, version })))
    .sort((a, b) => (a.version.status === "reviewed" ? 0 : 1) - (b.version.status === "reviewed" ? 0 : 1) || a.version.updatedAt.localeCompare(b.version.updatedAt)), [overview]);
  const visible = (overview?.resources ?? []).filter(resource => stage === "all" || stageOf(resource) === stage);

  if (loading && !overview) return <AdminLoadingState rows={5} />;
  if (error && !overview) return <AdminErrorState title={error} retry={() => void load()} />;
  if (!overview) return null;
  const reviewers = overview.team.filter(member => member.role === "docente_revisor");

  return <div className="space-y-6">
    {!reviewers.length && <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div><p className="font-semibold">Falta um docente revisor.</p>
        <p className="mt-1">A administração já pode escrever e submeter, mas nenhuma versão pode ser assinada e publicada sem um docente revisor com CRP, diferente de quem escreveu. Cadastre um na seção <a href="#equipe-editorial" className="font-semibold underline">Equipe editorial</a>.</p></div>
    </div>}

    <section aria-label="Resumo por etapa" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {(Object.keys(STAGES) as Stage[]).map(key => <button key={key} type="button" aria-pressed={stage === key} onClick={() => setStage(current => current === key ? "all" : key)}
        className={cn("min-h-11 rounded-xl border bg-white p-4 text-left transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", stage === key ? "border-primary ring-1 ring-primary" : "border-stone-200")}>
        <span className="block font-serif text-3xl font-semibold text-primary">{counts[key]}</span>
        <span className="mt-1 block text-sm font-semibold text-stone-800">{STAGES[key].label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-stone-500">{STAGES[key].hint}</span>
      </button>)}
    </section>

    <section aria-labelledby="fila-aprovacao" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="fila-aprovacao" className="flex items-center gap-2 font-serif text-xl font-semibold text-primary"><ClipboardCheck size={20} aria-hidden="true" />Fila de aprovação</h2>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={cn("mr-1", loading && "animate-spin")} aria-hidden="true" />Atualizar</Button>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {queue.length ? <ul className="divide-y divide-stone-100">
        {queue.map(({ resource, version }) => <li key={version.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-semibold text-stone-900">{resource.title} <span className="font-normal text-stone-500">· versão {version.version}</span></p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
              <StatusBadge status={version.status} />
              <span>{version.itemCount} {version.itemCount === 1 ? "item" : "itens"}</span>
              <span>Autoria: {version.authorName ?? "—"}</span>
              {version.reviewerName && <span>Assinatura: {version.reviewerName} · CRP {version.reviewerCrp}</span>}
              <span>Atualizada em {dateTime(version.updatedAt)}</span>
            </p>
          </div>
          <Button size="sm" variant={version.status === "reviewed" ? "default" : "outline"} onClick={() => setOpenVersion(version.id)}><FileSearch size={16} className="mr-1.5" aria-hidden="true" />{version.status === "reviewed" ? "Analisar e publicar" : "Analisar"}</Button>
        </li>)}
      </ul> : <AdminEmptyState title="Nenhuma versão aguardando aprovação" description="Quando a autoria submeter uma versão, ela aparece aqui para revisão docente e, depois de assinada, para publicação." />}
    </section>

    <section aria-labelledby="todos-recursos" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="todos-recursos" className="font-serif text-xl font-semibold text-primary">Todos os recursos</h2>
        {stage !== "all" && <button type="button" className="min-h-11 text-sm font-semibold text-primary underline" onClick={() => setStage("all")}>Mostrando: {STAGES[stage].label} · ver todos</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
            <tr><th scope="col" className="py-2 pr-3 font-semibold">Recurso</th><th scope="col" className="py-2 pr-3 font-semibold">Publicada</th><th scope="col" className="py-2 pr-3 font-semibold">Em andamento</th><th scope="col" className="py-2 pr-3 font-semibold">Próximo passo</th><th scope="col" className="py-2 font-semibold"><span className="sr-only">Ações</span></th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map(resource => {
              const current = resource.inProgress[0];
              return <tr key={resource.key} className="align-top">
                <td className="py-3 pr-3"><p className="font-semibold text-stone-900">{resource.title}</p><p className="text-xs text-stone-500">{resource.category.charAt(0) + resource.category.slice(1).toLocaleLowerCase("pt-BR")} · {resource.access === "public" ? "Público" : "Formação"}{resource.visibility === "draft" && " · Catálogo em rascunho"}</p></td>
                <td className="py-3 pr-3">{resource.published ? <><p>Versão {resource.published.version}</p>{resource.published.demo ? <StatusBadge status="published" demo /> : <p className="text-xs text-stone-500">{resource.published.reviewerName} · CRP {resource.published.reviewerCrp}</p>}</> : <span className="text-stone-400">Nenhuma</span>}</td>
                <td className="py-3 pr-3">{current ? <div className="space-y-1"><StatusBadge status={current.status} /><p className="text-xs text-stone-500">Versão {current.version} · {current.itemCount} {current.itemCount === 1 ? "item" : "itens"}</p>{current.reviewNote && <p className="text-xs text-amber-800">Devolvida em {dateTime(current.returnedAt)}</p>}</div> : <span className="text-stone-400">—</span>}</td>
                <td className="max-w-[260px] py-3 pr-3 text-stone-700">{nextStep(resource)}</td>
                <td className="py-3"><div className="flex flex-wrap justify-end gap-2">
                  {current && <Button size="sm" variant="outline" onClick={() => setOpenVersion(current.id)}>Analisar</Button>}
                  {!current && resource.published && <Button size="sm" variant="outline" onClick={() => setOpenVersion(resource.published!.id)}>Ver publicada</Button>}
                  <Link href={`/admin/recursos/editor?recurso=${resource.key}`} className="inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-primary hover:bg-areia"><PenLine size={15} className="mr-1.5" aria-hidden="true" />Editor</Link>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </section>

    <EditorialTeam team={overview.team} onChange={load} />
    <VersionReview versionId={openVersion} onClose={() => setOpenVersion(null)} onChanged={load} />
  </div>;
}

function formatReference(reference: EditorialItem["references"][number]) {
  return [reference.author, reference.work, reference.edition, reference.year, reference.pages && `p. ${reference.pages}`].filter(Boolean).join(". ");
}

function VersionReview({ versionId, onClose, onChanged }: { versionId: string | null; onClose: () => void; onChanged: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<ApprovalVersionDetail | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (versionId && !element.open) element.showModal();
    if (!versionId && element.open) element.close();
    if (!versionId) return;
    let active = true;
    setDetail(null); setError(""); setMessage(""); setChecked(false); setReturning(false); setNote("");
    void getEditorialVersion(versionId).then(result => {
      if (!active) return;
      if (result.ok === false) setError(result.error); else setDetail(result.data);
    }).catch(() => { if (active) setError("Não foi possível abrir esta versão."); });
    return () => { active = false; };
  }, [versionId]);

  const publish = async (action: "publish" | "publish_demo" = "publish") => {
    if (!detail) return;
    setBusy(true); setError("");
    try {
      const result = await transitionEditorialVersion({ resourceKey: detail.resourceKey, versionId: detail.id, expectedUpdatedAt: detail.updatedAt, action, configuration: null });
      if (result.ok === false) setError(result.error);
      else { setDetail({ ...detail, ...result.data }); setMessage(action === "publish_demo" ? "Publicada como demonstração. O recurso mostra o aviso de conteúdo sem revisão docente." : "Versão publicada. Ela já aparece no recurso."); await onChanged(); }
    } catch { setError("Não foi possível publicar."); } finally { setBusy(false); }
  };
  const sendBack = async () => {
    if (!detail) return;
    setBusy(true); setError("");
    try {
      const result = await returnEditorialVersion({ resourceKey: detail.resourceKey, versionId: detail.id, expectedUpdatedAt: detail.updatedAt, note });
      if (result.ok === false) setError(result.error);
      else { setDetail({ ...detail, ...result.data }); setReturning(false); setMessage("Versão devolvida para a autoria com sua observação."); await onChanged(); }
    } catch { setError("Não foi possível devolver."); } finally { setBusy(false); }
  };
  const inReview = detail?.status === "submitted" || detail?.status === "reviewed";
  const canDemo = !!detail && (detail.status === "draft" || detail.status === "submitted") && detail.configuration.items.length > 0 && !detail.issues.length;

  return <dialog ref={dialog} aria-labelledby="revisao-titulo" onClose={onClose} onCancel={event => { event.preventDefault(); onClose(); }}
    className="m-auto h-[min(92dvh,900px)] w-[min(960px,calc(100vw-24px))] max-w-none overflow-hidden rounded-2xl border border-stone-200 bg-white p-0 text-stone-800 backdrop:bg-stone-900/50">
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4">
        <div className="min-w-0">
          <h2 id="revisao-titulo" className="font-serif text-xl font-semibold text-primary">{detail ? `${resourceCatalog.find(item => item.slug === detail.resourceKey)?.title ?? detail.resourceKey} · versão ${detail.version}` : "Análise da versão"}</h2>
          {detail && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500"><StatusBadge status={detail.status} demo={detail.demo} /><span>Autoria: {detail.authorName ?? "—"}</span><span>Atualizada em {dateTime(detail.updatedAt)}</span></div>}
        </div>
        <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-stone-500 hover:bg-stone-100" aria-label="Fechar análise"><X size={20} aria-hidden="true" /></button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {!detail && !error && <AdminLoadingState rows={4} />}
        {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-800"><CheckCircle2 size={16} aria-hidden="true" />{message}</p>}
        {detail && <>
          <section aria-label="Assinatura e conferência" className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="text-sm font-semibold text-stone-900">Assinatura docente</h3>
              {detail.demo ? <p className="mt-1 text-sm text-violet-800">Publicada como demonstração pela administração. Não passou por revisão docente.</p> : detail.reviewerName ? <p className="mt-1 text-sm">{detail.reviewerName} · CRP {detail.reviewerCrp}<br /><span className="text-xs text-stone-500">Assinada em {dateTime(detail.reviewedAt)}</span></p> : <p className="mt-1 text-sm text-stone-500">Ainda sem assinatura. Só um docente revisor, diferente da autoria, assina com CRP.</p>}
            </div>
            <div className={cn("rounded-xl border p-4", detail.issues.length ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50")}>
              <h3 className="text-sm font-semibold text-stone-900">Conferência automática</h3>
              {detail.issues.length ? <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-amber-900">{detail.issues.map(issue => <li key={issue}>{issue}</li>)}</ul> : <p className="mt-1 text-sm text-green-800">Títulos, textos, referências e licenças preenchidos.</p>}
            </div>
          </section>
          {detail.reviewNote && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Última devolução · {dateTime(detail.returnedAt)}</p><p className="mt-1 whitespace-pre-wrap">{detail.reviewNote}</p></div>}

          <section aria-labelledby="conteudo-versao">
            <h3 id="conteudo-versao" className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Conteúdo ({detail.configuration.items.length} {detail.configuration.items.length === 1 ? "item" : "itens"})</h3>
            {detail.configuration.items.length ? <ol className="space-y-3">
              {detail.configuration.items.map((item, index) => <li key={item.id} className="rounded-xl border border-stone-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{index + 1} · {KIND[item.kind]}{item.deck && ` · ${item.deck}`}{item.format && ` · ${item.format}`}</p>
                <h4 className="mt-1 font-serif text-lg font-semibold text-primary">{item.title || <span className="text-red-700">Sem título</span>}</h4>
                {item.text ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p> : <p className="mt-2 text-sm text-red-700">Sem texto docente.</p>}
                {item.prompt && <p className="mt-3 text-sm"><span className="font-semibold">Pergunta: </span>{item.prompt}</p>}
                {item.teacherResponse && <p className="mt-2 whitespace-pre-wrap text-sm"><span className="font-semibold">Comentário docente: </span>{item.teacherResponse}</p>}
                {!!item.segments.length && <div className="mt-3"><p className="text-sm font-semibold">Segmentos</p><ol className="list-decimal pl-5 text-sm">{item.segments.map(segment => <li key={segment.id}>{segment.text}</li>)}</ol></div>}
                {!!item.alternatives.length && <div className="mt-3"><p className="text-sm font-semibold">Alternativas</p><ul className="list-disc space-y-1 pl-5 text-sm">{item.alternatives.map(option => <li key={option.id}>{option.text}{option.comment && <span className="block text-stone-500">{option.comment}</span>}</li>)}</ul></div>}
                {!!item.relatedConcepts.length && <p className="mt-3 text-xs text-stone-500">Conceitos relacionados: {item.relatedConcepts.join(", ")}</p>}
                <div className="mt-3 border-t border-stone-100 pt-2"><p className="text-xs font-semibold text-stone-600">Referências</p>
                  {item.references.length ? <ul className="mt-1 space-y-0.5 text-xs text-stone-600">{item.references.map((reference, r) => <li key={r}>{formatReference(reference)}</li>)}</ul> : <p className="mt-1 text-xs text-stone-400">{item.kind === "guidance" ? "Orientação sem referência (permitido)." : "Nenhuma referência."}</p>}
                  {item.asset && <p className="mt-1 text-xs text-stone-600">Arte: {item.asset} · Licença: {item.license || "—"}</p>}
                </div>
              </li>)}
            </ol> : <AdminEmptyState title="Versão vazia" description="A autoria ainda não adicionou itens." />}
            {!!detail.configuration.audio.length && <div className="mt-3 rounded-xl border border-stone-200 p-4"><p className="text-sm font-semibold">Áudios</p><ul className="mt-1 space-y-0.5 text-sm">{detail.configuration.audio.map(sound => <li key={sound.id}>{sound.title} · {sound.credit} · {sound.license}</li>)}</ul></div>}
          </section>

          {returning && <div className="rounded-xl border border-stone-200 p-4">
            <label htmlFor="nota-devolucao" className="text-sm font-semibold text-stone-900">O que a autoria precisa ajustar?</label>
            <p className="text-xs text-stone-500">A observação fica visível no editor. A assinatura, se houver, é descartada.</p>
            <textarea id="nota-devolucao" value={note} onChange={event => setNote(event.target.value)} maxLength={2000} rows={4} className="mt-2 w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-right text-xs text-stone-500">{note.trim().length}/2000 · mínimo 10</p>
          </div>}
        </>}
      </div>

      {detail && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <a href={`/portal/recursos/${detail.resourceKey}?previa=1&versao=${detail.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-primary hover:bg-areia"><ExternalLink size={15} className="mr-1.5" aria-hidden="true" />Abrir prévia<span className="sr-only"> (abre em nova aba)</span></a>
          <Link href={`/admin/recursos/editor?recurso=${detail.resourceKey}`} className="inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-primary hover:bg-areia"><PenLine size={15} className="mr-1.5" aria-hidden="true" />Abrir no editor</Link>
        </div>
        {inReview && <div className="flex flex-wrap items-center justify-end gap-2">
          {returning ? <>
            <Button variant="ghost" size="sm" onClick={() => setReturning(false)} disabled={busy}>Cancelar</Button>
            <Button variant="outline" size="sm" onClick={() => void sendBack()} disabled={busy || note.trim().length < 10}>Confirmar devolução</Button>
          </> : <Button variant="outline" size="sm" onClick={() => setReturning(true)} disabled={busy}>Devolver para ajustes</Button>}
          {detail.status === "reviewed" && !returning && <>
            <label className="flex min-h-10 items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} className="h-4 w-4 accent-primary" />Conferi o conteúdo e a assinatura</label>
            <Button size="sm" onClick={() => void publish()} disabled={busy || !checked || detail.issues.length > 0}><Send size={15} className="mr-1.5" aria-hidden="true" />Publicar versão</Button>
          </>}
        </div>}
        {canDemo && !returning && <Button variant="outline" size="sm" disabled={busy} onClick={() => { if (window.confirm("Publicar como demonstração? O recurso mostrará o aviso “Conteúdo de demonstração · ainda sem revisão docente”.")) void publish("publish_demo"); }}>Publicar como demonstração</Button>}
      </footer>}
    </div>
  </dialog>;
}

const ROLE_LABEL = { docente_autor: "Docente autor", docente_revisor: "Docente revisor" } as const;

function EditorialTeam({ team, onChange }: { team: EditorialOverview["team"]; onChange: () => Promise<void> }) {
  const [form, setForm] = useState({ email: "", role: "docente_autor" as keyof typeof ROLE_LABEL, name: "", crp: "" });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setFeedback(null);
    try {
      const result = await saveEditorialRole(form);
      if (result.ok === false) setFeedback({ ok: false, text: result.error });
      else { setFeedback({ ok: true, text: result.data }); setForm(current => ({ ...current, email: "", name: "", crp: "" })); await onChange(); }
    } catch { setFeedback({ ok: false, text: "Não foi possível salvar a permissão." }); } finally { setBusy(false); }
  };
  const remove = async (member: EditorialOverview["team"][number]) => {
    if (!window.confirm(`Remover ${member.name} como ${ROLE_LABEL[member.role].toLowerCase()}?`)) return;
    setBusy(true); setFeedback(null);
    try {
      const result = await removeEditorialRole({ userId: member.userId, role: member.role });
      setFeedback(result.ok === false ? { ok: false, text: result.error } : { ok: true, text: "Permissão removida." });
      if (result.ok) await onChange();
    } catch { setFeedback({ ok: false, text: "Não foi possível remover a permissão." }); } finally { setBusy(false); }
  };
  const field = "mt-1 h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
  return <section id="equipe-editorial" aria-labelledby="equipe-titulo" className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
    <h2 id="equipe-titulo" className="flex items-center gap-2 font-serif text-xl font-semibold text-primary"><Users size={20} aria-hidden="true" />Equipe editorial</h2>
    <p className="mt-1 max-w-3xl text-sm text-stone-600">A administração e os docentes autores escrevem e submetem. Docentes revisores assinam com nome e CRP, e não podem assinar o que eles mesmos escreveram. A administração publica.</p>
    {team.length ? <ul className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-200">
      {team.map(member => <li key={`${member.userId}-${member.role}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0"><p className="font-semibold text-stone-900">{member.name} <span className="font-normal text-stone-500">· CRP {member.crp}</span></p><p className="text-xs text-stone-500">{ROLE_LABEL[member.role]} · {member.email || "e-mail indisponível"}</p></div>
        <Button variant="ghost" size="sm" onClick={() => void remove(member)} disabled={busy}>Remover</Button>
      </li>)}
    </ul> : <p className="mt-4 text-sm text-stone-500">Nenhum docente cadastrado.</p>}
    <form onSubmit={event => void submit(event)} className="mt-5 grid gap-3 rounded-xl border border-dashed border-stone-300 p-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Adicionar docente à equipe">
      <label className="text-sm font-semibold text-stone-700 lg:col-span-2">E-mail da conta<input type="email" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={field} autoComplete="off" /></label>
      <label className="text-sm font-semibold text-stone-700">Papel<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value as keyof typeof ROLE_LABEL })} className={field}><option value="docente_autor">Docente autor</option><option value="docente_revisor">Docente revisor</option></select></label>
      <label className="text-sm font-semibold text-stone-700">Nome na assinatura<input required minLength={3} maxLength={160} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className={field} /></label>
      <label className="text-sm font-semibold text-stone-700">CRP<input required pattern="[0-9]{2}/[0-9]{3,8}" placeholder="06/123456" value={form.crp} onChange={event => setForm({ ...form, crp: event.target.value })} className={field} /></label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-5">
        <Button type="submit" size="sm" disabled={busy}><UserPlus size={15} className="mr-1.5" aria-hidden="true" />Adicionar à equipe</Button>
        {feedback && <p role={feedback.ok ? "status" : "alert"} className={cn("text-sm", feedback.ok ? "text-green-800" : "text-red-700")}>{feedback.text}</p>}
      </div>
    </form>
  </section>;
}
