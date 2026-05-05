import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { AlertCircle, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminDelinquents() {
  const [selectedDelinquentId, setSelectedDelinquentId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  const { data: delinquents, isLoading, refetch } = trpc.delinquents.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const updateStatusMutation = trpc.delinquents.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do inadimplente atualizado com sucesso");
      refetch();
      setSelectedDelinquentId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleUpdateStatus = () => {
    if (selectedDelinquentId) {
      updateStatusMutation.mutate({
        delinquentId: selectedDelinquentId,
        status: selectedStatus as any,
      });
    }
  };

  const totalOutstanding = delinquents?.reduce(
    (sum, d) => sum + parseFloat(d.outstandingAmount?.toString() || "0"),
    0
  ) || 0;

  const getSeverityColor = (daysOverdue: number) => {
    if (daysOverdue > 90) return "bg-red-100 text-red-800";
    if (daysOverdue > 30) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visualização de Inadimplentes</h1>
          <p className="text-gray-600 mt-2">Acompanhe afiliados com pagamentos em atraso</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total em Atraso</p>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {totalOutstanding.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <AlertCircle size={32} className="text-red-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Inadimplentes Ativos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delinquents?.filter((d) => d.status === "active").length || 0}
                </p>
              </div>
              <TrendingDown size={32} className="text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Média de Dias em Atraso</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delinquents && delinquents.length > 0
                    ? Math.round(
                        delinquents.reduce((sum, d) => sum + (d.daysOverdue || 0), 0) /
                          delinquents.length
                      )
                    : 0}
                </p>
              </div>
              <AlertCircle size={32} className="text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Delinquents Table */}
        <Card className="p-6 bg-white overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Lista de Inadimplentes</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Afiliado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor em Atraso</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Dias em Atraso</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Razão</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : delinquents && delinquents.length > 0 ? (
                delinquents.map((delinquent) => (
                  <tr key={delinquent.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">#{delinquent.id}</td>
                    <td className="py-3 px-4 text-gray-600">Afiliado #{delinquent.affiliateId}</td>
                    <td className="py-3 px-4 font-semibold text-red-600">
                      R$ {parseFloat(delinquent.outstandingAmount?.toString() || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(delinquent.daysOverdue || 0)}`}>
                        {delinquent.daysOverdue} dias
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                      {delinquent.reason || "Sem motivo registrado"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        delinquent.status === "active"
                          ? "bg-red-100 text-red-800"
                          : delinquent.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {delinquent.status === "active"
                          ? "Ativo"
                          : delinquent.status === "resolved"
                          ? "Resolvido"
                          : "Disputado"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDelinquentId(delinquent.id);
                          setSelectedStatus(delinquent.status);
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nenhum inadimplente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Edit Status Modal */}
        {selectedDelinquentId && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Atualizar Status do Inadimplente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="disputed">Disputado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDelinquentId(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
