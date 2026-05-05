import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const KPICard = ({ icon: Icon, label, value, change }: any) => (
  <Card className="p-6 bg-white">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change > 0 ? "text-green-600" : "text-red-600"}`}>
            {change > 0 ? "+" : ""}{change}% vs mês anterior
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon size={24} className="text-blue-600" />
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const { data: metrics, isLoading } = trpc.dashboard.getMetrics.useQuery();

  const chartData = [
    { month: "Jan", sales: 4000, commissions: 2400 },
    { month: "Fev", sales: 3000, commissions: 1398 },
    { month: "Mar", sales: 2000, commissions: 9800 },
    { month: "Abr", sales: 2780, commissions: 3908 },
    { month: "Mai", sales: 1890, commissions: 4800 },
    { month: "Jun", sales: 2390, commissions: 3800 },
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <KPICard
                icon={Users}
                label="Total de Usuários"
                value={metrics?.totalUsers || 0}
                change={12}
              />
              <KPICard
                icon={TrendingUp}
                label="Total de Afiliados"
                value={metrics?.totalAffiliates || 0}
                change={8}
              />
              <KPICard
                icon={DollarSign}
                label="Comissões Pagas"
                value={`R$ ${(metrics?.totalCommissionsPaid || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                change={15}
              />
              <KPICard
                icon={AlertCircle}
                label="Comissões Pendentes"
                value={`R$ ${(metrics?.pendingCommissions || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                change={-5}
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales and Commissions Chart */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Vendas e Comissões</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Vendas" />
                <Bar dataKey="commissions" fill="#10b981" name="Comissões" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Growth Chart */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Crescimento da Rede</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Usuários" />
                <Line type="monotone" dataKey="commissions" stroke="#f59e0b" name="Afiliados" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Atividade Recente</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Novo afiliado registrado</p>
                  <p className="text-sm text-gray-600">Há {i} hora(s)</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Novo
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
