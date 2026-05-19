import { Link } from "wouter";
import { CalendarClock, CheckCircle2, Clock3, ExternalLink, ListTodo, Workflow } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const QUICK_LINKS = [
  {
    title: "Orquestrador operacional",
    description: "Monitorar filas, metas e o histórico de execução do ambiente agentic.",
    href: "/orchestrator",
  },
  {
    title: "Calendário de conteúdo",
    description: "Acompanhar o pipeline editorial e a cadência de publicações planejadas.",
    href: "/content/calendar",
  },
  {
    title: "Logs administrativos",
    description: "Cruzar falhas e eventos operacionais com a supervisão do Backoffice.",
    href: "/admin/logs",
  },
];

export default function AdminSchedules() {
  const queueStatus = trpc.orchestration.getQueueStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const recentLogs = trpc.logs.getLogs.useQuery({
    limit: 5,
    offset: 0,
  });

  const queueCards = queueStatus.data
    ? [
        {
          label: "Fila de conteúdo",
          pending: queueStatus.data.contentGeneration.pending,
          active: queueStatus.data.contentGeneration.active,
          failed: queueStatus.data.contentGeneration.failed,
        },
        {
          label: "Fila de marketplace",
          pending: queueStatus.data.marketplaceSync.pending,
          active: queueStatus.data.marketplaceSync.active,
          failed: queueStatus.data.marketplaceSync.failed,
        },
        {
          label: "Fila de pedidos",
          pending: queueStatus.data.orderProcessing.pending,
          active: queueStatus.data.orderProcessing.active,
          failed: queueStatus.data.orderProcessing.failed,
        },
        {
          label: "Fila de comissões",
          pending: queueStatus.data.commissionProcessing.pending,
          active: queueStatus.data.commissionProcessing.active,
          failed: queueStatus.data.commissionProcessing.failed,
        },
      ]
    : [];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarClock className="text-blue-600" size={22} />
                  <h1 className="text-2xl font-bold text-slate-900">Agendamentos e cadência operacional</h1>
                </div>
                <p className="max-w-2xl text-sm text-slate-600">
                  Esta área consolida a entrada administrativa para supervisão de agendamentos, filas e rotinas
                  recorrentes enquanto a Fase 1 do Backoffice Admin evolui para uma experiência unificada.
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Fase 1 em andamento</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <Workflow size={18} />
                  <span className="font-medium">Objetivo imediato</span>
                </div>
                <p className="text-sm text-slate-600">
                  Unificar a navegação administrativa e reduzir pontos órfãos no Backoffice.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <Clock3 size={18} />
                  <span className="font-medium">Ritmo de operação</span>
                </div>
                <p className="text-sm text-slate-600">
                  As filas são atualizadas automaticamente a cada 30 segundos para dar visibilidade mínima.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={18} />
                  <span className="font-medium">Saída esperada</span>
                </div>
                <p className="text-sm text-slate-600">
                  Operação administrativa com rota oficial para dashboard, logs e supervisão de agenda.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Atalhos operacionais</h2>
            <div className="space-y-3">
              {QUICK_LINKS.map((item) => (
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

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Status das filas</h2>
                <p className="text-sm text-slate-500">Baseado no orquestrador oficial da aplicação.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => queueStatus.refetch()} disabled={queueStatus.isFetching}>
                {queueStatus.isFetching ? "Atualizando..." : "Atualizar agora"}
              </Button>
            </div>

            {queueStatus.isLoading ? (
              <p className="text-sm text-slate-500">Carregando status das filas...</p>
            ) : queueCards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {queueCards.map((queue) => (
                  <div key={queue.label} className="rounded-xl border border-slate-200 p-4">
                    <h3 className="mb-3 font-medium text-slate-900">{queue.label}</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-amber-50 p-3 text-center">
                        <p className="text-slate-500">Pendentes</p>
                        <p className="text-lg font-semibold text-amber-700">{queue.pending}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-slate-500">Ativos</p>
                        <p className="text-lg font-semibold text-blue-700">{queue.active}</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 text-center">
                        <p className="text-slate-500">Falhas</p>
                        <p className="text-lg font-semibold text-red-700">{queue.failed}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum dado de fila disponível no momento.</p>
            )}
          </Card>

          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ListTodo size={18} className="text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Próximos passos da fase</h2>
            </div>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="rounded-lg bg-slate-50 p-3">1. Conectar o módulo de agendamentos sociais ao Backoffice sem dependência do painel de agente.</li>
              <li className="rounded-lg bg-slate-50 p-3">2. Unificar permissões administrativas para logs, agenda e conteúdo.</li>
              <li className="rounded-lg bg-slate-50 p-3">3. Criar visão consolidada de posts agendados, metas e filas críticas.</li>
            </ol>
          </Card>
        </section>

        <section>
          <Card className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Últimos logs operacionais</h2>
                <p className="text-sm text-slate-500">Amostra rápida para tomada de decisão administrativa.</p>
              </div>
              <Link href="/admin/logs">
                <Button variant="outline" size="sm">Abrir central de logs</Button>
              </Link>
            </div>

            {recentLogs.isLoading ? (
              <p className="text-sm text-slate-500">Carregando logs recentes...</p>
            ) : recentLogs.data?.logs?.length ? (
              <div className="space-y-3">
                {recentLogs.data.logs.map((log: any) => (
                  <div key={log.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{log.queueName}</p>
                      <p className="text-sm text-slate-500">{log.jobType} • {log.jobId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          log.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : log.status === "failed"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                        }
                      >
                        {log.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {log.startedAt ? new Date(log.startedAt).toLocaleString("pt-BR") : "sem horário"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum log encontrado para exibição rápida.</p>
            )}
          </Card>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
