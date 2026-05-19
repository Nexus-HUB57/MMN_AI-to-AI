import { useMemo, useState } from "react";
import { BadgeDollarSign, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
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
type CommissionStatus = "pending" | "confirmed" | "paid" | "cancelled";

const statusMeta: Record<CommissionStatus, { label: string; badge: string }> = {
  pending: { label: "Pendente", badge: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmada", badge: "bg-blue-100 text-blue-800" },
  paid: { label: "Paga", badge: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelada", badge: "bg-red-100 text-red-800" },
};

const formatCurrency = (value: number | string | null | undefined) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminCommissions() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionStatus>("all");
  const [selectedCommission, setSelectedCommission] = useState<{
    id: number;
    status: CommissionStatus;
  } | null>(null);

  const commissionsQuery = trpc.admin.listCommissions.useQuery({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statsQuery = trpc.admin.getCommissionStats.useQuery();

  const updateMutation = trpc.admin.updateCommissionStatus.useMutation({
    onSuccess: () => {
      toast.success("Status da comissão atualizado com sucesso");
      commissionsQuery.refetch();
      statsQuery.refetch();
      setSelectedCommission(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status da comissão");
    },
  });

  const commissions = commissionsQuery.data?.commissions || [];
  const pagination = commissionsQuery.data?.pagination;

  const visibleTotals = useMemo(
    () => ({
      total: commissions.reduce((sum, commission) => sum + Number(commission.amount || 0), 0),
      pending: commissions.filter((commission) => commission.status === "pending").length,
      confirmed: commissions.filter((commission) => commission.status === "confirmed").length,
      paid: commissions.filter((commission) => commission.status === "paid").length,
    }),
    [commissions]
  );

  const handleUpdateStatus = () => {
    if (!selectedCommission) return;

    updateMutation.mutate({
      id: selectedCommission.id,
      status: selectedCommission.status,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Comissões administrativas</h1>
            <p className="mt-2 text-slate-600">
              Supervisão operacional das comissões conectada ao contrato oficial <code>trpc.admin.*</code>.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              commissionsQuery.refetch();
              statsQuery.refetch();
            }}
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar dados
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <BadgeDollarSign size={18} />
              <span className="text-sm">Total acumulado</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              R$ {formatCurrency(statsQuery.data?.total)}
            </p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 size={18} />
              <span className="text-sm">Pendentes</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">
              {statsQuery.data?.count.pending ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.pending)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Confirmadas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {statsQuery.data?.count.confirmed ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.confirmed)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Pagas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {statsQuery.data?.count.paid ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.paid)}</p>
          </Card>
        </section>

        <Card className="bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Filtro por status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | CommissionStatus) => {
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
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Registros na página</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{commissions.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Volume visível</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">R$ {formatCurrency(visibleTotals.total)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pendentes na página</p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">{visibleTotals.pending}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pagas na página</p>
                <p className="mt-2 text-2xl font-semibold text-green-700">{visibleTotals.paid}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Fila operacional de comissões</h2>
            {pagination ? (
              <p className="text-sm text-slate-500">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </p>
            ) : null}
          </div>

          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Afiliado</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Nível</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Origem</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Valor</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Criação</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {commissionsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : commissions.length > 0 ? (
                commissions.map((commission) => {
                  const meta = statusMeta[commission.status as CommissionStatus];
                  return (
                    <tr key={commission.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">#{commission.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">#{commission.affiliateId}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{commission.level}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {commission.source}
                        {commission.sourceId ? ` #${commission.sourceId}` : ""}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        R$ {formatCurrency(commission.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {commission.createdAt ? new Date(commission.createdAt).toLocaleString("pt-BR") : "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedCommission({
                              id: commission.id,
                              status: commission.status as CommissionStatus,
                            })
                          }
                        >
                          Atualizar status
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Nenhuma comissão encontrada para o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} comissão(ões) no total` : "Sem paginação disponível"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || commissionsQuery.isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={Boolean(pagination && page >= pagination.totalPages) || commissionsQuery.isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        </Card>

        {selectedCommission ? (
          <Card className="bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <XCircle size={18} className="text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">
                Atualizar comissão #{selectedCommission.id}
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_auto] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                <Select
                  value={selectedCommission.status}
                  onValueChange={(value: CommissionStatus) =>
                    setSelectedCommission((current) =>
                      current ? { ...current, status: value } : current
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="paid">Paga</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpdateStatus} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar alteração"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedCommission(null)}>
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
