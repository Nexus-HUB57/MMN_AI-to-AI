import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  Gauge,
  ListTodo,
  PlayCircle,
  PlusCircle,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  SquarePen,
  TimerReset,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Workflow,
  XCircle,
  ShieldAlert,
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const HISTORY_PAGE_SIZE = 6;
const SETTINGS_KEYS = {
  timezone: "cron_timezone",
  alertsChannel: "cron_alerts_channel",
  maintenanceWindow: "cron_maintenance_window",
} as const;
const CUSTOM_TEMPLATE_KEY = "__custom__";

type EnabledFilter = "all" | "enabled" | "disabled";
type HistoryStatusFilter = "all" | "completed" | "failed" | "running";
type CronFrequency = "minute" | "hourly" | "daily" | "weekly" | "monthly";

type CronJobRow = {
  id: number;
  name: string;
  description?: string | null;
  jobType: string;
  queueName: string;
  frequency: CronFrequency | string;
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
  jobPayload?: Record<string, unknown> | null;
};

type CronHistoryRow = {
  id: number;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  duration?: number | null;
  status: "running" | "completed" | "failed" | string;
  errorMessage?: string | null;
};

type CronTemplate = {
  name: string;
  description?: string;
  jobType: string;
  queueName: string;
  frequency: CronFrequency;
};

type JobFormState = {
  id?: number;
  name: string;
  description: string;
  jobType: string;
  queueName: string;
  frequency: CronFrequency;
  cronExpression: string;
  enabled: boolean;
  jobPayload: string;
};

type SettingsFormState = {
  timezone: string;
  alertsChannel: string;
  maintenanceWindow: string;
};

const defaultJobForm: JobFormState = {
  name: "",
  description: "",
  jobType: "",
  queueName: "",
  frequency: "daily",
  cronExpression: "",
  enabled: true,
  jobPayload: "{}",
};

const defaultSettingsForm: SettingsFormState = {
  timezone: "America/Sao_Paulo",
  alertsChannel: "ops-admin",
  maintenanceWindow: "Domingo 02:00-04:00",
};

