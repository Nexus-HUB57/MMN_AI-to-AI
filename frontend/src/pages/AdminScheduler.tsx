import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, RefreshCw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminScheduler() {
  const { data: scheduledTasks, isLoading, refetch } = trpc.orchestration.getScheduledTasks.useQuery();

  const handleRunNow = (taskName: string) => {
    toast.info(`Iniciando execução manual de: ${taskName}`);
    // Aqui viria a chamada para executar agora, se houvesse a rota
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Agendamentos do Sistema</h3>
            <p className="text-sm text-gray-600">Gerencie as tarefas automáticas e recorrentes</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <p>Carregando agendamentos...</p>
          ) : scheduledTasks?.tasks.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum agendamento ativo</h3>
              <p className="text-gray-500">O sistema não possui tarefas agendadas no momento.</p>
            </Card>
          ) : (
            scheduledTasks?.tasks.map((task: string) => (
              <Card key={task} className="overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 capitalize">
                        {task.replace(/-/g, ' ')}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ativo
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Execução automática baseada em cron
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleRunNow(task)}>
                      <Play size={14} />
                      Executar Agora
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-amber-600 hover:text-amber-700">
                      <Pause size={14} />
                      Pausar
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">
                    Última execução: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">
                    Ver logs de execução
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
