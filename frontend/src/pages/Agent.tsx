import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cpu, Zap, Activity, Settings, History, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agent() {
  const { data: metrics, isLoading } = trpc.dashboard.getMetrics.useQuery();
  
  const agent = metrics?.agent;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <Card className="border-accent-cyan/30 bg-card/50 p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Nenhum Agente Ativo</h2>
          <p className="text-text-secondary mb-6">Você ainda não configurou um agente de IA para sua conta.</p>
          <Button className="gradient-btn">Configurar Agora</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {agent.name}
            </h1>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20">
                {agent.status}
              </Badge>
              <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/20">
                Especialista em Marketing
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" /> Configurações
          </Button>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-accent-cyan/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Energia do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{agent.vitals?.energy || 0}%</div>
              <Progress value={agent.vitals?.energy || 0} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-accent-cyan/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-green" /> Saúde Operacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{agent.vitals?.health || 0}%</div>
              <Progress value={agent.vitals?.health || 0} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-accent-cyan/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-cyan" /> Carga de Processamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Baixa</div>
              <p className="text-xs text-text-secondary">Otimizado para tarefas atuais</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Capabilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-accent-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Sincronização de Marketplace", time: "Há 2 horas", status: "Sucesso" },
                  { action: "Geração de Post Instagram", time: "Há 5 horas", status: "Sucesso" },
                  { action: "Análise de Tendências", time: "Há 8 horas", status: "Sucesso" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-background/40 rounded-lg border border-accent-cyan/10">
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-text-secondary">{item.time}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-accent-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Capacidades Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Geração de Conteúdo",
                  "Sincronização Shopee",
                  "Sincronização ML",
                  "Análise de Vendas",
                  "Gestão de Leads",
                  "Automação de E-mail"
                ].map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-background/40 rounded border border-accent-cyan/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></div>
                    <span className="text-xs">{cap}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 variant-outline border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10">
                Adicionar Novas Habilidades
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
