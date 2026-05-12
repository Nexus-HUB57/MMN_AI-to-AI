import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueueStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
}

export default function Dashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedQueue, setSelectedQueue] = useState<'content_generation' | 'marketplace_sync' | 'order_processing' | 'commission_processing'>('content_generation');

  // Fetch queue status
  const { data: queueStatus, refetch: refetchQueueStatus } = trpc.orchestration.getQueueStatus.useQuery(undefined, {
    refetchInterval: refreshInterval,
  });

  // Fetch queue jobs
  const { data: queueJobs } = trpc.orchestration.getQueueJobs.useQuery(
    {
      queueName: selectedQueue,
      limit: 20,
    },
    {
      refetchInterval: refreshInterval,
    }
  );

  // Fetch scheduled tasks
  const { data: scheduledTasks } = trpc.orchestration.getScheduledTasks.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch goal history
  const { data: goalHistory } = trpc.orchestration.getGoalHistory.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (!queueStatus) {
    return <div className="p-8">Carregando...</div>;
  }

  const queues = queueStatus.queues;
  const totalPending = Object.values(queues).reduce((sum, q) => sum + q.pending, 0);
  const totalActive = Object.values(queues).reduce((sum, q) => sum + q.active, 0);
  const totalCompleted = Object.values(queues).reduce((sum, q) => sum + q.completed, 0);
  const totalFailed = Object.values(queues).reduce((sum, q) => sum + q.failed, 0);

  // Dados para gráficos
  const queueChartData = [
    {
      name: 'Content Gen',
      pending: queues.content_generation.pending,
      active: queues.content_generation.active,
      completed: queues.content_generation.completed,
      failed: queues.content_generation.failed,
    },
    {
      name: 'Marketplace',
      pending: queues.marketplace_sync.pending,
      active: queues.marketplace_sync.active,
      completed: queues.marketplace_sync.completed,
      failed: queues.marketplace_sync.failed,
    },
    {
      name: 'Orders',
      pending: queues.order_processing.pending,
      active: queues.order_processing.active,
      completed: queues.order_processing.completed,
      failed: queues.order_processing.failed,
    },
    {
      name: 'Commissions',
      pending: queues.commission_processing.pending,
      active: queues.commission_processing.active,
      completed: queues.commission_processing.completed,
      failed: queues.commission_processing.failed,
    },
  ];

  const statusPieData = [
    { name: 'Pendentes', value: totalPending, color: '#fbbf24' },
    { name: 'Ativos', value: totalActive, color: '#3b82f6' },
    { name: 'Concluídos', value: totalCompleted, color: '#10b981' },
    { name: 'Falhados', value: totalFailed, color: '#ef4444' },
  ];

  const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Orquestração</h1>
            <p className="text-slate-400">Monitoramento de agentes autônomos e filas de tarefas</p>
          </div>
          <Button
            onClick={() => refetchQueueStatus()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{totalPending}</div>
              <p className="text-xs text-slate-400 mt-1">Jobs aguardando processamento</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{totalActive}</div>
              <p className="text-xs text-slate-400 mt-1">Jobs em processamento</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{totalCompleted}</div>
              <p className="text-xs text-slate-400 mt-1">Jobs completados com sucesso</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Falhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{totalFailed}</div>
              <p className="text-xs text-slate-400 mt-1">Jobs com erro</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Status das Filas</CardTitle>
              <CardDescription>Distribuição de jobs por fila</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="pending" fill="#fbbf24" />
                  <Bar dataKey="active" fill="#3b82f6" />
                  <Bar dataKey="completed" fill="#10b981" />
                  <Bar dataKey="failed" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição Geral</CardTitle>
              <CardDescription>Total de jobs por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="jobs" className="text-slate-300 data-[state=active]:text-white">
              Jobs da Fila
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-slate-300 data-[state=active]:text-white">
              Metas
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="text-slate-300 data-[state=active]:text-white">
              Agendador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Jobs da Fila: {selectedQueue}</CardTitle>
                    <CardDescription>Últimos 20 jobs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing'] as const).map(
                      (queue) => (
                        <Button
                          key={queue}
                          variant={selectedQueue === queue ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedQueue(queue)}
                          className="text-xs"
                        >
                          {queue.split('_')[0]}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-4 text-slate-300">ID</th>
                        <th className="text-left py-2 px-4 text-slate-300">Nome</th>
                        <th className="text-left py-2 px-4 text-slate-300">Status</th>
                        <th className="text-left py-2 px-4 text-slate-300">Tentativas</th>
                        <th className="text-left py-2 px-4 text-slate-300">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueJobs && queueJobs.length > 0 ? (
                        queueJobs.map((job: unknown, idx: number) => {
                          const j = job as Record<string, unknown>;
                          return (
                            <tr key={`${String(j.id)}-${idx}`} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-2 px-4 text-slate-300 font-mono text-xs">{String(j.id).slice(0, 8)}</td>
                              <td className="py-2 px-4 text-slate-300">{String(j.name)}</td>
                              <td className="py-2 px-4">
                                <Badge variant="outline" className="text-xs">
                                  {j.failedReason ? 'Falhado' : 'Ativo'}
                                </Badge>
                              </td>
                              <td className="py-2 px-4 text-slate-300">{String(j.attempts)}</td>
                              <td className="py-2 px-4 text-slate-400 text-xs">
                                {new Date(Number(j.timestamp) || 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-slate-400">
                            Nenhum job encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Metas</CardTitle>
                <CardDescription>Metas de orquestração criadas</CardDescription>
              </CardHeader>
              <CardContent>
                {goalHistory && goalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {goalHistory && goalHistory.map((goal: unknown) => {
                      const g = goal as Record<string, unknown>;
                      return (
                        <div key={String(g.id)} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-white">{String(g.title)}</h3>
                              <p className="text-sm text-slate-400 mt-1">{String(g.description)}</p>
                            </div>
                            <Badge
                              variant={
                                g.status === 'completed'
                                  ? 'default'
                                  : g.status === 'failed'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {String(g.status)}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-400">
                            <span>Prioridade: {String(g.priority)}</span>
                            <span>Criada em: {new Date(String(g.createdAt)).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400">Nenhuma meta criada ainda</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduler" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tarefas Agendadas</CardTitle>
                <CardDescription>Cron jobs em execução</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledTasks && scheduledTasks.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {(scheduledTasks.tasks as string[]).map((task: string, idx: number) => (
                      <div key={`${task}-${idx}`} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-300 font-mono text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-400">Nenhuma tarefa agendada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
