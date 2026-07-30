import { useMemo } from "react";
import { Link } from "wouter";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Users, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const BRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];

export default function AdminPanel() {
  const statsQuery = trpc.admin.marketplaceStats.useQuery({ periodDays: 30 });
  const usersQuery = trpc.admin.listUsers.useQuery({ page: 1, limit: 5 });
  const settingsQuery = trpc.admin.getSettings.useQuery();

  const totals = statsQuery.data?.totals;
  const byDay = statsQuery.data?.byDay ?? [];
  const byMethod = statsQuery.data?.byMethod ?? [];
  const totalUsers = usersQuery.data?.pagination?.total ?? 0;

  const chartData = useMemo(() => {
    if (byDay.length === 0) return [];
    return byDay.map((d: any) => ({
      date: d.day ? new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : d.label || "",
      pedidos: d.orders ?? d.count ?? 0,
      receita: d.grossCents ? Math.round(d.grossCents / 100) : 0,
    }));
  }, [byDay]);

  const pieData = useMemo(() => {
    if (byMethod.length === 0) {
      return [{ name: "Nenhum dado", value: 1 }];
    }
    return byMethod.map((m: any) => ({
      name: m.method || m.label || "Outro",
      value: m.count ?? m.orders ?? 1,
    }));
  }, [byMethod]);

  const isLoading = statsQuery.isLoading || usersQuery.isLoading;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
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
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Usuários registrados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Receita Total (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {BRL(totals?.grossPeriodCents ?? 0)}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pedidos Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {totals?.paidPeriodOrders ?? 0}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {totals?.paidToday ?? 0} pagos hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Compradores Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {totals?.uniqueBuyers ?? 0}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">No período de 30 dias</p>
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
                  <CardTitle>Receita por dia (últimos 30 dias)</CardTitle>
                  <CardDescription>Volume de pedidos e receita diária</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="receita" stroke="#06b6d4" name="Receita (R$)" />
                        <Line type="monotone" dataKey="pedidos" stroke="#8b5cf6" name="Pedidos" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-slate-400">
                      Nenhum dado disponível para o período selecionado.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Distribuição por método</CardTitle>
                  <CardDescription>Pedidos por método de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
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
                        <p className="font-medium text-slate-900">Usuários Totais</p>
                        <p className="text-sm text-slate-500">{totalUsers} usuários registrados</p>
                      </div>
                    </div>
                    <Link href="/admin/network">
                      <Button variant="outline" size="sm">Ver rede</Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900">Pedidos pagos</p>
                        <p className="text-sm text-slate-500">{totals?.paidPeriodOrders ?? 0} no período</p>
                      </div>
                    </div>
                    <Link href="/admin/commissions">
                      <Button variant="outline" size="sm">Ver comissões</Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-slate-900">Receita bruta</p>
                        <p className="text-sm text-slate-500">{BRL(totals?.grossPeriodCents ?? 0)}</p>
                      </div>
                    </div>
                    <Link href="/admin/payments">
                      <Button variant="outline" size="sm">Ver pagamentos</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Configuração de Comissões</CardTitle>
                <CardDescription>Níveis de comissionamento da rede</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(settingsQuery.data?.commissionLevels ?? [
                    { level: 1, percentage: 20 },
                    { level: 2, percentage: 10 },
                    { level: 3, percentage: 5 },
                    { level: 4, percentage: 2.5 },
                    { level: 5, percentage: 1 },
                  ]).map((level: any) => (
                    <div key={level.level} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-900">Nível {level.level}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-semibold">{level.percentage}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link href="/admin/config">
                      <Button className="w-full">Editar configurações avançadas <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
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
                {settingsQuery.isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Nome da Plataforma
                      </label>
                      <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                        {settingsQuery.data?.platformName || "—"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Email de Suporte
                      </label>
                      <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                        {settingsQuery.data?.supportEmail || "—"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Profundidade Máxima da Rede
                      </label>
                      <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                        {settingsQuery.data?.maxNetworkDepth ?? 5} níveis
                      </div>
                    </div>
                  </>
                )}

                <Link href="/admin/config">
                  <Button className="w-full mt-4">Abrir configurações completas <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}
