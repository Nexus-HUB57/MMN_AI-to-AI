import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Brain, Activity, Settings, History, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminAgentDetails() {
  // Em um cenário real, pegaríamos o ID da URL
  const { data: agent, isLoading } = trpc.agents.getAgent.useQuery();

  if (isLoading) return <div className="p-8">Carregando detalhes do agente...</div>;
  if (!agent) return <div className="p-8">Agente não encontrado.</div>;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header com Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Brain size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
                <span className="text-sm text-gray-500">{agent.specialization}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings size={16} />
              Configurar
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Zap size={16} />
              Reiniciar Agente
            </Button>
          </div>
        </div>

        {/* Tabs de Informação */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3 px-6">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3 px-6">Desempenho</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3 px-6">Logs de Atividade</TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3 px-6">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    Saúde do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{agent.health}%</div>
                  <Progress value={agent.health} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    Nível de Energia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{agent.energy}%</div>
                  <Progress value={agent.energy} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Brain size={16} className="text-purple-500" />
                    Consciência (Sencience)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{agent.sencienceLevel}</div>
                  <Progress value={Number(agent.sencienceLevel)} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configuração do System Prompt</CardTitle>
                <CardDescription>Instruções base que definem o comportamento do agente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {agent.systemPrompt || "Nenhum prompt configurado."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Execução</CardTitle>
                <CardDescription>Histórico de sucesso e tempo de resposta</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-gray-400">
                Gráficos de desempenho serão exibidos aqui.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs Recentes</CardTitle>
                <CardDescription>Últimas ações executadas pelo agente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">Executou tarefa de sincronização de marketplace</p>
                        <p className="text-xs text-gray-500">Há {i * 10} minutos atrás • Sucesso</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}