const frequencyOptions: Array<{ value: CronFrequency; label: string }> = [
  { value: "minute", label: "A cada minuto" },
  { value: "hourly", label: "A cada hora" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
];

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

type JobHealthStatus = "healthy" | "degraded" | "critical" | "idle";

const healthMeta: Record<JobHealthStatus, { label: string; className: string }> = {
  healthy: { label: "Saudável", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  degraded: { label: "Degradado", className: "bg-amber-100 text-amber-900 hover:bg-amber-100" },
  critical: { label: "Crítico", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  idle: { label: "Sem execuções", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
};

type JobSlaIndicator = {
  jobType: string;
  jobName?: string;
  queueName?: string;
  enabled: boolean;
  lastRunStatus?: string | null;
  totalRuns7d: number;
  totalRuns30d: number;
  successRate7d: number;
  successRate30d: number;
  failureCount7d: number;
  failureCount30d: number;
  p95DurationMs7d: number | null;
  p95DurationMs30d: number | null;
  avgDurationMs30d: number | null;
  consecutiveFailures: number;
  isStuck: boolean;
  stuckSinceMinutes?: number;
  healthStatus: JobHealthStatus;
  healthReason?: string;
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
};

type CronAlertSeverity = "warning" | "critical";
type CronAlertType =
  | "cron_critical_failures"
  | "cron_stuck_job"
  | "cron_degraded_success_rate";

type CronAlert = {
  id: string;
  jobType: string;
  jobName?: string;
  alertType: CronAlertType;
  severity: CronAlertSeverity;
  title: string;
  message: string;
  detectedAt: string;
  acknowledgedAt?: string;
  metadata: Record<string, unknown>;
};

const alertSeverityMeta: Record<CronAlertSeverity, { label: string; className: string; chipClassName: string }> = {
  critical: {
    label: "Crítico",
    className: "border-red-200 bg-red-50",
    chipClassName: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  warning: {
    label: "Atenção",
    className: "border-amber-200 bg-amber-50",
    chipClassName: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  },
};

const alertTypeLabel: Record<CronAlertType, string> = {
  cron_critical_failures: "Falhas consecutivas",
  cron_stuck_job: "Job travado",
  cron_degraded_success_rate: "Sucesso degradado",
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
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobDialogMode, setJobDialogMode] = useState<"create" | "edit">("create");
  const [jobForm, setJobForm] = useState<JobFormState>(defaultJobForm);
  const [templateKey, setTemplateKey] = useState(CUSTOM_TEMPLATE_KEY);
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(defaultSettingsForm);

  const jobsQuery = trpc.cron.list.useQuery(
    {
      page: 1,
      limit: 12,
      enabled: enabledFilter === "all" ? undefined : enabledFilter === "enabled",
    },
    { refetchInterval: 30000 }
  );
  const statsQuery = trpc.cron.getStats.useQuery(undefined, { refetchInterval: 30000 });
  const upcomingQuery = trpc.cron.getUpcomingExecutions.useQuery({ limit: 6 }, { refetchInterval: 30000 });
  const settingsQuery = trpc.cron.getSettings.useQuery(undefined, { refetchInterval: 30000 });
  const templatesQuery = trpc.cron.getTemplates.useQuery();
  const slaQuery = trpc.cron.getSlaSnapshot.useQuery(undefined, { refetchInterval: 60000 });
  const alertsQuery = trpc.cron.getActiveAlerts.useQuery(undefined, { refetchInterval: 60000 });
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

  const refreshAll = async () => {
    await Promise.all([
      jobsQuery.refetch(),
      statsQuery.refetch(),
      upcomingQuery.refetch(),
      settingsQuery.refetch(),
      templatesQuery.refetch(),
      slaQuery.refetch(),
      alertsQuery.refetch(),
      selectedJobId ? historyQuery.refetch() : Promise.resolve(),
    ]);
  };

  const evaluateAlertsMutation = trpc.cron.evaluateAlerts.useMutation({
    onSuccess: async (result) => {
      const novos = result.newAlerts.length;
      if (novos > 0) {
        toast.warning(`${novos} novo(s) alerta(s) cron emitido(s)`);
      } else {
        toast.success("Avaliação concluída — nenhum alerta novo");
      }
      await alertsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível avaliar os alertas");
    },
  });

  const acknowledgeAlertMutation = trpc.cron.acknowledgeAlert.useMutation({
    onSuccess: async () => {
      toast.success("Alerta reconhecido");
      await alertsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível reconhecer o alerta");
    },
  });

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

  const createJobMutation = trpc.cron.create.useMutation({
    onSuccess: async (created) => {
      toast.success("Job cron criado com sucesso");
      setIsJobDialogOpen(false);
      setSelectedJobId(created.id);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível criar o job");
    },
  });

  const updateJobMutation = trpc.cron.update.useMutation({
    onSuccess: async (updated) => {
      toast.success("Job cron atualizado com sucesso");
      setIsJobDialogOpen(false);
      if (updated?.id) {
        setSelectedJobId(updated.id);
      }
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível atualizar o job");
    },
  });

  const deleteJobMutation = trpc.cron.delete.useMutation({
    onSuccess: async () => {
      toast.success("Job removido com sucesso");
      setSelectedJobId(null);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível remover o job");
    },
  });

  const updateSettingsMutation = trpc.cron.updateSettings.useMutation({
    onSuccess: async () => {
      toast.success("Configurações cron atualizadas");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível salvar as configurações");
    },
  });

  const jobs = useMemo(() => (jobsQuery.data?.jobs || []) as CronJobRow[], [jobsQuery.data?.jobs]);
  const history = useMemo(() => (historyQuery.data?.history || []) as CronHistoryRow[], [historyQuery.data?.history]);
  const upcoming = useMemo(() => (upcomingQuery.data || []) as CronJobRow[], [upcomingQuery.data]);
  const templates = useMemo(() => (templatesQuery.data || []) as CronTemplate[], [templatesQuery.data]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) || null, [jobs, selectedJobId]);

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

  useEffect(() => {
    const data = settingsQuery.data;
    if (!data) return;

    setSettingsForm({
      timezone: data[SETTINGS_KEYS.timezone] || defaultSettingsForm.timezone,
      alertsChannel: data[SETTINGS_KEYS.alertsChannel] || defaultSettingsForm.alertsChannel,
      maintenanceWindow: data[SETTINGS_KEYS.maintenanceWindow] || defaultSettingsForm.maintenanceWindow,
    });
  }, [settingsQuery.data]);

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

  const openCreateDialog = () => {
    setJobDialogMode("create");
    setTemplateKey(CUSTOM_TEMPLATE_KEY);
    setJobForm(defaultJobForm);
    setIsJobDialogOpen(true);
  };

  const openEditDialog = (job: CronJobRow) => {
    setJobDialogMode("edit");
    setTemplateKey(CUSTOM_TEMPLATE_KEY);
    setJobForm({
      id: job.id,
      name: job.name,
      description: job.description || "",
      jobType: job.jobType,
      queueName: job.queueName,
      frequency: (job.frequency as CronFrequency) || "daily",
      cronExpression: job.cronExpression || "",
      enabled: job.enabled,
      jobPayload: job.jobPayload ? JSON.stringify(job.jobPayload, null, 2) : "{}",
    });
    setIsJobDialogOpen(true);
  };

  const applyTemplate = (value: string) => {
    setTemplateKey(value);
    if (value === CUSTOM_TEMPLATE_KEY) return;

    const template = templates.find((item) => item.jobType === value);
    if (!template) return;

    setJobForm((current) => ({
      ...current,
      name: current.name || template.name,
      description: current.description || template.description || "",
      jobType: template.jobType,
      queueName: template.queueName,
      frequency: template.frequency,
    }));
  };

  const parseJobPayload = () => {
    const rawValue = jobForm.jobPayload.trim();
    if (!rawValue) return undefined;

    try {
      const parsed = JSON.parse(rawValue);
      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        throw new Error("Payload precisa ser um objeto JSON");
      }
      return parsed as Record<string, unknown>;
    } catch {
      throw new Error("Payload precisa ser um JSON válido em formato de objeto");
    }
  };

  const handleSaveJob = () => {
    if (!jobForm.name.trim() || !jobForm.jobType.trim() || !jobForm.queueName.trim()) {
      toast.error("Preencha nome, tipo do job e fila antes de salvar");
      return;
    }

    let parsedPayload: Record<string, unknown> | undefined;
    try {
      parsedPayload = parseJobPayload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payload inválido");
      return;
    }

    const payload = {
      name: jobForm.name.trim(),
      description: jobForm.description.trim() || undefined,
      jobType: jobForm.jobType.trim(),
      queueName: jobForm.queueName.trim(),
      frequency: jobForm.frequency,
      cronExpression: jobForm.cronExpression.trim() || undefined,
      enabled: jobForm.enabled,
      jobPayload: parsedPayload,
    };

    if (jobDialogMode === "create") {
      createJobMutation.mutate(payload);
      return;
    }

    if (!jobForm.id) {
      toast.error("Job inválido para edição");
      return;
    }

    updateJobMutation.mutate({ id: jobForm.id, ...payload });
  };

  const handleDeleteJob = (job: CronJobRow) => {
    if (!window.confirm(`Remover o job "${job.name}" e todo o histórico relacionado?`)) {
      return;
    }

    deleteJobMutation.mutate({ id: job.id });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      settings: {
        [SETTINGS_KEYS.timezone]: settingsForm.timezone.trim(),
        [SETTINGS_KEYS.alertsChannel]: settingsForm.alertsChannel.trim(),
        [SETTINGS_KEYS.maintenanceWindow]: settingsForm.maintenanceWindow.trim(),
      },
    });
  };

  const isSavingJob = createJobMutation.isPending || updateJobMutation.isPending;

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
                  Entrada administrativa para supervisionar rotinas recorrentes, próximas execuções, histórico operacional,
                  criação e edição de jobs do domínio Cron já integrado ao backend.
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
                  Permite cadastrar novas rotinas, pausar ou reativar jobs e registrar execuções manuais quando necessário.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
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

            <Card className="border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 size={18} className="text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Configurações operacionais</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cron-timezone">Timezone</Label>
                  <Input
                    id="cron-timezone"
                    value={settingsForm.timezone}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, timezone: event.target.value }))}
                    placeholder="America/Sao_Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cron-alerts">Canal de alertas</Label>
                  <Input
                    id="cron-alerts"
                    value={settingsForm.alertsChannel}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, alertsChannel: event.target.value }))}
                    placeholder="ops-admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cron-maintenance">Janela de manutenção</Label>
                  <Input
                    id="cron-maintenance"
                    value={settingsForm.maintenanceWindow}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, maintenanceWindow: event.target.value }))}
                    placeholder="Domingo 02:00-04:00"
                  />
                </div>
                <Button className="w-full" onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
                  <Save size={16} className="mr-2" />
                  {updateSettingsMutation.isPending ? "Salvando..." : "Salvar configurações"}
                </Button>
              </div>
            </Card>
          </div>
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

        <section>
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Alertas operacionais ativos</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Notificações para administradores são emitidas automaticamente a cada 5 minutos. Reconheça um alerta para silenciá-lo enquanto ele permanecer ativo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alertsQuery.refetch()}
                  disabled={alertsQuery.isFetching}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Atualizar
                </Button>
                <Button
                  size="sm"
                  onClick={() => evaluateAlertsMutation.mutate({})}
                  disabled={evaluateAlertsMutation.isPending}
                >
                  <BellRing size={16} className="mr-2" />
                  {evaluateAlertsMutation.isPending ? "Avaliando..." : "Avaliar agora"}
                </Button>
              </div>
            </div>

            {alertsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Carregando alertas...</p>
            ) : !alertsQuery.data || alertsQuery.data.alerts.length === 0 ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Nenhum alerta crítico ou degradado no momento. Última avaliação:{" "}
                {alertsQuery.data?.evaluatedAt ? formatDateTime(alertsQuery.data.evaluatedAt) : "—"}.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {(alertsQuery.data.alerts as CronAlert[])
                  .slice()
                  .sort((a, b) => {
                    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
                    return a.jobType.localeCompare(b.jobType);
                  })
                  .map((alert) => {
                    const meta = alertSeverityMeta[alert.severity];
                    const isAcknowledged = Boolean(alert.acknowledgedAt);
                    return (
                      <div key={alert.id} className={`rounded-xl border p-4 ${meta.className}`}>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={meta.chipClassName}>{meta.label}</Badge>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{alertTypeLabel[alert.alertType]}</Badge>
                              {isAcknowledged ? (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reconhecido</Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{alert.title}</p>
                            <p className="text-sm text-slate-700">{alert.message}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              Detectado em {formatDateTime(alert.detectedAt)}
                              {alert.acknowledgedAt ? ` • reconhecido em ${formatDateTime(alert.acknowledgedAt)}` : null}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                            disabled={isAcknowledged || acknowledgeAlertMutation.isPending}
                          >
                            <CheckCircle2 size={16} className="mr-2" />
                            {isAcknowledged ? "Já reconhecido" : "Reconhecer"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Gauge size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Indicadores de SLA por job</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Taxa de sucesso, p95 de duração, falhas consecutivas e jobs travados — janelas de 7 e 30 dias.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => slaQuery.refetch()} disabled={slaQuery.isFetching}>
                <RefreshCw size={16} className="mr-2" />
                {slaQuery.isFetching ? "Atualizando..." : "Atualizar SLA"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Activity size={18} />
                  <span className="text-sm">Execuções 30d</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{slaQuery.data?.global.totalRuns30d ?? 0}</p>
                <p className="text-xs text-slate-500">{slaQuery.data?.global.enabledJobs ?? 0} jobs ativos</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 size={18} />
                  <span className="text-sm">Taxa média de sucesso 30d</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-green-800">{formatPercentage(slaQuery.data?.global.avgSuccessRate30d)}</p>
                <p className="text-xs text-slate-600">{slaQuery.data?.global.healthyJobs ?? 0} jobs saudáveis</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle size={18} />
                  <span className="text-sm">Jobs degradados</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-amber-900">{slaQuery.data?.global.degradedJobs ?? 0}</p>
                <p className="text-xs text-slate-600">Sucesso 7d &lt; 80% ou falhas isoladas</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <Flame size={18} />
                  <span className="text-sm">Jobs críticos</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-red-800">{slaQuery.data?.global.criticalJobs ?? 0}</p>
                <p className="text-xs text-slate-600">{slaQuery.data?.global.stuckJobs ?? 0} jobs travados em execução</p>
              </div>
            </div>

            <div className="mt-6">
              {slaQuery.isLoading ? (
                <p className="text-sm text-slate-500">Calculando indicadores de SLA...</p>
              ) : !slaQuery.data || slaQuery.data.jobs.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum job cadastrado para análise de SLA.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2">Job</th>
                        <th className="px-3 py-2">Saúde</th>
                        <th className="px-3 py-2">Sucesso 7d / 30d</th>
                        <th className="px-3 py-2">Falhas 7d / 30d</th>
                        <th className="px-3 py-2">p95 7d / 30d</th>
                        <th className="px-3 py-2">Consecutivas</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(slaQuery.data.jobs as JobSlaIndicator[])
                        .slice()
                        .sort((a, b) => {
                          const priority: Record<JobHealthStatus, number> = {
                            critical: 0,
                            degraded: 1,
                            healthy: 2,
                            idle: 3,
                          };
                          return priority[a.healthStatus] - priority[b.healthStatus];
                        })
                        .map((indicator) => {
                          const meta = healthMeta[indicator.healthStatus];
                          return (
                            <tr key={indicator.jobType} className="border-b border-slate-100 transition hover:bg-slate-50">
                              <td className="px-3 py-3 align-top">
                                <p className="font-medium text-slate-900">{indicator.jobName || indicator.jobType}</p>
                                <p className="text-xs text-slate-500">{indicator.jobType}</p>
                              </td>
                              <td className="px-3 py-3 align-top">
                                <Badge className={meta.className}>{meta.label}</Badge>
                                {indicator.healthReason ? (
                                  <p className="mt-1 text-xs text-slate-500">{indicator.healthReason}</p>
                                ) : null}
                              </td>
                              <td className="px-3 py-3 align-top text-sm text-slate-700">
                                <p className="font-medium">{formatPercentage(indicator.successRate7d)}</p>
                                <p className="text-xs text-slate-500">{formatPercentage(indicator.successRate30d)} (30d)</p>
                              </td>
                              <td className="px-3 py-3 align-top text-sm text-slate-700">
                                <p className="font-medium">{indicator.failureCount7d}</p>
                                <p className="text-xs text-slate-500">{indicator.failureCount30d} (30d)</p>
                              </td>
                              <td className="px-3 py-3 align-top text-sm text-slate-700">
                                <p className="font-medium">{formatDuration(indicator.p95DurationMs7d)}</p>
                                <p className="text-xs text-slate-500">{formatDuration(indicator.p95DurationMs30d)} (30d)</p>
                              </td>
                              <td className="px-3 py-3 align-top text-sm text-slate-700">
                                <p
                                  className={
                                    indicator.consecutiveFailures > 0
                                      ? "font-semibold text-red-700"
                                      : "font-medium text-slate-700"
                                  }
                                >
                                  {indicator.consecutiveFailures}
                                </p>
                                <p className="text-xs text-slate-500">desde o último sucesso</p>
                              </td>
                              <td className="px-3 py-3 align-top text-sm text-slate-700">
                                <p>{indicator.enabled ? "Ativo" : "Pausado"}</p>
                                <p className="text-xs text-slate-500">
                                  {indicator.isStuck ? `Travado há ${indicator.stuckSinceMinutes ?? "?"} min` : "—"}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Rotinas cadastradas</h2>
                <p className="text-sm text-slate-500">Controle rápido para criação, ativação, pausa e execução manual.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                <Button size="sm" onClick={openCreateDialog}>
                  <PlusCircle size={16} className="mr-2" />
                  Novo job
                </Button>
              </div>
            </div>

            {jobsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Carregando rotinas Cron...</p>
            ) : jobs.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px]">
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
                      const isDeleting = deleteJobMutation.isPending && deleteJobMutation.variables?.id === job.id;

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
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(job)}>
                                <SquarePen size={16} className="mr-2" />
                                Editar
                              </Button>
                              <Button size="sm" onClick={() => runNowMutation.mutate({ id: job.id })} disabled={isRunning}>
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
                              <Button variant="outline" size="sm" onClick={() => handleDeleteJob(job)} disabled={isDeleting}>
                                <Trash2 size={16} className="mr-2 text-red-600" />
                                Remover
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
                <li className="rounded-lg bg-slate-50 p-3">1. Integrar logs detalhados de execução com a central administrativa de logs.</li>
                <li className="rounded-lg bg-slate-50 p-3">2. Relacionar cada rotina a filas, módulos financeiros e cadências editoriais.</li>
                <li className="rounded-lg bg-slate-50 p-3">3. Expor indicadores de SLA e alertas operacionais por domínio.</li>
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
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Payload</p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">
                        {selectedJob.jobPayload ? JSON.stringify(selectedJob.jobPayload, null, 2) : "{}"}
                      </pre>
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
                    {selectedJob.lastRunError ? (
                      <div className="rounded-xl bg-red-50 p-4 text-red-800">
                        <p className="text-xs uppercase tracking-wide">Último erro registrado</p>
                        <p className="mt-1 text-sm">{selectedJob.lastRunError}</p>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedJob)}>
                        <SquarePen size={16} className="mr-2" />
                        Editar job
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteJob(selectedJob)}>
                        <Trash2 size={16} className="mr-2 text-red-600" />
                        Remover job
                      </Button>
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
                                <p>
                                  Duração: <span className="font-medium text-slate-900">{formatDuration(entry.duration)}</span>
                                </p>
                              </div>
                            </div>
                            {entry.errorMessage ? (
                              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{entry.errorMessage}</div>
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

      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{jobDialogMode === "create" ? "Novo job cron" : "Editar job cron"}</DialogTitle>
            <DialogDescription>
              Cadastre ou ajuste rotinas recorrentes com tipo, fila, frequência, payload e expressão cron opcional.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-template">Template operacional</Label>
              <Select value={templateKey} onValueChange={applyTemplate}>
                <SelectTrigger id="job-template">
                  <SelectValue placeholder="Selecionar template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CUSTOM_TEMPLATE_KEY}>Personalizado</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.jobType} value={template.jobType}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-name">Nome</Label>
              <Input
                id="job-name"
                value={jobForm.name}
                onChange={(event) => setJobForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex.: Processamento de pagamentos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-type">Tipo do job</Label>
              <Input
                id="job-type"
                value={jobForm.jobType}
                onChange={(event) => setJobForm((current) => ({ ...current, jobType: event.target.value }))}
                placeholder="payment_processing"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-description">Descrição</Label>
              <Textarea
                id="job-description"
                value={jobForm.description}
                onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Contexto operacional do job"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-queue">Fila</Label>
              <Input
                id="job-queue"
                value={jobForm.queueName}
                onChange={(event) => setJobForm((current) => ({ ...current, queueName: event.target.value }))}
                placeholder="payments_queue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-frequency">Frequência</Label>
              <Select
                value={jobForm.frequency}
                onValueChange={(value: CronFrequency) => setJobForm((current) => ({ ...current, frequency: value }))}
              >
                <SelectTrigger id="job-frequency">
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-cron-expression">Expressão cron personalizada</Label>
              <Input
                id="job-cron-expression"
                value={jobForm.cronExpression}
                onChange={(event) => setJobForm((current) => ({ ...current, cronExpression: event.target.value }))}
                placeholder="0 */4 * * *"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-payload">Payload JSON</Label>
              <Textarea
                id="job-payload"
                className="min-h-[180px] font-mono"
                value={jobForm.jobPayload}
                onChange={(event) => setJobForm((current) => ({ ...current, jobPayload: event.target.value }))}
                placeholder='{"force": true}'
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-enabled">Status inicial</Label>
              <Select
                value={jobForm.enabled ? "enabled" : "disabled"}
                onValueChange={(value: "enabled" | "disabled") =>
                  setJobForm((current) => ({ ...current, enabled: value === "enabled" }))
                }
              >
                <SelectTrigger id="job-enabled">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Ativo</SelectItem>
                  <SelectItem value="disabled">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveJob} disabled={isSavingJob}>
              <Save size={16} className="mr-2" />
              {isSavingJob ? "Salvando..." : jobDialogMode === "create" ? "Criar job" : "Salvar alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}
