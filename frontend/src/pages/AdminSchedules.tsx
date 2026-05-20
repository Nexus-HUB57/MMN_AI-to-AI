import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ListTodo,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  TimerReset,
  ToggleLeft,
  ToggleRight,
  Workflow,
  XCircle,
} from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const HISTORY_PAGE_SIZE = 6;

type EnabledFilter = "all" | "enabled" | "disabled";
type HistoryStatusFilter = "all" | "completed" | "failed" | "running";

type CronJobRow = {
  id: number;
  name: string;
  description?: string | null;
  jobType: string;
  queueName: string;
  frequency: string;
  cronExpression?: string | null;
  enabled: boolean;
  nextRunAt?: string | Date | null;
  lastRunAt?: string | Date | null;
  lastRunStatus?: string | null;
  lastRunError?: string | null;
  lastRunDuration?: number | null;
  runCount?: number;
  successCount?: number;
  failureCount?: number;
};

type CronHistoryRow = {
  id: number;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  duration?: number | null;
  status: "running" | "completed" | "failed" | string;
  errorMessage?: string | null;
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
};

const formatDuration = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(1)} s`;
};

const statusMeta: Record<string, { label: string; className: string }> = {
  completed: { label: "Concluído", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  running: { label: "Em execução", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  scheduled: { label: "Agendado", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  cancelled: { label: "Cancelado", className: "bg-slate-200 text-slate-700 hover:bg-slate-200" },
};

const enabledMeta = {
  true: { label: "Ativo", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  false: { label: "Pausado", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
};

const quickLinks = [
  {
    title: "Orquestrador operacional",
    description: "Cruzar rotinas cron com filas e metas do ambiente agentic.",
    href: "/orchestrator",
  },
  {
    title: "Logs administrativos",
    description: "Investigar falhas operacionais e jobs com comportamento anômalo.",
    href: "/admin/logs",
  },
  {
    title: "Calendário de conteúdo",
    description: "Relacionar jobs agendados com a cadência editorial e publicações.",
    href: "/content/calendar",
  },
];

export default function AdminSchedules() {
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>("all");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const jobsQuery = trpc.cron.list.useQuery(
    {
      page: 1,
      limit: 12,
      enabled:
        enabledFilter === "all" ? undefined : enabledFilter === "enabled",
    },
    { refetchInterval: 30000 }
  );

  const statsQuery = trpc.cron.getStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const upcomingQuery = trpc.cron.getUpcomingExecutions.useQuery(
    { limit: 6 },
    { refetchInterval: 30000 }
  );

  const historyQuery = trpc.cron.getHistory.useQuery(
    {
      cronJobId: selectedJobId || 0,
      page: 1,
      limit: HISTORY_PAGE_SIZE,
      status: historyStatusFilter === "all" ? undefined : historyStatusFilter,
    },
    {
      enabled: !!selectedJobId,
      refetchInterval: selectedJobId ? 30000 : false,
    }
  );

  const runNowMutation = trpc.cron.runNow.useMutation({
    onSuccess: async () => {
      toast.success("Execução manual registrada com sucesso");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível executar o job agora");
    },
  });

  const toggleJobMutation = trpc.cron.update.useMutation({
    onSuccess: async (_, variables) => {
      toast.success(variables.enabled ? "Job ativado com sucesso" : "Job pausado com sucesso");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível atualizar o job");
    },
  });

  const jobs = useMemo(() => (jobsQuery.data?.jobs || []) as CronJobRow[], [jobsQuery.data?.jobs]);
  const history = useMemo(() => (historyQuery.data?.history || []) as CronHistoryRow[], [historyQuery.data?.history]);
  const upcoming = useMemo(() => (upcomingQuery.data || []) as CronJobRow[], [upcomingQuery.data]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  useEffect(() => {
    if (!jobs.length) {
      setSelectedJobId(null);
      return;
    }

    const stillExists = jobs.some((job) => job.id === selectedJobId);
    if (!selectedJobId || !stillExists) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const refreshAll = async () => {
    await Promise.all([
      jobsQuery.refetch(),
      statsQuery.refetch(),
      upcomingQuery.refetch(),
      selectedJobId ? historyQuery.refetch() : Promise.resolve(),
    ]);
  };

  const visibleSummary = useMemo(() => {
    const enabledCount = jobs.filter((job) => job.enabled).length;
    const pausedCount = jobs.filter((job) => !job.enabled).length;
    const failedCount = jobs.filter((job) => job.lastRunStatus === "failed").length;
    return {
      enabledCount,
      pausedCount,
      failedCount,
    };
  }, [jobs]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarClock className="text-blue-600" size={22} />
                  <h1 className="text-2xl font-bold text-slate-900">Agendamentos e automação Cron</h1>
                </div>
                <p className="max-w-2xl text-sm text-slate-600">
                  Entrada administrativa para supervisionar rotinas recorrentes, próximas execuções, histórico operacional
                  e disparos manuais do domínio Cron já integrado ao backend.
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Backoffice + Cron</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <Workflow size={18} />
                  <span className="font-medium">Objetivo operacional</span>
                </div>
                <p className="text-sm text-slate-600">
                  Conectar o módulo administrativo de agendamentos ao router `trpc.cron.*` com visão mais próxima da operação real.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <Clock3 size={18} />
                  <span className="font-medium">Cadência de atualização</span>
                </div>
                <p className="text-sm text-slate-600">
                  Jobs, estatísticas, histórico e próximas execuções são revalidados automaticamente a cada 30 segundos.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <ShieldCheck size={18} />
                  <span className="font-medium">Uso administrativo</span>
                </div>
                <p className="text-sm text-slate-600">
                  Permite inspecionar jobs, pausar ou reativar rotinas e registrar execuções manuais quando necessário.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Atalhos relacionados</h2>
            <div className="space-y-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-900">{item.title}</span>
                    <ExternalLink size={16} className="text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarClock size={18} />
              <span className="text-sm">Jobs cadastrados</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{statsQuery.data?.totalJobs ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">{visibleSummary.enabledCount} ativos na listagem atual</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Execuções concluídas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">{statsQuery.data?.completedExecutions ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Baseado no histórico agregado do módulo Cron</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={18} />
              <span className="text-sm">Execuções com falha</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-700">{statsQuery.data?.failedExecutions ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">{visibleSummary.failedCount} falhas visíveis na grade atual</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <TimerReset size={18} />
              <span className="text-sm">Duração média</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-700">{formatDuration(statsQuery.data?.avgDurationMs)}</p>
            <p className="mt-1 text-xs text-slate-500">{visibleSummary.pausedCount} jobs pausados na listagem atual</p>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Rotinas cadastradas</h2>
                <p className="text-sm text-slate-500">Controle rápido para ativação, pausa e execução manual.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="min-w-[190px]">
                  <Select value={enabledFilter} onValueChange={(value: EnabledFilter) => setEnabledFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os jobs</SelectItem>
                      <SelectItem value="enabled">Somente ativos</SelectItem>
                      <SelectItem value="disabled">Somente pausados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={refreshAll} disabled={jobsQuery.isFetching || statsQuery.isFetching}>
                  <RefreshCw size={16} className="mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {jobsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Carregando rotinas Cron...</p>
            ) : jobs.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-4 py-3 font-semibold text-slate-900">Job</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Fila</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Frequência</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Próxima execução</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Última execução</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const enabledBadge = enabledMeta[String(job.enabled) as "true" | "false"];
                      const executionBadge = statusMeta[job.lastRunStatus || "scheduled"] || statusMeta.scheduled;
                      const isRunning = runNowMutation.isPending && runNowMutation.variables?.id === job.id;
                      const isToggling = toggleJobMutation.isPending && toggleJobMutation.variables?.id === job.id;

                      return (
                        <tr
                          key={job.id}
                          className={`border-b border-slate-100 transition hover:bg-slate-50 ${selectedJobId === job.id ? "bg-blue-50/60" : ""}`}
                        >
                          <td className="px-4 py-4 align-top">
                            <button className="text-left" onClick={() => setSelectedJobId(job.id)}>
                              <p className="font-medium text-slate-900">{job.name}</p>
                              <p className="text-xs text-slate-500">{job.jobType}</p>
                            </button>
                          </td>
                          <td className="px-4 py-4 align-top text-sm text-slate-600">{job.queueName}</td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-sm font-medium text-slate-900">{job.frequency}</p>
                            <p className="text-xs text-slate-500">{job.cronExpression || "sem expressão customizada"}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-col gap-2">
                              <Badge className={enabledBadge.className}>{enabledBadge.label}</Badge>
                              <Badge className={executionBadge.className}>{executionBadge.label}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-sm text-slate-600">{formatDateTime(job.nextRunAt)}</td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-sm text-slate-600">{formatDateTime(job.lastRunAt)}</p>
                            <p className="text-xs text-slate-500">{formatDuration(job.lastRunDuration)}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedJobId(job.id)}>
                                Histórico
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => runNowMutation.mutate({ id: job.id })}
                                disabled={isRunning}
                              >
                                <PlayCircle size={16} className="mr-2" />
                                {isRunning ? "Executando..." : "Executar agora"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleJobMutation.mutate({ id: job.id, enabled: !job.enabled })}
                                disabled={isToggling}
                              >
                                {job.enabled ? (
                                  <ToggleLeft size={16} className="mr-2 text-amber-600" />
                                ) : (
                                  <ToggleRight size={16} className="mr-2 text-green-600" />
                                )}
                                {job.enabled ? "Pausar" : "Ativar"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum job encontrado para o filtro selecionado.</p>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock size={18} className="text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Próximas execuções</h2>
              </div>
              {upcomingQuery.isLoading ? (
                <p className="text-sm text-slate-500">Carregando agenda futura...</p>
              ) : upcoming.length ? (
                <div className="space-y-3">
                  {upcoming.map((job) => (
                    <div key={job.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{job.name}</p>
                          <p className="text-xs text-slate-500">{job.jobType}</p>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{job.frequency}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{formatDateTime(job.nextRunAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhuma próxima execução encontrada.</p>
              )}
            </Card>

            <Card className="border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ListTodo size={18} className="text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Próximos passos da frente</h2>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="rounded-lg bg-slate-50 p-3">1. Adicionar criação e edição de cron jobs diretamente no Backoffice.</li>
                <li className="rounded-lg bg-slate-50 p-3">2. Integrar logs detalhados de execução com a central administrativa de logs.</li>
                <li className="rounded-lg bg-slate-50 p-3">3. Relacionar cada rotina a filas, módulos financeiros e cadências editoriais.</li>
              </ol>
            </Card>
          </div>
        </section>

        <section>
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Histórico do job selecionado</h2>
                <p className="text-sm text-slate-500">
                  {selectedJob ? `Visão detalhada de ${selectedJob.name}.` : "Selecione um job para inspecionar o histórico."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="min-w-[190px]">
                  <Select value={historyStatusFilter} onValueChange={(value: HistoryStatusFilter) => setHistoryStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar histórico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo o histórico</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="failed">Falhos</SelectItem>
                      <SelectItem value="running">Em execução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedJob ? (
                  <Button variant="outline" size="sm" onClick={() => historyQuery.refetch()} disabled={historyQuery.isFetching}>
                    <RefreshCw size={16} className="mr-2" />
                    Atualizar histórico
                  </Button>
                ) : null}
              </div>
            </div>

            {!selectedJob ? (
              <p className="text-sm text-slate-500">Nenhum job selecionado.</p>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedJob.name}</h3>
                      <p className="text-sm text-slate-500">{selectedJob.jobType}</p>
                    </div>
                    <Badge className={enabledMeta[String(selectedJob.enabled) as "true" | "false"].className}>
                      {enabledMeta[String(selectedJob.enabled) as "true" | "false"].label}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Descrição</p>
                      <p className="mt-1">{selectedJob.description || "Sem descrição operacional cadastrada."}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Fila</p>
                        <p className="mt-1 font-medium text-slate-900">{selectedJob.queueName}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Frequência</p>
                        <p className="mt-1 font-medium text-slate-900">{selectedJob.frequency}</p>
                        <p className="text-xs text-slate-500">{selectedJob.cronExpression || "sem expressão customizada"}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Execuções</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">{selectedJob.runCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Sucessos</p>
                        <p className="mt-1 text-xl font-semibold text-green-700">{selectedJob.successCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Falhas</p>
                        <p className="mt-1 text-xl font-semibold text-red-700">{selectedJob.failureCount ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {historyQuery.isLoading ? (
                    <p className="text-sm text-slate-500">Carregando histórico operacional...</p>
                  ) : history.length ? (
                    <div className="space-y-3">
                      {history.map((entry) => {
                        const meta = statusMeta[entry.status] || statusMeta.scheduled;
                        return (
                          <div key={entry.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className={meta.className}>{meta.label}</Badge>
                                  <span className="text-xs text-slate-500">#{entry.id}</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">Início: {formatDateTime(entry.startedAt)}</p>
                                <p className="text-sm text-slate-600">Conclusão: {formatDateTime(entry.completedAt)}</p>
                              </div>
                              <div className="text-sm text-slate-600">
                                <p>Duração: <span className="font-medium text-slate-900">{formatDuration(entry.duration)}</span></p>
                              </div>
                            </div>
                            {entry.errorMessage ? (
                              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                                {entry.errorMessage}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum histórico encontrado para o filtro atual.</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
