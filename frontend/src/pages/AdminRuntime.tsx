import { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Cpu,
  Gauge,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SkillHandlerSummary {
  slug: string;
  title: string;
  category: string;
  version: string;
  supportsAutonomous: boolean;
}

interface TelemetrySnapshot {
  sampleSize: number;
  autonomousTasksPct: number;
  manualApprovalPct: number;
  avgLatencyMs: number;
  activeChannels: number;
  skillsExercised: string[];
  judgeAccuracyPct: number | null;
  judgeSampleSize: number;
  windowSizeMax: number;
  judgeWindowSizeMax: number;
}

interface AutonomyBreakdown {
  label: string;
  weight: number;
  contribution: number;
  rawValue: number;
  description: string;
}

interface AutonomyResult {
  score: number;
  band: "low" | "developing" | "operational" | "advanced";
  breakdown: AutonomyBreakdown[];
  notes: string[];
  generatedAt: string;
}

function getTrpcBaseUrl(): string {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TRPC_URL) {
    return (import.meta as any).env.VITE_TRPC_URL as string;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/api/trpc`;
  }
  return "/api/trpc";
}

async function fetchTrpcQuery<T>(procedure: string): Promise<T | null> {
  try {
    const response = await fetch(`${getTrpcBaseUrl()}/${procedure}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) return null;
    const json = await response.json();
    return (json?.result?.data as T) ?? null;
  } catch {
    return null;
  }
}

