import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Wallet,
  Star,
  Bot,
  ArrowRight,
  ChevronRight,
  Zap,
  Activity,
  Gift,
  ShoppingCart,
  Target,
  BarChart3,
  Calendar,
  Globe,
} from "lucide-react";

export default function Dashboard() {
  const health = trpc.system.health.useQuery();
  const systemInfo = trpc.system.info.useQuery();
  const currentUser = trpc.auth.me.useQuery();

  // Mock data for demonstration
  const quickStats = [
    { label: "Saldo Disponivel", value: "R$ 1.250,00", icon: Wallet, color: "text-accent-green", bg: "bg-accent-green/10" },
    { label: "Comissoes Mes", value: "R$ 3.450,00", icon: TrendingUp, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
    { label: "Rede Ativa", value: "147", icon: Users, color: "text-accent-purple", bg: "bg-accent-purple/10" },
    { label: "Nivel Atual", value: "Ouro", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const quickActions = [
    { label: "Meu Agente IA", href: "/agents", icon: Bot, desc: "Gerenciar agentes" },
    { label: "Marketplaces", href: "/marketplaces", icon: ShoppingCart, desc: "Vender produtos" },
    { label: "Comissoes", href: "/commissions", icon: TrendingUp, desc: "Ver ganhos" },
    { label: "Calendario", href: "/content/calendar", icon: Calendar, desc: "Agendar posts" },
    { label: "Materiais", href: "/marketing/materials", icon: Globe, desc: "Banners e links" },
    { label: "Upgrades", href: "/upgrades", icon: Zap, desc: "Melhorar conta" },
  ];

  const recentActivity = [
    { type: "commission", text: "Comissao de R$ 150,00 aprovada", time: "Ha 2 horas", icon: Wallet },
    { type: "network", text: "Novo afiliado: Maria S.", time: "Ha 5 horas", icon: Users },
    { type: "bonus", text: "Bonus de nivel desbloqueado", time: "Ha 1 dia", icon: Gift },
    { type: "sale", text: "Venda no Mercado Livre: R$ 89,90", time: "Ha 2 dias", icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Bem-vindo de volta, {currentUser.data?.name || "Usuario"}!
          </h1>
          <p className="text-text-secondary mt-1">
            Aqui esta o resumo da sua atividade hoje.
          </p>
        </div>
        <Link href="/cadastro">
          <Button size="sm" className="gradient-btn">
            <Bot className="w-4 h-4 mr-2" />
            Convidar para Rede
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <Card key={idx} className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-accent-cyan/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Acoes Rapidas</h2>
              <Link href="/agents" className="text-sm text-accent-cyan hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-accent-cyan/30 transition-all group cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg ${action.icon === Bot ? "bg-accent-cyan/10" : "bg-accent-green/10"} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 ${action.icon === Bot ? "text-accent-cyan" : "text-accent-green"}`} />
                    </div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-text-muted mt-1">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Agent Status Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-gradient-to-br from-accent-cyan/10 to-accent-green/10 backdrop-blur border-accent-cyan/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Bot className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="font-semibold">Agente IA</h3>
                <p className="text-sm text-accent-green">Online e ativo</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-text-muted">Tarefas hoje</span>
                <span className="font-medium">12/15</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-text-muted">Leads processados</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-muted">Ultima atividade</span>
                <span className="font-medium text-sm">Agora</span>
              </div>
            </div>
            <Link href="/agents" className="block mt-4">
              <Button variant="outline" className="w-full border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10">
                Gerenciar Agente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Atividade Recente</h2>
            <Button variant="ghost" size="sm" className="text-accent-cyan">
              Ver todas
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.type === "commission" ? "bg-accent-green/10" : activity.type === "network" ? "bg-accent-cyan/10" : activity.type === "bonus" ? "bg-yellow-500/10" : "bg-accent-purple/10"}`}>
                  <activity.icon className={`w-4 h-4 ${activity.type === "commission" ? "text-accent-green" : activity.type === "network" ? "text-accent-cyan" : activity.type === "bonus" ? "text-yellow-500" : "text-accent-purple"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.text}</p>
                  <p className="text-xs text-text-muted mt-1">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            ))}
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Status do Sistema</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm text-accent-green">Operacional</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-accent-cyan" />
                <span className="text-sm">API Health</span>
              </div>
              {health.isLoading ? (
                <Skeleton className="w-16 h-4" />
              ) : health.data ? (
                <span className={`text-sm font-medium ${health.data.ok ? "text-accent-green" : "text-red-400"}`}>
                  {health.data.ok ? "Online" : "Offline"}
                </span>
              ) : (
                <span className="text-sm text-red-400">Erro</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-accent-green" />
                <span className="text-sm">Database</span>
              </div>
              {systemInfo.isLoading ? (
                <Skeleton className="w-16 h-4" />
              ) : systemInfo.data ? (
                <span className="text-sm font-medium text-accent-green">{systemInfo.data.database}</span>
              ) : (
                <span className="text-sm text-red-400">Erro</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-purple" />
                <span className="text-sm">Redis Cache</span>
              </div>
              {systemInfo.isLoading ? (
                <Skeleton className="w-16 h-4" />
              ) : systemInfo.data ? (
                <span className="text-sm font-medium text-accent-green">{systemInfo.data.redis}</span>
              ) : (
                <span className="text-sm text-red-400">Erro</span>
              )}
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
            <p className="text-sm text-accent-cyan">
              Sistema em modo <strong>{systemInfo.data?.mode || "production"}</strong>
            </p>
          </div>
        </Card>
      </div>

      {/* User Info Card */}
      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <h2 className="text-lg font-semibold mb-4">Informacoes da Conta</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-text-muted">ID do Usuario</p>
            <p className="font-medium mt-1">#{currentUser.data?.id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Email</p>
            <p className="font-medium mt-1">{currentUser.data?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Tipo de Conta</p>
            <p className="font-medium mt-1 capitalize">{currentUser.data?.role || "user"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Autenticado via</p>
            <p className="font-medium mt-1">JWT Token</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
