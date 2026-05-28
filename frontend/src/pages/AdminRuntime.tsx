import { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Cpu,
  Gauge,
  RefreshCw,
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
};

const FALLBACK_HANDLERS: SkillHandlerSummary[] = [
  { slug: "copywriter-persuasivo", title: "Copywriter Persuasivo", category: "content", version: "1.0.0", supportsAutonomous: true },
  { slug: "detector-tendencias", title: "Detector de Tendências", category: "intelligence", version: "1.0.0", supportsAutonomous: true },
  { slug: "auto-publisher", title: "Auto-Publisher", category: "publishing", version: "1.0.0", supportsAutonomous: true },
  { slug: "judge-revisor", title: "LLM-as-Judge · Revisor", category: "decision", version: "1.0.0", supportsAutonomous: true },
  { slug: "prospeccao-outbound", title: "Prospecção Outbound", category: "sales", version: "1.0.0", supportsAutonomous: true },
];

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

export default function AdminRuntime() {
  const [handlers, setHandlers] = useState<SkillHandlerSummary[]>(FALLBACK_HANDLERS);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(FALLBACK_TELEMETRY);
  const [autonomy, setAutonomy] = useState<AutonomyResult>(FALLBACK_AUTONOMY);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [h, t, a] = await Promise.all([
      fetchTrpcQuery<{ total: number; handlers: SkillHandlerSummary[] }>("agentSkillsRuntime.listHandlers"),
      fetchTrpcQuery<TelemetrySnapshot>("agentSkillsRuntime.telemetry"),
      fetchTrpcQuery<AutonomyResult>("agentSkillsRuntime.autonomyScore"),
    ]);
    const anyResponse = Boolean(h || t || a);
    setBackendOnline(anyResponse);
    if (h?.handlers) setHandlers(h.handlers);
    if (t) setTelemetry(t);
    if (a) setAutonomy(a);
    setLastSync(new Date().toISOString());
    setLoading(false);
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
