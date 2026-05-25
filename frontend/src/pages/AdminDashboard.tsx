import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Shield, User, Edit2, Users, TrendingUp, DollarSign, AlertCircle, Activity, ArrowUp, ArrowDown, Eye, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// KPI Card Component
const KPICard = ({
  icon: Icon,
  label,
  value,
  change,
  trend,
  color
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  color: string;
}) => (
  <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-accent-cyan/30 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-muted">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <ArrowUp className="w-4 h-4 text-accent-green" />
            ) : trend === "down" ? (
              <ArrowDown className="w-4 h-4 text-red-400" />
            ) : null}
            <span className={`text-sm ${trend === "up" ? "text-accent-green" : trend === "down" ? "text-red-400" : "text-text-muted"}`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const { data: metrics, isLoading: metricsLoading } = trpc.admin.getDashboardMetrics.useQuery();
  const { data: usersData, isLoading: usersLoading, refetch } = trpc.admin.listUsers.useQuery({ page, limit });
  const { data: networkStats, isLoading: networkLoading } = trpc.admin.getNetworkStats.useQuery();
  const { data: commissionStats, isLoading: commissionsLoading } = trpc.admin.getCommissionStats.useQuery();

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuario atualizado com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar usuario");
    },
  });

  const filteredUsers = usersData?.users?.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-text-secondary mt-1">Visao geral da plataforma e metricas em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 text-accent-green text-sm">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              Sistema Operacional
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-sm">
              <Activity size={14} />
              v1.0.8
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={Users}
              label="Total de Usuarios"
              value={metrics?.totalUsers || 0}
              change="+12%"
              trend="up"
              color="bg-accent-cyan/10 text-accent-cyan"
            />
            <KPICard
              icon={TrendingUp}
              label="Afiliados Ativos"
              value={metrics?.activeAffiliates || 0}
              change="+8%"
              trend="up"
              color="bg-accent-green/10 text-accent-green"
            />
            <KPICard
              icon={DollarSign}
              label="Comissoes Pagas"
              value={`R$ ${((metrics?.totalCommissionsPaid || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              change="+23%"
              trend="up"
              color="bg-yellow-500/10 text-yellow-500"
            />
            <KPICard
              icon={AlertCircle}
              label="Comissoes Pendentes"
              value={`R$ ${((metrics?.totalCommissionsPending || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              change="-5%"
              trend="down"
              color="bg-red-500/10 text-red-400"
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Network Stats */}
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Estatisticas da Rede</h3>
            {networkLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-accent-cyan">{networkStats?.totalAffiliates || 0}</p>
                  <p className="text-sm text-text-muted">Total Afiliados</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-accent-green">{networkStats?.activeAffiliates || 0}</p>
                  <p className="text-sm text-text-muted">Afiliados Ativos</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-accent-purple">{networkStats?.totalConnections || 0}</p>
                  <p className="text-sm text-text-muted">Total Conexoes</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-yellow-500">{networkStats?.uniqueSponsors || 0}</p>
                  <p className="text-sm text-text-muted">Sponsors Unicos</p>
                </div>
              </div>
            )}
          </Card>

          {/* Commission Stats */}
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Comissoes</h3>
            {commissionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent-cyan/10">
                  <div>
                    <p className="text-sm text-text-muted">Total</p>
                    <p className="text-xl font-bold text-accent-cyan">
                      R$ {((commissionStats?.total || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent-cyan" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                    <p className="text-lg font-bold text-yellow-500">
                      R$ {((commissionStats?.pending || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-text-muted">Pendentes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent-green/10 text-center">
                    <p className="text-lg font-bold text-accent-green">
                      R$ {((commissionStats?.paid || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-text-muted">Pagas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent-purple/10 text-center">
                    <p className="text-lg font-bold text-accent-purple">
                      R$ {((commissionStats?.confirmed || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-text-muted">Confirmadas</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Users Management */}
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Usuarios Recentes</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <Input
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 sm:w-64 bg-background"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Cadastro</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-background/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-sm font-bold text-background">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="font-medium">{user.name || "Sem nome"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{user.email || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "admin" ? "bg-accent-purple/10 text-accent-purple" : "bg-accent-cyan/10 text-accent-cyan"
                        }`}>
                          {user.role === "admin" ? (
                            <>
                              <Shield size={14} />
                              Admin
                            </>
                          ) : (
                            <>
                              <User size={14} />
                              Usuario
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-accent-green/10 text-accent-green">
                          <Check size={14} />
                          Ativo
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-accent-cyan hover:text-accent-cyan hover:bg-accent-cyan/10"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-accent-purple hover:text-accent-purple hover:bg-accent-purple/10"
                            onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                          >
                            <Edit2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      Nenhum usuario encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
              <p className="text-sm text-text-muted">
                Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, usersData.pagination.total)} de {usersData.pagination.total} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 text-sm">
                  Pagina {page} de {usersData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(usersData.pagination.totalPages, page + 1))}
                  disabled={page === usersData.pagination.totalPages}
                >
                  Proxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
