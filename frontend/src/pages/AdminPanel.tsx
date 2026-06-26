import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Settings, Users, TrendingUp, DollarSign } from "lucide-react";

export default function AdminPanel() {
  const mockNetworkData = [
    { name: "Afiliados", value: 150 },
    { name: "Líderes", value: 45 },
    { name: "Supervisores", value: 12 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  const mockRevenueData = [
    { month: "Jan", revenue: 45000, commissions: 15000 },
    { month: "Feb", revenue: 52000, commissions: 17000 },
    { month: "Mar", revenue: 61000, commissions: 20000 },
    { month: "Apr", revenue: 75000, commissions: 24000 },
    { month: "May", revenue: 89000, commissions: 28000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Painel Administrativo</h1>
          <p className="text-slate-600">Gerenciar plataforma, comissões e rede de afiliados</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">207</div>
              <p className="text-xs text-slate-500 mt-1">+12 este mês</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">R$ 322.000</div>
              <p className="text-xs text-slate-500 mt-1">Últimos 5 meses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Comissões Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">R$ 104.000</div>
              <p className="text-xs text-slate-500 mt-1">32% da receita</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">4.2%</div>
              <p className="text-xs text-slate-500 mt-1">Visitantes → Clientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="network">Rede</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Receita vs Comissões</CardTitle>
                  <CardDescription>Últimos 5 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Receita (R$)" />
                      <Line type="monotone" dataKey="commissions" stroke="#10b981" name="Comissões (R$)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Distribuição de Perfis</CardTitle>
                  <CardDescription>Usuários por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockNetworkData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockNetworkData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="network">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Gerenciar Rede</CardTitle>
                <CardDescription>Visualizar e gerenciar afiliados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">Afiliados Ativos</p>
                        <p className="text-sm text-slate-500">150 usuários</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Gerenciar</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900">Líderes</p>
                        <p className="text-sm text-slate-500">45 usuários</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Gerenciar</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-slate-900">Supervisores</p>
                        <p className="text-sm text-slate-500">12 usuários</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Gerenciar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Configuração de Comissões</CardTitle>
                <CardDescription>Definir percentuais por nível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-900">Nível {level}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={10 - level}
                          className="w-16 px-2 py-1 border border-slate-300 rounded"
                        />
                        <span className="text-slate-600">%</span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4">Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    defaultValue="IOAID · SaaS"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email de Suporte
                  </label>
                  <input
                    type="email"
                    defaultValue="suporte@mmn-ai.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Comissão Padrão (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <Button className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
