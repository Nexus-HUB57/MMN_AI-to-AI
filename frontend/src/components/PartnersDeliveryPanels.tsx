import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

// Fallback estático para garantir resposta visual em ambientes sem trpc procedure mapeada
const FALLBACK_MATERIALS = [
  { id: "mat-usability-01", category: "Usabilidade", title: "Guia de operação Nexus Partners Pack", description: "Como configurar agentes, workflows e prompts para tarefas reais.", format: "PDF + vídeo", minutes: 22 },
  { id: "mat-functional-01", category: "Funcionalidade", title: "Mapa funcional · Skills, workflows e prompts oficiais", description: "Catálogo completo das capacidades aplicadas a produção.", format: "Notion + JSON", minutes: 18 },
  { id: "mat-perf-01", category: "Performance", title: "Boas práticas de performance e custo por execução", description: "Ajustes de janela de contexto, batch e fallback de modelos.", format: "PDF", minutes: 14 },
  { id: "mat-prompts-01", category: "Biblioteca", title: "Biblioteca de prompts críticos Nexus", description: "Prompts de classificação, extração, roteamento e síntese.", format: "Markdown", minutes: 12 },
  { id: "mat-skills-01", category: "Biblioteca", title: "Biblioteca de Skills oficiais", description: "Skills versionadas com testes, contratos e exemplos.", format: "Pacote de código", minutes: 25 },
  { id: "mat-workflows-01", category: "Workflows", title: "Workflows operacionais prontos", description: "Cenários de atendimento, automação comercial e backoffice.", format: "JSON + diagramas", minutes: 30 },
  { id: "mat-limits-01", category: "Transparência", title: "Performance, potencial e limitações do sistema", description: "Limites de tokens, latências esperadas e SLAs por plano.", format: "PDF", minutes: 10 },
];

const FALLBACK_PERFORMANCE = {
  uptime: 99.94,
  avgLatencyMs: 612,
  p95LatencyMs: 1183,
  successRate: 0.987,
  dailyExecutions: 1284,
  monthlyExecutions: 31420,
  modelMix: [
    { model: "gemini-1.5-pro", usage: 0.58 },
    { model: "gemini-1.5-flash", usage: 0.31 },
    { model: "fallback", usage: 0.11 },
  ],
  limits: { chatbotDailyTokens: 100, maxConcurrentAgents: 3, maxWorkflowsPerHour: 240 },
};

