import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  FileSearch,
  Layers3,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
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
type CommissionStatus = "pending" | "confirmed" | "paid" | "cancelled";

type CommissionRow = {
  id: number;
  affiliateId: number;
  affiliateName?: string;
  affiliateCode?: string;
  amount: number | string;
  percentage?: number | string;
  level: number;
  status: CommissionStatus;
  source: string;
  sourceId?: string | number;
  description?: string;
  createdAt?: string | Date;
  confirmedAt?: string | Date | null;
  paidAt?: string | Date | null;
  history?: Array<{
    action: string;
    by: string;
    at?: string | Date;
    notes?: string;
  }>;
  auditSummary?: {
    currentStatus?: string;
    confirmedAt?: string | Date | null;
    paidAt?: string | Date | null;
  };
};

type AuditEvent = {
  domain: string;
  action: string;
  performedBy: string;
  targetId?: number;
  targetIds?: number[];
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  performedAt?: string | Date;
};

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

const formatPercent = (value: number | string | null | undefined) => `${Number(value || 0).toFixed(0)}%`;

export default function AdminCommissions() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionStatus>("all");
  const [selectedPendingIds, setSelectedPendingIds] = useState<number[]>([]);
  const [batchNotes, setBatchNotes] = useState("");
  const [selectedCommission, setSelectedCommission] = useState<{
    id: number;
    status: CommissionStatus;
    notes: string;
  } | null>(null);
  const [lastAuditEvent, setLastAuditEvent] = useState<AuditEvent | null>(null);

  const commissionsQuery = trpc.commissions.list.useQuery({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statsQuery = trpc.commissions.getStats.useQuery();

  const detailsQuery = trpc.commissions.getById.useQuery(
    { id: selectedCommission?.id || 0 },
    { enabled: Boolean(selectedCommission?.id) }
  );

  const refreshAll = () => {
    commissionsQuery.refetch();
    statsQuery.refetch();
    if (selectedCommission?.id) {
      detailsQuery.refetch();
    }
  };

  const updateMutation = trpc.commissions.updateStatus.useMutation({
    onSuccess: (data) => {
      toast.success("Status da comissão atualizado com sucesso");
      refreshAll();
      setLastAuditEvent((data as any).audit || null);
      setSelectedCommission(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status da comissão");
    },
  });

  const approveBatchMutation = trpc.commissions.approveBatch.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Comissões aprovadas com sucesso");
      refreshAll();
      setSelectedPendingIds([]);
      setBatchNotes("");
      setLastAuditEvent((data as any).audit || null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar comissões em lote");
    },
  });

  const commissions = (commissionsQuery.data?.commissions || []) as CommissionRow[];
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

  const levelHighlights = useMemo<[string, number][]>(() => {
    const levels = (statsQuery.data?.byLevel ?? {}) as Record<string, number | string>;
    return Object.entries(levels)
      .map(([level, amount]) => [level, Number(amount || 0)] as [string, number])
      .sort(([, left], [, right]) => right - left)
      .slice(0, 3);
  }, [statsQuery.data?.byLevel]);

  const sourceHighlights = useMemo<[string, number][]>(() => {
    const sources = (statsQuery.data?.bySource ?? {}) as Record<string, number | string>;
    return Object.entries(sources)
      .map(([source, amount]) => [source, Number(amount || 0)] as [string, number])
      .sort(([, left], [, right]) => right - left)
      .slice(0, 3);
  }, [statsQuery.data?.bySource]);

  const visiblePendingIds = commissions.filter((commission) => commission.status === "pending").map((commission) => commission.id);
  const allVisiblePendingSelected = visiblePendingIds.length > 0 && visiblePendingIds.every((id) => selectedPendingIds.includes(id));

  const togglePendingSelection = (commissionId: number, checked: boolean) => {
    setSelectedPendingIds((current) => {
      if (checked) {
        return current.includes(commissionId) ? current : [...current, commissionId];
      }

      return current.filter((id) => id !== commissionId);
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedPendingIds(visiblePendingIds);
      return;
    }

    setSelectedPendingIds([]);
  };

  const handleUpdateStatus = () => {
    if (!selectedCommission) return;

    updateMutation.mutate({
      id: selectedCommission.id,
      status: selectedCommission.status,
      notes: selectedCommission.notes || undefined,
    });
  };

  const handleBatchApprove = () => {
    if (!selectedPendingIds.length) {
      toast.error("Selecione ao menos uma comissão para aprovação em lote");
      return;
    }

    approveBatchMutation.mutate({
      ids: selectedPendingIds,
      notes: batchNotes || undefined,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Comissões administrativas</h1>
            <p className="mt-2 text-slate-600">
              Supervisão operacional conectada ao namespace dedicado <code>trpc.commissions.*</code>, com leitura analítica e mutações específicas do domínio.
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
              <BadgeDollarSign size={18} />
              <span className="text-sm">Total acumulado</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">R$ {formatCurrency(statsQuery.data?.total)}</p>
            <p className="mt-1 text-xs text-slate-500">Ticket médio R$ {formatCurrency(statsQuery.data?.averageCommission)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 size={18} />
              <span className="text-sm">Pendentes</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{statsQuery.data?.count.pending ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.pending)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Confirmadas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-700">{statsQuery.data?.count.confirmed ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.confirmed)}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Pagas</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">{statsQuery.data?.count.paid ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">R$ {formatCurrency(statsQuery.data?.paid)}</p>
          </Card>
        </section>

        {lastAuditEvent ? (
          <Card className="border border-violet-200 bg-violet-50 p-5 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-violet-700">Último evento de auditoria</p>
                <h2 className="mt-1 text-lg font-semibold text-violet-950">{lastAuditEvent.action.replaceAll("_", " ")}</h2>
                <p className="mt-2 text-sm text-violet-800">
                  Executado por <strong>{lastAuditEvent.performedBy}</strong>
                  {lastAuditEvent.targetId ? ` · comissão #${lastAuditEvent.targetId}` : ""}
                  {lastAuditEvent.targetIds?.length ? ` · lote com ${lastAuditEvent.targetIds.length} itens` : ""}
                </p>
              </div>
              <div className="text-sm text-violet-700">
                {lastAuditEvent.performedAt ? new Date(lastAuditEvent.performedAt).toLocaleString("pt-BR") : "Sem data"}
              </div>
            </div>
            {lastAuditEvent.notes ? (
              <p className="mt-3 rounded-lg bg-white/70 px-4 py-3 text-sm text-violet-900">{lastAuditEvent.notes}</p>
            ) : null}
          </Card>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Layers3 size={18} />
              <h2 className="text-base font-semibold text-slate-900">Distribuição por nível</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {levelHighlights.map(([level, amount]) => (
                <div key={level} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Nível {level}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">R$ {formatCurrency(amount)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Users size={18} />
              <h2 className="text-base font-semibold text-slate-900">Principais origens</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {sourceHighlights.map(([source, amount]) => (
                <div key={source} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{source}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">R$ {formatCurrency(amount)}</p>
                </div>
              ))}
            </div>
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
                  setSelectedPendingIds([]);
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

        {(statusFilter === "all" || statusFilter === "pending") && visiblePendingIds.length > 0 ? (
          <Card className="border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-blue-900">Aprovação em lote</h2>
                <p className="mt-2 text-sm text-blue-800">
                  Aprove com rapidez as comissões pendentes visíveis e registre uma observação operacional para o lote.
                </p>
              </div>
              <div className="grid w-full gap-3 lg:max-w-xl lg:grid-cols-[1fr_auto_auto] lg:items-end">
                <Textarea
                  value={batchNotes}
                  onChange={(event) => setBatchNotes(event.target.value)}
                  placeholder="Observações do lote"
                  className="min-h-[88px] bg-white"
                />
                <Button variant="outline" onClick={() => handleSelectAllVisible(!allVisiblePendingSelected)}>
                  {allVisiblePendingSelected ? "Limpar seleção" : "Selecionar visíveis"}
                </Button>
                <Button onClick={handleBatchApprove} disabled={approveBatchMutation.isPending || !selectedPendingIds.length}>
                  {approveBatchMutation.isPending ? "Aprovando lote..." : `Aprovar ${selectedPendingIds.length || 0} item(ns)`}
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Fila operacional de comissões</h2>
            {pagination ? (
              <p className="text-sm text-slate-500">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </p>
            ) : null}
          </div>

          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={allVisiblePendingSelected}
                    onChange={(event) => handleSelectAllVisible(event.target.checked)}
                    aria-label="Selecionar todas as comissões pendentes visíveis"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-900">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Afiliado</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Nível</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Percentual</th>
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
                    <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
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
                  const isBatchSelectable = commission.status === "pending";
                  const isSelected = selectedPendingIds.includes(commission.id);

                  return (
                    <tr key={commission.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isBatchSelectable && isSelected}
                          disabled={!isBatchSelectable}
                          onChange={(event) => togglePendingSelection(commission.id, event.target.checked)}
                          aria-label={`Selecionar comissão ${commission.id}`}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">#{commission.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div>
                          <p className="font-medium text-slate-900">{commission.affiliateName || `Afiliado #${commission.affiliateId}`}</p>
                          <p className="text-xs text-slate-500">{commission.affiliateCode || `ID ${commission.affiliateId}`}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{commission.level}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatPercent(commission.percentage)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {commission.source}
                        {commission.sourceId ? ` · ${commission.sourceId}` : ""}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">R$ {formatCurrency(commission.amount)}</td>
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
                              status: commission.status,
                              notes: "",
                            })
                          }
                        >
                          Revisar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
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
              <FileSearch size={18} className="text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Revisão da comissão #{selectedCommission.id}</h2>
            </div>

            {detailsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : detailsQuery.data ? (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Afiliado</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {detailsQuery.data.affiliateName || `Afiliado #${detailsQuery.data.affiliateId}`}
                    </p>
                    <p className="text-sm text-slate-500">{detailsQuery.data.affiliateCode || `ID ${detailsQuery.data.affiliateId}`}</p>
                    <p className="mt-2 text-sm text-slate-700">Valor: R$ {formatCurrency(detailsQuery.data.amount)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Origem e regra</p>
                    <p className="mt-2 text-sm text-slate-700">Origem: {detailsQuery.data.source}</p>
                    <p className="text-sm text-slate-700">Referência: {detailsQuery.data.sourceId || "N/A"}</p>
                    <p className="text-sm text-slate-700">Nível: {detailsQuery.data.level}</p>
                    <p className="text-sm text-slate-700">Percentual: {formatPercent(detailsQuery.data.percentage)}</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-violet-700">Resumo de auditoria</p>
                    <p className="mt-2 text-sm text-violet-900">Status atual: {String(detailsQuery.data.auditSummary?.currentStatus || detailsQuery.data.status)}</p>
                    <p className="text-sm text-violet-800">
                      Confirmação: {detailsQuery.data.auditSummary?.confirmedAt ? new Date(detailsQuery.data.auditSummary.confirmedAt).toLocaleString("pt-BR") : "Pendente"}
                    </p>
                    <p className="text-sm text-violet-800">
                      Liquidação: {detailsQuery.data.auditSummary?.paidAt ? new Date(detailsQuery.data.auditSummary.paidAt).toLocaleString("pt-BR") : "Ainda não liquidada"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Descrição operacional</p>
                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {detailsQuery.data.description || "Sem descrição adicional."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Histórico de auditoria</p>
                    {detailsQuery.data.history?.length ? (
                      <div className="space-y-3">
                        {detailsQuery.data.history.map((item, index) => (
                          <div key={`${item.action}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                            <p className="font-medium capitalize text-slate-900">{String(item.action).replaceAll("_", " ")}</p>
                            <p className="text-slate-500">por {item.by}</p>
                            <p className="text-slate-500">{item.at ? new Date(item.at).toLocaleString("pt-BR") : "Sem data"}</p>
                            <p className="mt-1 text-slate-600">{item.notes}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem histórico disponível.</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-end">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                    <Select
                      value={selectedCommission.status}
                      onValueChange={(value: CommissionStatus) =>
                        setSelectedCommission((current) => (current ? { ...current, status: value } : current))
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

                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Observação operacional</p>
                    <Textarea
                      value={selectedCommission.notes}
                      onChange={(event) =>
                        setSelectedCommission((current) => (current ? { ...current, notes: event.target.value } : current))
                      }
                      placeholder="Contexto da atualização de status"
                      className="min-h-[88px]"
                    />
                  </div>
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
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Não foi possível carregar os detalhes da comissão selecionada.
              </div>
            )}
          </Card>
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
