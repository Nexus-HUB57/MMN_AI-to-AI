import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Shield, User, Edit2, Users, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <Card className="p-6 bg-white">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: metrics, isLoading: metricsLoading } = trpc.admin.getDashboardMetrics.useQuery();
  const { data: usersData, isLoading: usersLoading, refetch } = trpc.admin.listUsers.useQuery({ page, limit });
  const { data: networkStats, isLoading: networkLoading } = trpc.admin.getNetworkStats.useQuery();
  const { data: commissionStats, isLoading: commissionsLoading } = trpc.admin.getCommissionStats.useQuery();
  const { data: salesStats, isLoading: salesLoading } = trpc.admin.getSalesStats.useQuery();

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    },
  });

  const toggleAffiliateMutation = trpc.admin.toggleAffiliateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do afiliado atualizado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersData?.users?.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = (userId: number, role: "user" | "admin") => {
    updateUserMutation.mutate({ id: userId, role });
    setSelectedUserId(null);
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    toggleAffiliateMutation.mutate({ userId, status: newStatus as any });
  };

  // Chart data for commissions
  const chartData = [
    { name: "Jan", value: 45000 },
    { name: "Fev", value: 52000 },
    { name: "Mar", value: 61000 },
    { name: "Abr", value: 75000 },
    { name: "Mai", value: 89000 },
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral da plataforma e métricas em tempo real</p>
        </div>

        {/* KPI Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              icon={Users}
              label="Total de Usuários"
              value={metrics?.totalUsers || 0}
              color="bg-blue-100"
            />
            <KPICard
              icon={TrendingUp}
              label="Afiliados Ativos"
              value={metrics?.activeAffiliates || 0}
              color="bg-green-100"
            />
            <KPICard
              icon={DollarSign}
              label="Comissões Pagas"
              value={`R$ ${((metrics?.totalCommissionsPaid || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              color="bg-yellow-100"
            />
            <KPICard
              icon={AlertCircle}
              label="Comissões Pendentes"
              value={`R$ ${((metrics?.totalCommissionsPending || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              color="bg-red-100"
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Stats */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Estatísticas da Rede</h3>
            {networkLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Total de Afiliados</span>
                  <span className="font-semibold text-gray-900">{networkStats?.totalAffiliates || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Afiliados Ativos</span>
                  <span className="font-semibold text-green-600">{networkStats?.activeAffiliates || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Total de Conexões</span>
                  <span className="font-semibold text-gray-900">{networkStats?.totalConnections || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Sponsors Únicos</span>
                  <span className="font-semibold text-gray-900">{networkStats?.uniqueSponsors || 0}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Commission Stats */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Comissões</h3>
            {commissionsLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-blue-600">
                    R$ {((commissionStats?.total || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-gray-600">Pendentes</span>
                  <span className="font-semibold text-yellow-600">
                    R$ {((commissionStats?.pending || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-gray-600">Pagas</span>
                  <span className="font-semibold text-green-600">
                    R$ {((commissionStats?.paid || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-600">Confirmadas</span>
                  <span className="font-semibold text-purple-600">
                    R$ {((commissionStats?.confirmed || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Users Management */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Usuários Recentes</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cadastro</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{user.name || "Sem nome"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role === "admin" ? (
                            <div className="flex items-center gap-1">
                              <Shield size={14} />
                              Admin
                            </div>
                          ) : "Usuário"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, "active")}
                          >
                            Toggle
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, usersData.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(usersData.pagination.totalPages, page + 1))}
                      className={page === usersData.pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>

        {/* Edit User Modal */}
        {selectedUserId && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Editar Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <Select
                  onValueChange={(value: any) => handleUpdateRole(selectedUserId, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setSelectedUserId(null)}>Fechar</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}