import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, MessageSquare, Plus, RefreshCw, Send, ShieldCheck } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Kind = "note" | "decision" | "action" | "signal";
const kindLabel: Record<Kind, string> = { note: "Nota", decision: "Decisão", action: "Ação", signal: "Sinal" };
const kindTone: Record<Kind, string> = {
  note: "border-slate-200 bg-slate-50 text-slate-700",
  decision: "border-violet-200 bg-violet-50 text-violet-800",
  action: "border-amber-200 bg-amber-50 text-amber-800",
  signal: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export default function AdminMeetings() {
  const utils = trpc.useUtils();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newOpening, setNewOpening] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<Kind>("note");

  const threadsQuery = trpc.meetings.listThreads.useQuery({ limit: 40 });
  const statsQuery = trpc.meetings.getStats.useQuery();
  const threadQuery = trpc.meetings.getThread.useQuery({ threadId: selectedThreadId || 0 }, { enabled: Boolean(selectedThreadId) });
  const createThread = trpc.meetings.createThread.useMutation({
    onSuccess: (payload: any) => {
      toast.success("Reunião registrada no feed operacional.");
      setNewTitle(""); setNewOpening("");
      setSelectedThreadId(payload.thread.id);
      void utils.meetings.listThreads.invalidate();
      void utils.meetings.getStats.invalidate();
    },
    onError: (error: any) => toast.error(error.message || "Não foi possível criar a reunião."),
  });
  const postMessage = trpc.meetings.postMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      void utils.meetings.getThread.invalidate();
      void utils.meetings.listThreads.invalidate();
    },
    onError: (error: any) => toast.error(error.message || "Não foi possível publicar a mensagem."),
  });

  const threads = threadsQuery.data?.threads || [];
  useEffect(() => { if (!selectedThreadId && threads.length) setSelectedThreadId(threads[0].id); }, [selectedThreadId, threads]);
  const selected = threadQuery.data?.thread;
  const messages = threadQuery.data?.messages || [];
  const statusText = useMemo(() => selected?.status === "open" ? "Aberta" : selected?.status === "closed" ? "Encerrada" : "Arquivada", [selected]);

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Governança operacional</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Reuniões AI-C-Level</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Feed persistente para decisões, ações e sinais do C-Level. Nenhum placeholder ou reunião fictícia é exibido.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { void threadsQuery.refetch(); void statsQuery.refetch(); }} disabled={threadsQuery.isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${threadsQuery.isFetching ? "animate-spin" : ""}`} /> Atualizar
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="border-slate-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Reuniões</p><p className="mt-1 text-3xl font-bold text-slate-950">{statsQuery.data?.total ?? 0}</p></Card>
          <Card className="border-emerald-200 bg-emerald-50 p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">Abertas</p><p className="mt-1 text-3xl font-bold text-emerald-900">{statsQuery.data?.open ?? 0}</p></Card>
          <Card className="border-violet-200 bg-violet-50 p-4"><p className="text-xs uppercase tracking-wide text-violet-700">Encerradas</p><p className="mt-1 text-3xl font-bold text-violet-900">{statsQuery.data?.closed ?? 0}</p></Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <Card className="border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-cyan-700" /><h2 className="font-semibold text-slate-900">Nova reunião</h2></div>
              <div className="space-y-3">
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex.: Gate Go-Live · Onda 8" maxLength={180} />
                <Textarea value={newOpening} onChange={(e) => setNewOpening(e.target.value)} placeholder="Contexto, pauta ou decisão inicial" className="min-h-24" maxLength={6000} />
                <Button className="w-full" disabled={!newTitle.trim() || createThread.isPending} onClick={() => createThread.mutate({ title: newTitle, openingMessage: newOpening || undefined, kind })}>
                  <Plus className="mr-2 h-4 w-4" /> Criar feed
                </Button>
              </div>
            </Card>
            <Card className="max-h-[540px] overflow-y-auto border-slate-200 bg-white p-2">
              <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Histórico</p>
              {threadsQuery.isLoading ? <p className="p-3 text-sm text-slate-500">Carregando…</p> : threads.length === 0 ? <p className="p-3 text-sm text-slate-500">Nenhuma reunião real registrada.</p> : threads.map((thread: any) => (
                <button key={thread.id} onClick={() => setSelectedThreadId(thread.id)} className={`w-full rounded-lg p-3 text-left transition ${selectedThreadId === thread.id ? "bg-cyan-50 ring-1 ring-cyan-200" : "hover:bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-2"><span className="line-clamp-2 text-sm font-semibold text-slate-900">{thread.title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${thread.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{thread.status}</span></div>
                  <p className="mt-1 text-xs text-slate-500">{thread.messages} mensagem(ns) · {new Date(thread.updatedAt).toLocaleString("pt-BR")}</p>
                </button>
              ))}
            </Card>
          </aside>

          <Card className="min-h-[560px] border-slate-200 bg-white p-5">
            {!selectedThreadId ? <div className="grid h-full place-items-center text-center text-slate-500"><MessageSquare className="mb-3 h-10 w-10" /><p>Selecione ou crie uma reunião para iniciar o feed.</p></div> : threadQuery.isLoading ? <p className="text-sm text-slate-500">Carregando thread…</p> : (
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 pb-4"><div className="flex items-center gap-2"><h2 className="text-xl font-bold text-slate-950">{selected?.title}</h2><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{statusText}</span></div><p className="mt-1 text-xs text-slate-500">Criada por {selected?.createdBy || "Admin"} · {selected?.createdAt ? new Date(selected.createdAt).toLocaleString("pt-BR") : ""}</p></div>
                <div className="flex-1 space-y-3 py-5">
                  {messages.length === 0 ? <p className="text-sm text-slate-500">Sem mensagens. Registre a primeira decisão ou ação.</p> : messages.map((item: any) => <article key={item.id} className={`rounded-xl border p-4 ${kindTone[item.kind as Kind] || kindTone.note}`}><div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide">{kindLabel[item.kind as Kind] || "Nota"}</span><span className="text-xs opacity-70">{new Date(item.createdAt).toLocaleString("pt-BR")}</span></div><p className="whitespace-pre-wrap text-sm leading-6">{item.body}</p><p className="mt-2 text-xs opacity-70">{item.authorName} · {item.authorRole}</p></article>)}
                </div>
                <div className="border-t border-slate-200 pt-4"><div className="mb-2 flex flex-wrap gap-2">{(["note", "decision", "action", "signal"] as Kind[]).map((value) => <button key={value} onClick={() => setKind(value)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${kind === value ? kindTone[value] : "border-slate-200 text-slate-600"}`}>{kindLabel[value]}</button>)}</div><div className="flex gap-2"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Registrar decisão, ação, sinal ou nota…" className="min-h-20" maxLength={6000} /><Button disabled={!message.trim() || postMessage.isPending} onClick={() => selectedThreadId && postMessage.mutate({ threadId: selectedThreadId, body: message, kind })}><Send className="h-4 w-4" /></Button></div><p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><ShieldCheck className="h-3 w-3" /> Registro auditável · apenas administradores autenticados podem publicar.</p></div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