const bandLabel: Record<AutonomyResult["band"], { text: string; color: string }> = {
  low: { text: "Inicial", color: "bg-red-500/10 text-red-300 border-red-500/30" },
  developing: { text: "Em desenvolvimento", color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  operational: { text: "Operacional", color: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30" },
  advanced: { text: "Avançado", color: "bg-accent-green/10 text-accent-green border-accent-green/30" },
};

const categoryAccent: Record<string, string> = {
  content: "bg-accent-purple/10 text-accent-purple border-accent-purple/30",
  intelligence: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  publishing: "bg-accent-green/10 text-accent-green border-accent-green/30",
  decision: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  sales: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  retention: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  analytics: "bg-blue-500/10 text-blue-300 border-blue-500/30",
};

const FALLBACK_HANDLERS: SkillHandlerSummary[] = [
  { slug: "copywriter-persuasivo", title: "Copywriter Persuasivo", category: "content", version: "1.0.0", supportsAutonomous: true },
  { slug: "detector-tendencias", title: "Detector de Tendências", category: "intelligence", version: "1.0.0", supportsAutonomous: true },
  { slug: "auto-publisher", title: "Auto-Publisher", category: "publishing", version: "1.0.0", supportsAutonomous: true },
  { slug: "judge-revisor", title: "LLM-as-Judge · Revisor", category: "decision", version: "1.0.0", supportsAutonomous: true },
  { slug: "prospeccao-outbound", title: "Prospecção Outbound", category: "sales", version: "1.0.0", supportsAutonomous: true },
  { slug: "follow-up-strategist", title: "Follow-Up Strategist", category: "retention", version: "1.0.0", supportsAutonomous: true },
];

interface WorkerStats {
  enqueued: number;
  processed: number;
  failed: number;
  pendingCount: number;
  lastProcessedAt: string | null;
  mode: "bullmq" | "in-memory";
  pendingJobs: Array<{ publishKey: string; channel: string; scheduledAtIso: string }>;
}

const FALLBACK_WORKER: WorkerStats = {
  enqueued: 0,
  processed: 0,
  failed: 0,
  pendingCount: 0,
  lastProcessedAt: null,
  mode: "in-memory",
  pendingJobs: [],
};

const SAMPLE_INPUTS: Record<string, unknown> = {
  "copywriter-persuasivo": {
    productName: "Pack A² Nexus",
    productType: "pack",
    audience: "Afiliados digitais iniciantes",
    pain: "falta de previsibilidade em vendas",
    outcome: "primeiras 10 vendas em 30 dias",
    priceLabel: "R$ 497",
    affiliateLink: "https://oneverso.com.br/cadastro",
    tone: "persuasive",
    channel: "instagram",
  },
  "detector-tendencias": {
    signals: [
      { title: "Curso de IA para creators", category: "infoproduto", platform: "hotmart", growthPct: 78, searchVolume: 12000, marginPct: 60, channelFit: 80, keywords: ["ia", "creator", "copy"] },
      { title: "Pack tráfego pago avançado", category: "infoproduto", platform: "hotmart", growthPct: 62, searchVolume: 8500, marginPct: 50, channelFit: 75, keywords: ["trafego", "ads", "copy"] },
      { title: "Mentoria afiliado expert", category: "infoproduto", platform: "hotmart", growthPct: 55, searchVolume: 6200, marginPct: 55, channelFit: 70, keywords: ["afiliado", "mentoria"] },
    ],
  },
  "judge-revisor": {
    artifact: {
      kind: "copywriter-output",
      headline: "Primeiras 10 vendas em 30 dias — método definitivo para afiliados iniciantes",
      body: "Para afiliados que querem previsibilidade: o Pack A² entrega o sistema sem rodeios.\n\nDecida agora.",
      cta: { label: "Quero meu acesso", link: "https://oneverso.com.br/cadastro" },
      hashtags: ["#Nexus", "#IOAID", "#Afiliados"],
      riskFlags: [],
      channel: "instagram",
    },
  },
  "auto-publisher": {
    drafts: [
      {
        headline: "Primeiras 10 vendas em 30 dias",
        body: "Para afiliados iniciantes que querem previsibilidade. Pack A² resolve.",
        cta: { label: "Quero acesso", link: "https://oneverso.com.br/cadastro" },
        hashtags: ["#Nexus", "#IOAID"],
        hooks: [],
        riskFlags: [],
        qualityHint: 85,
      },
    ],
    channels: ["instagram", "whatsapp"],
    horizonDays: 3,
  },
  "prospeccao-outbound": {
    productName: "Pack A² Nexus",
    productBenefit: "primeiras vendas previsíveis em 30 dias",
    prospects: [
      { name: "João Silva", audienceFit: 85, recentEngagement: 70, buyingPower: 60, preferredChannel: "whatsapp", optIn: true },
      { name: "Ana Lima", audienceFit: 72, recentEngagement: 55, buyingPower: 65, preferredChannel: "email", optIn: true },
    ],
  },
  "follow-up-strategist": {
    productName: "Pack A² Nexus",
    productBenefit: "sistema completo de afiliado",
    contacts: [
      { name: "Carlos Souza", lastInteraction: new Date(Date.now() - 14 * 86400000).toISOString(), lastOutcome: "opened", ticketValue: 497, preferredChannel: "whatsapp", lifecycleStage: "lead" },
      { name: "Beatriz Mendes", lastInteraction: new Date(Date.now() - 90 * 86400000).toISOString(), lastOutcome: "churned", ticketValue: 997, preferredChannel: "email", lifecycleStage: "former_customer" },
    ],
  },
};

const FALLBACK_TELEMETRY: TelemetrySnapshot = {
  sampleSize: 0,
  autonomousTasksPct: 0,
  manualApprovalPct: 0,
  avgLatencyMs: 0,
  activeChannels: 0,
  skillsExercised: [],
  judgeAccuracyPct: null,
  judgeSampleSize: 0,
  windowSizeMax: 200,
  judgeWindowSizeMax: 50,
};

const FALLBACK_AUTONOMY: AutonomyResult = {
  score: 32,
  band: "low",
  breakdown: [
    { label: "Tarefas autônomas", weight: 30, contribution: 0, rawValue: 0, description: "% sem intervenção humana" },
    { label: "Acurácia do Judge", weight: 20, contribution: 0, rawValue: 0, description: "Média do LLM-as-Judge" },
    { label: "Cobertura operacional", weight: 15, contribution: 15, rawValue: 100, description: "% de skills com handler" },
    { label: "Latência média", weight: 15, contribution: 9, rawValue: 60, description: "Tempo de resposta" },
    { label: "Aprovação manual", weight: 10, contribution: 0, rawValue: 0, description: "% de saídas aprovadas" },
    { label: "Diversidade de canais", weight: 10, contribution: 8, rawValue: 80, description: "Canais ativos" },
  ],
  notes: ["Backend Render ainda não publicado — exibindo dados de fallback."],
  generatedAt: new Date().toISOString(),
};

async function postTrpcMutation<T>(procedure: string, input: unknown): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${getTrpcBaseUrl()}/${procedure}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ slug: (input as any)?.slug, input: (input as any)?.input, autonomyAllowed: true }),
    });
    const json = await response.json();
    if (!response.ok) {
      return { data: null, error: json?.error?.message ?? `HTTP ${response.status}` };
    }
    return { data: (json?.result?.data as T) ?? null, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export default function AdminRuntime() {
  const [handlers, setHandlers] = useState<SkillHandlerSummary[]>(FALLBACK_HANDLERS);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(FALLBACK_TELEMETRY);
  const [autonomy, setAutonomy] = useState<AutonomyResult>(FALLBACK_AUTONOMY);
  const [worker, setWorker] = useState<WorkerStats>(FALLBACK_WORKER);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{ slug: string; success: boolean; message: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [h, t, a, w] = await Promise.all([
      fetchTrpcQuery<{ total: number; handlers: SkillHandlerSummary[] }>("agentSkillsRuntime.listHandlers"),
      fetchTrpcQuery<TelemetrySnapshot>("agentSkillsRuntime.telemetry"),
      fetchTrpcQuery<AutonomyResult>("agentSkillsRuntime.autonomyScore"),
      fetchTrpcQuery<WorkerStats>("agentSkillsRuntime.workerStats"),
    ]);
    const anyResponse = Boolean(h || t || a || w);
    setBackendOnline(anyResponse);
    if (h?.handlers) setHandlers(h.handlers);
    if (t) setTelemetry(t);
    if (a) setAutonomy(a);
    if (w) setWorker(w);
    setLastSync(new Date().toISOString());
    setLoading(false);
  };

  const runSkill = async (slug: string) => {
    if (!SAMPLE_INPUTS[slug]) {
      setLastRun({ slug, success: false, message: "Sem input de exemplo cadastrado." });
      return;
    }
    setRunning(slug);
    setLastRun(null);
    const { data, error } = await postTrpcMutation<{ success: boolean; decision: string; message?: string }>(
      "agentSkillsRuntime.execute",
      { slug, input: SAMPLE_INPUTS[slug] },
    );
    if (error) {
      setLastRun({ slug, success: false, message: error });
    } else if (data) {
      setLastRun({
        slug,
        success: data.success,
        message: data.message ?? `Decisão: ${data.decision}`,
      });
    }
    setRunning(null);
    void refresh();
  };

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalHandlers = handlers.length;
  const totalCatalog = 45; // catálogo planejado IOAID
  const coveragePct = Math.round((totalHandlers / totalCatalog) * 100);
  const workerSuccessRate =
    worker.processed + worker.failed > 0
      ? Math.round((worker.processed / (worker.processed + worker.failed)) * 100)
      : null;

  const judgeAccuracyLabel = useMemo(() => {
    if (telemetry.judgeAccuracyPct === null) return "—";
    return `${telemetry.judgeAccuracyPct}%`;
  }, [telemetry.judgeAccuracyPct]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Runtime Operacional · Skills</h1>
            <p className="text-sm text-text-secondary mt-1">
              Catálogo de skills com handler real, telemetria ao vivo e Autonomy Score consolidado.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 border ${
                  backendOnline
                    ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${backendOnline ? "bg-accent-green" : "bg-yellow-400"}`} />
                {backendOnline ? "Backend Render conectado" : "Backend offline · exibindo fallback"}
              </span>
              {lastSync && (
                <span className="text-text-secondary">
                  Última sincronização: {new Date(lastSync).toLocaleTimeString("pt-BR")}
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => void refresh()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-accent-cyan/30 bg-accent-cyan/5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent-cyan">
              <Gauge className="h-4 w-4" /> Autonomy Score
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{autonomy.score}</span>
              <span className="text-sm text-text-secondary">/100</span>
            </div>
            <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs ${bandLabel[autonomy.band].color}`}>
              {bandLabel[autonomy.band].text}
            </span>
          </Card>

          <Card className="p-5 border-accent-purple/30 bg-accent-purple/5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent-purple">
              <Cpu className="h-4 w-4" /> Skills operacionais
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{totalHandlers}</span>
              <span className="text-sm text-text-secondary">/{totalCatalog}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Cobertura {coveragePct}% do catálogo IOAID
            </p>
          </Card>

          <Card className="p-5 border-accent-green/30 bg-accent-green/5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent-green">
              <Activity className="h-4 w-4" /> Execuções (janela)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{telemetry.sampleSize}</span>
              <span className="text-sm text-text-secondary">/{telemetry.windowSizeMax}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Latência média {telemetry.avgLatencyMs}ms · {telemetry.activeChannels} canais
            </p>
          </Card>

          <Card className="p-5 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-yellow-300">
              <ShieldCheck className="h-4 w-4" /> LLM-as-Judge
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{judgeAccuracyLabel}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {telemetry.judgeSampleSize} avaliações na janela ({telemetry.judgeWindowSizeMax} max)
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-cyan" /> Catálogo operacional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {handlers.map((handler) => (
              <div
                key={handler.slug}
                className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{handler.title}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${categoryAccent[handler.category] ?? "border-border text-text-secondary"}`}
                  >
                    {handler.category}
                  </Badge>
                </div>
                <code className="text-[11px] text-text-secondary">{handler.slug}</code>
                <div className="flex items-center justify-between text-[11px] text-text-secondary">
                  <span>v{handler.version}</span>
                  {handler.supportsAutonomous && (
                    <span className="inline-flex items-center gap-1 text-accent-green">
                      <ShieldCheck className="h-3 w-3" /> autônomo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Breakdown do Autonomy Score</h2>
          <div className="space-y-3">
            {autonomy.breakdown.map((item) => {
              const pct = Math.round((item.contribution / item.weight) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="text-text-secondary">
                      {item.contribution}/{item.weight} pts
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-green"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary">{item.description}</p>
                </div>
              );
            })}
          </div>
          {autonomy.notes.length > 0 && (
            <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3 text-[11px] text-text-secondary space-y-1">
              {autonomy.notes.map((note) => (
                <p key={note}>· {note}</p>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Play className="h-4 w-4 text-accent-green" /> Execução manual de skills
            </h2>
            <p className="text-[11px] text-text-secondary max-w-md">
              Dispara cada handler com um input de exemplo. Requer sessão admin server-side ativa quando o
              backend Render estiver publicado.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {handlers.map((handler) => (
              <div
                key={`run-${handler.slug}`}
                className="rounded-xl border border-border/60 bg-background/40 p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{handler.title}</span>
                  <Badge variant="outline" className={`text-[10px] ${categoryAccent[handler.category] ?? "border-border"}`}>
                    {handler.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={running === handler.slug || !SAMPLE_INPUTS[handler.slug]}
                  onClick={() => void runSkill(handler.slug)}
                  className="gap-2"
                >
                  <Send className="h-3 w-3" />
                  {running === handler.slug ? "Executando..." : "Executar com input demo"}
                </Button>
              </div>
            ))}
          </div>
          {lastRun && (
            <div
              className={`mt-4 rounded-xl border px-3 py-2 text-xs ${
                lastRun.success
                  ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              <strong>{lastRun.slug}</strong> · {lastRun.message}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-cyan" /> Worker Auto-Publisher
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase text-text-secondary">Modo</p>
              <p className="text-sm font-semibold text-foreground">{worker.mode}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase text-text-secondary">Enfileirados</p>
              <p className="text-sm font-semibold text-foreground">{worker.enqueued}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase text-text-secondary">Processados</p>
              <p className="text-sm font-semibold text-foreground">{worker.processed}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase text-text-secondary">Taxa de sucesso</p>
              <p className="text-sm font-semibold text-foreground">{workerSuccessRate ?? "—"}{workerSuccessRate !== null ? "%" : ""}</p>
            </div>
          </div>
          {worker.pendingJobs.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-text-secondary">Próximas publicações ({worker.pendingCount})</p>
              <div className="space-y-1">
                {worker.pendingJobs.map((job) => (
                  <div
                    key={job.publishKey}
                    className="flex items-center justify-between rounded-md border border-border/40 bg-background/30 px-3 py-1.5 text-[11px]"
                  >
                    <code className="text-text-secondary">{job.publishKey}</code>
                    <span className="text-foreground">{job.channel}</span>
                    <span className="text-text-secondary">{new Date(job.scheduledAtIso).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-secondary">Nenhuma publicação pendente na fila.</p>
          )}
        </Card>

        {telemetry.skillsExercised.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Skills exercitadas na janela</h2>
            <div className="flex flex-wrap gap-2">
              {telemetry.skillsExercised.map((slug) => (
                <code
                  key={slug}
                  className="text-[11px] rounded-md border border-border/60 bg-background/40 px-2 py-1 text-text-secondary"
                >
                  {slug}
                </code>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
