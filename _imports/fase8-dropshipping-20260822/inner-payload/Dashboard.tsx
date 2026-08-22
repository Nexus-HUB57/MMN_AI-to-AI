import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Zap, Target } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.mmn.getProfile.useQuery();
  const { data: commissions } = trpc.mmn.getTotalCommissions.useQuery();
  const { data: pendingCommissions } = trpc.mmn.getPendingCommissions.useQuery();
  const { data: directReferrals } = trpc.mmn.getDirectReferrals.useQuery();
  const { data: orders } = trpc.mmn.getOrders.useQuery({ limit: 10 });
  const { data: trendingProducts } = trpc.mmn.getTrendingProducts.useQuery({ limit: 5 });

  const mockChartData = [
    { month: "Jan", commissions: 400, referrals: 240 },
    { month: "Feb", commissions: 600, referrals: 320 },
    { month: "Mar", commissions: 800, referrals: 450 },
    { month: "Apr", commissions: 1200, referrals: 580 },
    { month: "May", commissions: 1600, referrals: 720 },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard de Afiliado</h1>
          <p className="text-slate-600">Bem-vindo, {user?.name}! Aqui está seu resumo de performance.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Ganhos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">R$ {commissions || "0,00"}</div>
              <p className="text-xs text-slate-500 mt-1">Comissões acumuladas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingCommissions?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Comissões a confirmar</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Indicados Diretos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{directReferrals?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Pessoas indicadas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Código do Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono font-bold text-slate-900">{profile?.affiliateCode}</div>
              <p className="text-xs text-slate-500 mt-1">Seu código único</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="network">Rede</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
                <CardDescription>Evolução de ganhos nos últimos 5 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="commissions" fill="#3b82f6" name="Comissões (R$)" />
                    <Bar dataKey="referrals" fill="#10b981" name="Novos Indicados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Sua Rede de Indicados</CardTitle>
                <CardDescription>Pessoas que você indicou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {directReferrals && directReferrals.length > 0 ? (
                    directReferrals.map((referral, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-900">Afiliado #{referral.id}</p>
                            <p className="text-sm text-slate-500">Status: {referral.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">R$ {referral.totalEarnings}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Nenhum indicado ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Produtos em Alta</CardTitle>
                <CardDescription>Produtos com maior demanda para promover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingProducts && trendingProducts.length > 0 ? (
                    trendingProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{product.title}</p>
                            <p className="text-sm text-slate-500">{product.marketplace}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">R$ {product.price}</p>
                          <p className="text-sm text-green-600">{product.commissionPercentage}% comissão</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Nenhum produto disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Potencialize seu Agente IA
            </CardTitle>
            <CardDescription className="text-blue-100">
              Desbloqueie novos recursos e aumente suas comissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full md:w-auto">
              Ver Upgrades Disponíveis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
