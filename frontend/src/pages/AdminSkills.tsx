import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  Bot,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import AdminDashboardLayout from "./AdminDashboardLayout";
import { Button } from "@/components/ui/button";

interface SkillHandlerSummary {
  slug: string;
  title: string;
  category: string;
  version: string;
  supportsAutonomous: boolean;
}

interface WorkerStats {
  enqueued: number;
  processed: number;
  failed: number;
  lastProcessedAt: string | null;
  mode: "bullmq" | "in-memory";
  pendingCount: number;
}

const getTrpcBaseUrl = () => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TRPC_URL) {
    return (import.meta as any).env.VITE_TRPC_URL as string;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/api/trpc`;
  }

  return "/api/trpc";
};

async function fetchTrpcQuery<T>(procedure: string): Promise<T | null> {
  if (typeof fetch === "undefined") return null;

  try {
    const response = await fetch(
      `${getTrpcBaseUrl()}/${procedure}?batch=1&input=${encodeURIComponent('{"0":null}')}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    const json = await response.json();
    if (!response.ok) return null;
    return (json?.[0]?.result?.data?.json ?? json?.result?.data?.json ?? json?.result?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export default function AdminSkills() {
  const [loading, setLoading] = useState(true);
  const [handlers, setHandlers] = useState<SkillHandlerSummary[]>([]);
  const [dispatcherStatus, setDispatcherStatus] = useState<Record<string, "real" | "stub">>({});
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [handlersResult, dispatcherResult, workerResult] = await Promise.all([
        fetchTrpcQuery<{ total: number; handlers: SkillHandlerSummary[] }>("agentSkillsRuntime.listHandlers"),
        fetchTrpcQuery<Record<string, "real" | "stub">>("agentSkillsRuntime.dispatcherStatus"),
        fetchTrpcQuery<WorkerStats>("agentSkillsRuntime.workerStats"),
      ]);

      setHandlers(handlersResult?.handlers ?? []);
      setDispatcherStatus(dispatcherResult ?? {});
      setWorkerStats(workerResult);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const dispatcherMetrics = useMemo(() => {
    const entries = Object.entries(dispatcherStatus);
    const real = entries.filter(([, mode]) => mode === "real").length;
    const stub = entries.filter(([, mode]) => mode === "stub").length;
    return { total: entries.length, real, stub };
  }, [dispatcherStatus]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent-cyan">admin · skills runtime</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground">Catálogo operacional de Skills</h1>
              <p className="mt-3 max-w-3xl text-sm text-text-secondary">
                Visão executiva do runtime agentic: handlers já operacionais, dispatchers reais vs. stub e status do worker de auto-publicação.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void load()}>
                <RefreshCw className="h-4 w-4" />
                Atualizar agora
              </Button>
              <Link href="/admin/runtime">
                <Button className="gradient-btn">
                  Abrir painel runtime
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Handlers operacionais",
              value: String(handlers.length),
              hint: "Skills com execução real no backend",
              icon: Bot,
            },
            {
              label: "Dispatchers reais",
              value: `${dispatcherMetrics.real}/${dispatcherMetrics.total || 1}`,
              hint: "Canais já conectados sem stub",
              icon: ShieldCheck,
            },
            {
              label: "Fila pendente",
              value: String(workerStats?.pendingCount ?? 0),
              hint: workerStats?.mode === "bullmq" ? "Processamento via Redis/BullMQ" : "Fallback in-memory ativo",
              icon: Cpu,
            },
            {
              label: "Execuções processadas",
              value: String(workerStats?.processed ?? 0),
              hint: workerStats?.lastProcessedAt
                ? `Última em ${new Date(workerStats.lastProcessedAt).toLocaleString("pt-BR")}`
                : "Ainda sem processamento concluído",
              icon: Activity,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-lg shadow-black/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <div className="rounded-xl bg-accent-cyan/10 p-2 text-accent-cyan">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-foreground">{item.value}</p>
                <p className="mt-2 text-xs text-text-muted">{item.hint}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg shadow-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Handlers ativos</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Lista publicada por <code>agentSkillsRuntime.listHandlers</code>.
                </p>
              </div>
              <div className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan">
                {loading ? "Atualizando..." : `${handlers.length} online`}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {handlers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-text-secondary">
                  Nenhum handler retornado pelo runtime neste momento.
                </div>
              ) : (
                handlers.map((handler) => (
                  <div
                    key={handler.slug}
                    className="rounded-2xl border border-border/50 bg-background/50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{handler.title}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          slug: <code>{handler.slug}</code> · categoria: {handler.category} · versão {handler.version}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-accent-green">
                          handler real
                        </span>
                        <span className="rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1 text-accent-purple">
                          {handler.supportsAutonomous ? "autônoma" : "assistida"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg shadow-black/5">
            <h2 className="text-xl font-semibold text-foreground">Dispatchers por canal</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Monitor rápido do mix entre integrações reais e stubs operacionais.
            </p>
            <div className="mt-5 space-y-3">
              {Object.entries(dispatcherStatus).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-5 text-sm text-text-secondary">
                  Dispatcher status indisponível no endpoint público.
                </div>
              ) : (
                Object.entries(dispatcherStatus).map(([channel, mode]) => (
                  <div key={channel} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{channel}</p>
                      <p className="text-xs text-text-muted">Canal de distribuição</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        mode === "real"
                          ? "border border-accent-green/30 bg-accent-green/10 text-accent-green"
                          : "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {mode === "real" ? "real" : "stub"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-4 text-sm text-text-secondary">
              Para replay, analytics e aprovações granulares, abra o painel detalhado em
              <Link href="/admin/runtime" className="ml-1 font-medium text-accent-cyan hover:underline">
                /admin/runtime
              </Link>
              .
            </div>
          </article>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
