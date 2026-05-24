import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, RefreshCw, Wallet, XCircle } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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

type PaymentRow = {
  id: number;
  affiliateId: number;
  affiliateName?: string;
  amount: number | string;
  method?: string;
  status: PaymentStatus;
  bankCode?: string;
  bankNumber?: string;
  agency?: string;
  account?: string;
  paymentDate?: string | Date | null;
  confirmedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

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
    notes: string;
  } | null>(null);

  const paymentsQuery = trpc.admin.listPayments.useQuery({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const refreshAll = () => paymentsQuery.refetch();

  const processPaymentMutation = trpc.admin.processPayment.useMutation({
    onSuccess: () => {
      toast.success("Pagamento atualizado com sucesso");
      refreshAll();
      setSelectedPayment(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar pagamento");
    },
  });

  const payments = (paymentsQuery.data?.payments || []) as PaymentRow[];
  const pagination = paymentsQuery.data?.pagination;

  const summary = useMemo(
    () => ({
      totalVisible: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pending: payments.filter((payment) => payment.status === "pending"),
      confirmed: payments.filter((payment) => payment.status === "confirmed"),
      failed: payments.filter((payment) => payment.status === "failed"),
      cancelled: payments.filter((payment) => payment.status === "cancelled"),
    }),
    [payments]
  );

  const pendingVolume = summary.pending.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const confirmedVolume = summary.confirmed.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

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
              Painel operacional de pagamentos conectado ao domínio financeiro do Backoffice Admin.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshAll}>
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
            <p className="mt-1 text-xs text-slate-500">{payments.length} pagamentos na página</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 size={18} />
              <span className="text-sm">Pendentes</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{summary.pending.length}</p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(pendingVolume)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Confirmados</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">{summary.confirmed.length}</p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(confirmedVolume)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={18} />
              <span className="text-sm">Falhas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-700">{summary.failed.length}</p>
            <p className="mt-1 text-xs text-slate-500">{summary.cancelled.length} cancelados</p>
          </Card>
        </section>

        {summary.pending.length > 0 ? (
          <section className="grid gap-4 xl:grid-cols-3">
            <Card className="bg-amber-50 p-5 shadow-sm xl:col-span-1">
              <div className="flex items-center gap-2 text-amber-900">
                <Wallet size={18} />
                <h2 className="text-base font-semibold">Atenção necessária</h2>
              </div>
              <p className="mt-2 text-sm text-amber-800">
                Há <strong>{summary.pending.length}</strong> pagamento(s) pendente(s) aguardando processamento operacional totalizando
                {" "}<strong>R$ {formatCurrency(pendingVolume)}</strong>.
              </p>
              <p className="mt-3 text-xs text-amber-700">
                Selecione cada pagamento individualmente para confirmar, cancelar ou sinalizar falha.
              </p>
            </Card>
            <Card className="bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={18} />
                <h2 className="text-base font-semibold text-slate-900">Destaques pendentes</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {summary.pending.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {payment.affiliateName || `Afiliado #${payment.affiliateId}`}
                      </p>
                      <p className="text-xs text-slate-500">{payment.method || "Método não informado"}</p>
                    </div>
                    <p className="text-base font-semibold text-amber-700">R$ {formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

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

          <table className="w-full min-w-[1020px]">
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
                    <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
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
                  const meta = statusMeta[payment.status];
                  return (
                    <tr key={payment.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">#{payment.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div>
                          <p className="font-medium text-slate-900">{payment.affiliateName || `Afiliado #${payment.affiliateId}`}</p>
                          <p className="text-xs text-slate-500">ID {payment.affiliateId}</p>
                        </div>
                      </td>
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
                          onClick={() => setSelectedPayment({ id: payment.id, status: payment.status, notes: "" })}
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
              Altere o status operacional e registre uma observação para auditoria do ciclo de liquidação.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                <Select
                  value={selectedPayment.status}
                  onValueChange={(value: PaymentStatus) =>
                    setSelectedPayment((current) => (current ? { ...current, status: value } : current))
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

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Observação operacional</p>
                <Textarea
                  value={selectedPayment.notes}
                  onChange={(event) =>
                    setSelectedPayment((current) => (current ? { ...current, notes: event.target.value } : current))
                  }
                  placeholder="Contexto da decisão de liquidação"
                  className="min-h-[88px]"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button onClick={handleProcessPayment} disabled={processPaymentMutation.isPending}>
                {processPaymentMutation.isPending ? "Salvando..." : "Salvar alteração"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Cancelar
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
