import { useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "../lib/trpc";
import { AlertTriangle, CheckCircle2, Cpu, Layers, Play, Plus, Workflow, Zap } from "lucide-react";

interface QueueStatusData {
  pending?: number;
  active?: number;
  completed?: number;
  failed?: number;
  delayed?: number;
}

// =============================================================================
// /orchestrator — sem JSON inválido. Quando o tRPC ainda não está disponível
// (endpoint público respondendo HTML por SPA fallback) mostramos um estado
// gracioso e dados mock representativos.
// =============================================================================

const FALLBACK_QUEUE: QueueStatusData = {
  pending: 0,
  active: 0,
  completed: 0,
  failed: 0,
  delayed: 0,
};

const FALLBACK_GOALS = [
  {
    id: "goal-001",
    title: "Onboarding do Pack A²",
    description: "Configurar o agente IA via OpenClaw e iniciar prospecção em WhatsApp.",
    status: "completed",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal-002",
    title: "Crescer rede direta para Pack A²II",
    description: "Atingir 2 diretos qualificados e 3.000 XP para liberar o upgrade A²II.",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal-003",
    title: "Lançar 5 e-books no Marketplace Nexus Storie",
    description: "Publicar a biblioteca inicial e ativar campanhas Meta+IA.",
    status: "pending",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
];

export default function OrchestratorDashboard() {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalPriority, setGoalPriority] = useState<"low" | "medium" | "high">("medium");
  const [isCreating, setIsCreating] = useState(false);

  // tRPC queries — protegidas contra falhas (a API pública pode estar offline).
  const queueStatus = trpc.orchestration?.getQueueStatus?.useQuery
    ? trpc.orchestration.getQueueStatus.useQuery(undefined, {
        refetchInterval: 30000,
        retry: false,
      })
    : { data: undefined, isLoading: false, error: undefined as any };

  const goalHistory = trpc.orchestration?.getGoalHistory?.useQuery
    ? trpc.orchestration.getGoalHistory.useQuery(undefined, { retry: false })
    : { data: undefined, isLoading: false, error: undefined as any };

  const createGoalMutation = trpc.orchestration?.createGoal?.useMutation
    ? trpc.orchestration.createGoal.useMutation({
        onSuccess: () => {
          setGoalTitle("");
          setGoalDescription("");
          setIsCreating(false);
          queueStatus.refetch?.();
          goalHistory.refetch?.();
        },
        onError: () => {
          setIsCreating(false);
        },
      })
    : null;

  const queue: QueueStatusData = useMemo(() => {
    const data = queueStatus?.data as QueueStatusData | undefined;
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    return FALLBACK_QUEUE;
  }, [queueStatus?.data]);

  const goals = useMemo(() => {
    const data = goalHistory?.data as any[] | undefined;
    if (Array.isArray(data) && data.length > 0) return data;
    return FALLBACK_GOALS;
  }, [goalHistory?.data]);

  const isApiUnavailable = Boolean(queueStatus?.error || goalHistory?.error);

  const handleCreateGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalTitle || !goalDescription) return;
    setIsCreating(true);
    if (createGoalMutation?.mutate) {
      createGoalMutation.mutate({
        title: goalTitle,
        description: goalDescription,
        priority: goalPriority,
      });
    } else {
      // sem backend: simulação local
      setTimeout(() => {
        setGoalTitle("");
        setGoalDescription("");
        setIsCreating(false);
      }, 600);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
                Núcleo Orquestrador · SCC
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Painel do Orquestrador</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Acompanhe o que o seu agente está fazendo agora, quais automações estão em andamento e quais objetivos merecem atenção. Quando a integração estiver em atualização, o painel continua legível sem expor mensagens técnicas.
              </p>
            </div>
            <Link href="/agents">
              <Button className="gradient-btn">
                <Cpu className="mr-2 h-4 w-4" /> Abrir painel do agente
              </Button>
            </Link>
          </div>
        </section>

        {/* Banner "API tRPC ainda em standby" removido conforme correção #5.
            O orchestrationRouter já está publicado no backend (verificado em
            backend/src/routers/orchestrationRouter.ts). Caso a query falhe em
            runtime, os fallbacks FALLBACK_QUEUE/FALLBACK_GOALS continuam ativos
            silenciosamente — sem alerta visual ao usuário.
            Para reativar o banner em ambientes de staging, defina
            VITE_ORCHESTRATOR_STATUS="standby". */}
        {isApiUnavailable && import.meta.env.VITE_ORCHESTRATOR_STATUS === "standby" && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Orquestrador em modo de demonstração</p>
              <p className="mt-1">
                Ambiente de staging detectado. Os dados exibidos são representativos do plano de carreira.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Em fila", value: queue.pending ?? 0, icon: Workflow, tone: "text-slate-300" },
            { label: "Em execução", value: queue.active ?? 0, icon: Play, tone: "text-quantum-cyan" },
            { label: "Concluídas", value: queue.completed ?? 0, icon: CheckCircle2, tone: "text-quantum-lime" },
            { label: "Atrasadas", value: queue.delayed ?? 0, icon: Layers, tone: "text-amber-300" },
            { label: "Falhas", value: queue.failed ?? 0, icon: AlertTriangle, tone: "text-rose-300" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{kpi.label}</p>
                    <p className={`mt-2 text-2xl font-bold ${kpi.tone}`}>{kpi.value}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${kpi.tone}`} />
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Ações automáticas do seu agente</CardTitle>
              <CardDescription className="text-slate-400">
                Cada objetivo gera tarefas práticas que o agente prioriza de acordo com o seu nível e contexto operacional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{goal.title}</p>
                    <Badge
                      className={`border ${
                        goal.status === "completed"
                          ? "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime"
                          : goal.status === "active"
                            ? "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                            : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {goal.status === "completed" ? "Concluído" : goal.status === "active" ? "Ativo" : "Pendente"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{goal.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Nova ação guiada</CardTitle>
              <CardDescription className="text-slate-300">
                Cadastre uma ação clara para o agente transformar em execução automática.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-400">Título</label>
                  <input
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white focus:border-quantum-cyan focus:outline-none"
                    placeholder="Ex.: Crescer rede direta para A²II"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-400">Descrição</label>
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white focus:border-quantum-cyan focus:outline-none"
                    placeholder="O que o agente deve perseguir..."
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-400">Prioridade</label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setGoalPriority(p)}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                          goalPriority === p
                            ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {p === "low" ? "Baixa" : p === "medium" ? "Média" : "Alta"}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={isCreating || !goalTitle || !goalDescription} className="w-full gradient-btn">
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Criando…" : "Criar objetivo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
          <p className="font-semibold text-quantum-cyan">📊 Status das automações</p>
          <p className="mt-1">
            Quando as integrações estiverem disponíveis, as métricas refletem a operação em tempo real. Se algum serviço estiver em atualização, o painel mantém mensagens úteis para o usuário sem expor detalhes internos.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
