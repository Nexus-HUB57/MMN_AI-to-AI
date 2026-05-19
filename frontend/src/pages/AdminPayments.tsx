import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, RefreshCw, XCircle } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PAGE_SIZE = 20;
type PaymentStatus = "pending" | "confirmed" | "failed" | "cancelled";

const statusMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  pending: { label: "Pendente", badge: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmado", badge: "bg-green-100 text-green-800" },
  failed: { label: "Falhou", badge: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", badge: "bg-slate-200 text-slate-700" },
};

const formatCurrency = (value: number | string | null | undefined) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [selectedPayment, setSelectedPayment] = useState<{
    id: number;
    status: PaymentStatus;
  } | null>(null);

  const paymentsQuery = trpc.admin.listPayments.useQuery({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const processPaymentMutation = trpc.admin.processPayment.useMutation({
    onSuccess: () => {
      toast.success("Pagamento atualizado com sucesso");
      paymentsQuery.refetch();
      setSelectedPayment(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar pagamento");
    },
  });

  const payments = paymentsQuery.data?.payments || [];
  const pagination = paymentsQuery.data?.pagination;

  const summary = useMemo(
    () => ({
      totalVisible: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pending: payments.filter((payment) => payment.status === "pending").length,
      confirmed: payments.filter((payment) => payment.status === "confirmed").length,
      failed: payments.filter((payment) => payment.status === "failed").length,
    }),
    [payments]
  );

  const handleProcessPayment = () => {
    if (!selectedPayment) return;

    processPaymentMutation.mutate({
      id: selectedPayment.id,
      status: selectedPayment.status,
      paymentDate: selectedPayment.status === "confirmed" ? new Date() : undefined,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pagamentos administrativos</h1>
            <p className="mt-2 text-slate-600">
              Painel operacional de pagamentos conectado ao domínio oficial do Backoffice para conferência e processamento.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => paymentsQuery.refetch()}>
            <RefreshCw size={16} className="mr-2" />
            Atualizar dados
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard size={18} />
              <span className="text-sm">Volume visível</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">R$ {formatCurrency(summary.totalVisible)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 size={18} />
              <span className="text-sm">Pendentes na página</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{summary.pending}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Confirmados na página</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">{summary.confirmed}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={18} />
              <span className="text-sm">Falhas na página</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-700">{summary.failed}</p>
          </Card>
        </section>

        <Card className="bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Filtro por status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | PaymentStatus) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Registros na página</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{payments.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total de registros</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pagination?.total ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Página atual</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pagination?.page ?? page}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Fila operacional de pagamentos</h2>
            {pagination ? (
              <p className="text-sm text-slate-500">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </p>
            ) : null}
          </div>

          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Afiliado</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Valor</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Método</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Criação</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Liquidação</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : payments.length > 0 ? (
                payments.map((payment) => {
                  const meta = statusMeta[payment.status as PaymentStatus];
                  return (
                    <tr key={payment.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">#{payment.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">#{payment.affiliateId}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">R$ {formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{payment.method || "N/A"}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString("pt-BR") : "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString("pt-BR") : "Sem data"}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedPayment({
                              id: payment.id,
                              status: payment.status as PaymentStatus,
                            })
                          }
                        >
                          Processar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Nenhum pagamento encontrado para o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} pagamento(s) no total` : "Sem paginação disponível"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || paymentsQuery.isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={Boolean(pagination && page >= pagination.totalPages) || paymentsQuery.isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        </Card>

        {selectedPayment ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Processar pagamento #{selectedPayment.id}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Altere o status operacional do pagamento via contrato administrativo unificado.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_auto] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                <Select
                  value={selectedPayment.status}
                  onValueChange={(value: PaymentStatus) =>
                    setSelectedPayment((current) =>
                      current ? { ...current, status: value } : current
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleProcessPayment} disabled={processPaymentMutation.isPending}>
                  {processPaymentMutation.isPending ? "Salvando..." : "Salvar alteração"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