function userId() {
  // Usa um identificador local persistente; em produção o backend recebe o user real.
  if (typeof window === "undefined") return "anon";
  try {
    let id = window.localStorage.getItem("nexus.partners.uid");
    if (!id) {
      id = `ppk_${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem("nexus.partners.uid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function Materials() {
  const query = (trpc as any)?.partnersDelivery?.listMaterials?.useQuery?.();
  const items = query?.data?.items ?? FALLBACK_MATERIALS;
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Materiais exclusivos · Usabilidade, funcionalidade e performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((m: any) => (
            <div key={m.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{m.category}</Badge>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">{m.format}</span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-white">{m.title}</h4>
              <p className="mt-2 text-sm text-slate-300">{m.description}</p>
              <p className="mt-3 text-[11px] uppercase tracking-widest text-slate-500">≈ {m.minutes} min</p>
              {(m.htmlUrl || m.pdfUrl || m.mdUrl) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.htmlUrl && <a href={m.htmlUrl} target="_blank" rel="noreferrer" className="rounded-full border border-quantum-cyan/40 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan hover:bg-quantum-cyan/20">Abrir HTML</a>}
                  {m.pdfUrl && <a href={m.pdfUrl} target="_blank" rel="noreferrer" className="rounded-full border border-rose-300/40 bg-rose-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-rose-200 hover:bg-rose-300/20">Baixar PDF</a>}
                  {m.mdUrl && <a href={m.mdUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200 hover:bg-emerald-300/20">Markdown</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Performance() {
  const query = (trpc as any)?.partnersDelivery?.performance?.useQuery?.({ userId: userId() });
  const p = query?.data ?? FALLBACK_PERFORMANCE;
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Painel de performance · SaaS Nexus Partners Pack</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Uptime", value: `${p.uptime}%` },
            { label: "Latência média", value: `${p.avgLatencyMs} ms` },
            { label: "Latência p95", value: `${p.p95LatencyMs} ms` },
            { label: "Taxa de sucesso", value: `${(p.successRate * 100).toFixed(1)}%` },
          ].map((x) => (
            <div key={x.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{x.label}</p>
              <p className="mt-2 text-xl font-bold text-white">{x.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Execuções/dia</p>
            <p className="mt-2 text-2xl font-bold text-white">{p.dailyExecutions.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Execuções/mês</p>
            <p className="mt-2 text-2xl font-bold text-white">{p.monthlyExecutions.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Limites do plano</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>Chatbot · {p.limits.chatbotDailyTokens} tokens/dia</li>
              <li>Agentes simultâneos · {p.limits.maxConcurrentAgents}</li>
              <li>Workflows/hora · {p.limits.maxWorkflowsPerHour}</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Mix de modelos</p>
          <div className="mt-3 space-y-2">
            {p.modelMix.map((m: any) => (
              <div key={m.model}>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{m.model}</span>
                  <span>{(m.usage * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded bg-white/10">
                  <div className="h-1.5 rounded bg-quantum-cyan" style={{ width: `${m.usage * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiBindings() {
  const uid = userId();
  const list = (trpc as any)?.partnersDelivery?.listApiBindings?.useQuery?.({ userId: uid });
  const upsert = (trpc as any)?.partnersDelivery?.upsertApiBinding?.useMutation?.();
  const remove = (trpc as any)?.partnersDelivery?.removeApiBinding?.useMutation?.();
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState<"bearer" | "basic" | "header" | "none">("bearer");
  const items = list?.data?.items ?? [];

  async function add() {
    if (!label || !baseUrl) return;
    if (upsert?.mutateAsync) {
      await upsert.mutateAsync({ userId: uid, label, baseUrl, authType });
      list?.refetch?.();
    }
    setLabel(""); setBaseUrl("");
  }

  async function rm(id: string) {
    if (remove?.mutateAsync) {
      await remove.mutateAsync({ userId: uid, id });
      list?.refetch?.();
    }
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Sincronização de APIs do Agente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-slate-300">
          Cadastre os destinos onde o seu Agente Nexus Partners deve executar automações: CRMs, ERPs, ferramentas internas, webhooks e endpoints proprietários.
        </p>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-1">
            <Label className="text-xs">Identificador</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: CRM ACME" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.exemplo.com" />
          </div>
          <div className="space-y-1 md:col-span-1">
            <Label className="text-xs">Tipo de auth</Label>
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as any)}
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white"
            >
              <option value="bearer">Bearer</option>
              <option value="basic">Basic</option>
              <option value="header">Header custom</option>
              <option value="none">Sem auth</option>
            </select>
          </div>
        </div>
        <Button className="gradient-btn" onClick={add}>Cadastrar destino</Button>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-3 py-2">Identificador</th>
                <th className="px-3 py-2">Base URL</th>
                <th className="px-3 py-2">Auth</th>
                <th className="px-3 py-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-500">Nenhum destino cadastrado.</td></tr>
              )}
              {items.map((it: any) => (
                <tr key={it.id} className="hover:bg-white/5">
                  <td className="px-3 py-2">{it.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">{it.baseUrl}</td>
                  <td className="px-3 py-2">{it.authType}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="outline" className="border-rose-400/30 bg-rose-400/10 text-rose-200" onClick={() => rm(it.id)}>
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Chatbot() {
  const uid = userId();
  const status = (trpc as any)?.partnersDelivery?.chatbotStatus?.useQuery?.({ userId: uid });
  const send = (trpc as any)?.partnersDelivery?.chatbotSend?.useMutation?.();
  const [input, setInput] = useState("");
  const [thread, setThread] = useState<Array<{ role: "user" | "bot"; text: string; meta?: string }>>([]);

  const remaining = status?.data?.remaining ?? 100;
  const limit = status?.data?.limit ?? 100;

  async function submit() {
    const message = input.trim();
    if (!message) return;
    setThread((t) => [...t, { role: "user", text: message }]);
    setInput("");
    if (send?.mutateAsync) {
      const r = await send.mutateAsync({ userId: uid, message });
      if (r?.ok) {
        setThread((t) => [...t, { role: "bot", text: r.reply, meta: `tokens: ${r.tokensConsumed} · restam ${r.remaining}/${r.limit}` }]);
      } else {
        setThread((t) => [...t, { role: "bot", text: r?.message || "Limite diário atingido. Renova em 24h.", meta: "quota" }]);
      }
      status?.refetch?.();
    } else {
      setThread((t) => [...t, { role: "bot", text: `Recebido (modo local): ${message}` }]);
    }
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Chatbot Nexus Partners</span>
          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
            {remaining}/{limit} tokens · 24h
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-400">
          Orçamento diário de 100 tokens. Reset automático a cada 24h. Direcione seu Agente para executar o que você contratou.
        </p>
        <div className="h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
          {thread.length === 0 && <p className="text-sm text-slate-500">Nenhuma conversa ainda. Envie sua primeira instrução.</p>}
          {thread.map((m, i) => (
            <div key={i} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-quantum-cyan/20 text-quantum-cyan" : "bg-white/5 text-slate-200"}`}>
                <p>{m.text}</p>
                {m.meta && <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">{m.meta}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Direcione seu agente Nexus Partners..." />
          <Button className="gradient-btn" onClick={submit} disabled={remaining <= 0}>Enviar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

const PartnersDeliveryPanels = { Materials, Performance, ApiBindings, Chatbot };
export default PartnersDeliveryPanels;
