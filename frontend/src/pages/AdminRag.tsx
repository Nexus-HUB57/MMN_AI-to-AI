import { useMemo, useState } from "react";
import { Database, RefreshCw, Search, ShieldCheck, TimerReset, Activity, FileStack } from "lucide-react";
import { toast } from "sonner";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SCOPES = ["all", "academia", "lab", "lib", "ebook", "telemetry", "skill-manifest"] as const;
type Scope = typeof SCOPES[number];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("pt-BR");
}

function formatJson(value: unknown) {
  if (!value) return "{}";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AdminRag() {
  const [scope, setScope] = useState<Scope>("all");
  const statsQuery = trpc.nexusRag.stats.useQuery(undefined, { refetchInterval: 30000 });
  const runsQuery = trpc.nexusRag.runs.useQuery({ limit: 20 }, { refetchInterval: 30000 });
  const reindexMutation = trpc.nexusRag.reindex.useMutation({
    onSuccess(data: any) {
      toast.success(`Reindexação disparada: ${data?.scope || scope}`);
      runsQuery.refetch();
      statsQuery.refetch();
    },
    onError(error: any) {
      toast.error(error?.message || "Falha ao disparar reindexação do RAG");
    },
  });

  const stats = statsQuery.data;
  const runs = Array.isArray(runsQuery.data) ? runsQuery.data : [];

  const latestRun = runs[0] || null;
  const successRate = useMemo(() => {
    if (!runs.length) return 0;
    const ok = runs.filter((run: any) => run?.status === "ok").length;
    return Math.round((ok / runs.length) * 100);
  }, [runs]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin RAG</h1>
            <p className="text-sm text-slate-600">
              Observabilidade do corpus, saúde do backend vetorial e histórico de reindexações.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                statsQuery.refetch();
                runsQuery.refetch();
              }}
              disabled={statsQuery.isFetching || runsQuery.isFetching}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button
              onClick={() => reindexMutation.mutate({ scope })}
              disabled={reindexMutation.isPending}
            >
              <TimerReset className="mr-2 h-4 w-4" /> Reindexar {scope}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Backend vetorial</span>
              <Database className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{stats?.backend || "—"}</div>
            <p className="mt-2 text-xs text-slate-500">Modelo {stats?.embeddingModelVersion || "não informado"}</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Fontes indexadas</span>
              <FileStack className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{Number(stats?.sources || 0).toLocaleString("pt-BR")}</div>
            <p className="mt-2 text-xs text-slate-500">Corpus canônico disponível para busca</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Chunks vetoriais</span>
              <Search className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{Number(stats?.chunks || 0).toLocaleString("pt-BR")}</div>
            <p className="mt-2 text-xs text-slate-500">Fragmentos semânticos consultáveis</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Saúde dos runs</span>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{successRate}%</div>
            <p className="mt-2 text-xs text-slate-500">Baseado nos {runs.length} últimos registros</p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Últimos runs</h2>
                <p className="text-sm text-slate-500">Auditoria de ingestões, reindexações e execuções do pipeline.</p>
              </div>
              <Badge variant="secondary">{runs.length} registros</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {runsQuery.isLoading ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Carregando histórico do RAG...
                </div>
              ) : runs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Ainda não existem runs registrados no histórico do RAG.
                </div>
              ) : (
                runs.map((run: any) => {
                  const statusTone = run?.status === "ok"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : run?.status === "failed"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";
                  return (
                    <div key={run?.runId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={statusTone}>{String(run?.status || "unknown")}</Badge>
                            <Badge variant="outline">{String(run?.jobType || "run")}</Badge>
                            <Badge variant="secondary">scope: {String(run?.scope || "n/a")}</Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Início: <span className="font-medium text-slate-900">{formatDate(run?.startedAt)}</span>
                            <span className="mx-2">•</span>
                            Fim: <span className="font-medium text-slate-900">{formatDate(run?.finishedAt)}</span>
                          </p>
                          {run?.error ? <p className="text-sm text-red-600">Erro: {String(run.error)}</p> : null}
                        </div>
                        <div className="min-w-[220px] rounded-lg bg-slate-950 p-3 text-xs text-slate-100 overflow-auto">
                          <pre>{formatJson(run?.stats)}</pre>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Activity className="h-4 w-4" />
                <h2 className="text-lg font-semibold">Resumo operacional</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Runs persistidos</span>
                  <strong className="text-slate-900">{Number(stats?.runs || runs.length || 0).toLocaleString("pt-BR")}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Último run</span>
                  <strong className="text-slate-900">{latestRun ? formatDate(latestRun.startedAt) : "—"}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Último status</span>
                  <strong className="text-slate-900">{latestRun?.status || "—"}</strong>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">Reindexação manual</h2>
              <p className="mt-2 text-sm text-slate-500">
                Selecione o escopo que deseja reindexar. Use <strong>all</strong> apenas quando houver alteração estrutural do corpus.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SCOPES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setScope(item)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${scope === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Escopo selecionado: <strong>{scope}</strong>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
