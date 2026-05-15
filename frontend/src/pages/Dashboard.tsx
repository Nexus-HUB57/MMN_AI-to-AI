/**
 * Dashboard Page - Glassmorphism Futurista
 * Design: Cards com vidro fosco, gráficos com cores neon, layout assimétrico
 * Componentes: Sidebar transparente, stats cards com glow, tabs com gradientes
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  RefreshCw, AlertCircle, CheckCircle, Clock, Zap, TrendingUp, 
  Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight 
} from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const { data: profileData, isLoading: isLoadingProfile } = trpc.mmn.getProfile.useQuery();
  const { data: statsData, isLoading: isLoadingStats } = trpc.mmn.getStats.useQuery();



  const [stats, setStats] = useState<StatCard[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    if (profileData && statsData) {
      const newStats: StatCard[] = [
        {
          label: "Comissões Totais",
          value: `R$ ${(profileData.totalCommissions / 100).toFixed(2).replace('.', ',')}`,
          change: 0, // Placeholder, assuming no change data from backend yet
          icon: <DollarSign className="w-5 h-5" />,
          color: "from-cyan-500 to-blue-500",
        },
        {
          label: "Afiliados Ativos",
          value: statsData.activeAffiliates.toString(),
          change: 0, // Placeholder
          icon: <Users className="w-5 h-5" />,
          color: "from-purple-500 to-pink-500",
        },
        {
          label: "Vendas Este Mês",
          value: statsData.monthlySales.toString(),
          change: 0, // Placeholder
          icon: <TrendingUp className="w-5 h-5" />,
          color: "from-cyan-400 to-purple-400",
        },
        {
          label: "Taxa de Conversão",
          value: `${statsData.conversionRate.toFixed(2)}%`,
          change: 0, // Placeholder
          icon: <Activity className="w-5 h-5" />,
          color: "from-orange-500 to-red-500",
        },
      ];
      setStats(newStats);

      // Assuming statsData contains historical data for charts
      // This is a simplified mapping, adjust based on actual backend data structure
      const newChartData = statsData.salesHistory.map((item: any) => ({
        name: item.month,
        vendas: item.sales,
        comissoes: item.commissions,
      }));
      setChartData(newChartData);

      const newPieData = statsData.commissionDistribution.map((item: any) => ({
        name: item.level,
        value: item.amount,
      }));
      setPieData(newPieData);
    }
  }, [profileData, statsData]);

  if (isLoadingProfile || isLoadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Carregando dados do dashboard...</p>
      </div>
    );
  }

  // Mock data for stats


  const COLORS = ["#00D9FF", "#9D4EDD", "#FF006E", "#FB5607"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">Dashboard</h1>
            <p className="text-slate-400 text-sm">Bem-vindo ao seu painel de controle</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="glass rounded-2xl p-6 border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2.5 text-white group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.change >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 border-cyan-500/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white font-mono mb-2">Vendas e Comissões</h2>
              <p className="text-slate-400 text-sm">Últimos 6 meses</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                <XAxis stroke="rgba(255, 255, 255, 0.5)" />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(15, 23, 42, 0.9)", 
                    border: "1px solid rgba(0, 217, 255, 0.3)",
                    borderRadius: "12px"
                  }}
                  labelStyle={{ color: "#00D9FF" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#00D9FF" 
                  strokeWidth={2}
                  dot={{ fill: "#00D9FF", r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="comissoes" 
                  stroke="#9D4EDD" 
                  strokeWidth={2}
                  dot={{ fill: "#9D4EDD", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="glass rounded-2xl p-6 border-cyan-500/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white font-mono mb-2">Distribuição</h2>
              <p className="text-slate-400 text-sm">Por nível de afiliado</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(15, 23, 42, 0.9)", 
                    border: "1px solid rgba(0, 217, 255, 0.3)",
                    borderRadius: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="glass rounded-2xl p-6 border-cyan-500/20">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-1">
              <TabsTrigger 
                value="recent"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
              >
                Atividades Recentes
              </TabsTrigger>
              <TabsTrigger 
                value="agents"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
              >
                Agentes IA
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
              >
                Conteúdo Gerado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Venda realizada</p>
                      <p className="text-slate-400 text-sm">Há 2 horas</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">+R$ 125,00</Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="agents" className="mt-6 space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="p-4 bg-slate-900/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold font-mono">Agente IA #{item}</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Ativo</Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">Especialização: Marketing Digital</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                      Configurar
                    </Button>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                      Histórico
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="content" className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 bg-slate-900/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Post para Instagram</h3>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Texto</Badge>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    Conteúdo gerado pelo agente IA para maximizar engajamento...
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold">
                    Usar Conteúdo
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
