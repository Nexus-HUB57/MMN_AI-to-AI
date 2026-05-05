import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { CreditCard, Check, Clock, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pendente" },
  approved: { icon: Check, color: "text-blue-600", bg: "bg-blue-100", label: "Aprovado" },
  paid: { icon: Check, color: "text-green-600", bg: "bg-green-100", label: "Pago" },
  rejected: { icon: X, color: "text-red-600", bg: "bg-red-100", label: "Rejeitado" },
  cancelled: { icon: X, color: "text-gray-600", bg: "bg-gray-100", label: "Cancelado" },
};

export default function AdminPayments() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");

  const { data: payments, isLoading, refetch } = trpc.payments.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const updateStatusMutation = trpc.payments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do pagamento atualizado com sucesso");
      refetch();
      setSelectedPaymentId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleUpdateStatus = () => {
    if (selectedPaymentId) {
      updateStatusMutation.mutate({
        paymentId: selectedPaymentId,
        status: selectedStatus as any,
      });
    }
  };

  const getTotalByStatus = (status: string) => {
    return payments
      ?.filter((p) => p.status === status)
      .reduce((sum, p) => sum + parseFloat(p.amount?.toString() || "0"), 0) || 0;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Pagamentos</h1>
          <p className="text-gray-600 mt-2">Acompanhe e gerencie os pagamentos de comissões</p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const total = getTotalByStatus(status);
            return (
              <Card key={status} className="p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={config.color} />
                  <span className="text-sm font-medium text-gray-600">{config.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {payments?.filter((p) => p.status === status).length || 0} pagamento(s)
                </p>
              </Card>
            );
          })}
        </div>

        {/* Payments Table */}
        <Card className="p-6 bg-white overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Transações</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Afiliado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Método</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
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
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : payments && payments.length > 0 ? (
                payments.map((payment) => {
                  const config = statusConfig[payment.status as keyof typeof statusConfig];
                  const Icon = config?.icon || Clock;
                  return (
                    <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">#{payment.id}</td>
                      <td className="py-3 px-4 text-gray-600">Afiliado #{payment.affiliateId}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        R$ {parseFloat(payment.amount?.toString() || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{payment.paymentMethod || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${config?.bg}`}>
                          <Icon size={14} />
                          {config?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPaymentId(payment.id);
                            setSelectedStatus(payment.status);
                          }}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Edit Status Modal */}
        {selectedPaymentId && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Atualizar Status do Pagamento</h3>
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
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
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
                  onClick={() => setSelectedPaymentId(null)}
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
